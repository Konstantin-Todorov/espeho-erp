const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { canSeeMoney, stripMoney } = require('../utils/financial');
const registry = require('../utils/registry');

const router = express.Router();
router.use(auth);

// GET /api/clients
router.get('/', async (req, res) => {
  const { search } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 50));
  const params = [];
  const conds = [];
  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    conds.push(`(c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1 OR c.eik ILIKE $1 OR c.city ILIKE $1)`);
  }
  // Clients whose card still needs completing
  if (req.query.favorites === '1') conds.push('c.is_favorite = true');
  if (req.query.missing === 'eik') conds.push(`c.eik IS NULL AND c.name <> 'КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)'`);
  if (req.query.missing === 'phone') conds.push(`c.phone IS NULL AND c.name <> 'КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)'`);
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  // Favorites always come first, then the chosen order
  const sort = 'c.is_favorite DESC, ' + (req.query.sort === 'recent'
    ? 'last_order_at DESC NULLS LAST, c.name'
    : req.query.sort === 'orders' ? 'order_count DESC, c.name' : 'c.name');

  const [data, count] = await Promise.all([
    pool.query(
      `SELECT c.*, COUNT(o.id)::int AS order_count, MAX(o.created_at) AS last_order_at
       FROM clients c LEFT JOIN orders o ON o.client_id = c.id
       ${where}
       GROUP BY c.id ORDER BY ${sort}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]),
    pool.query(`SELECT COUNT(*)::int FROM clients c ${where}`, params),
  ]);
  res.json({ data: data.rows, total: count.rows[0].count, page, limit });
});

// GET /api/clients/lookup?q=ВАЛМАН | 123686958 — candidates from Търговски регистър (admin/office).
// A name can match several companies, so each candidate carries city and manager to choose the right one.
router.get('/lookup', roleCheck('admin', 'office'), async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  try {
    if (/^\d{9}(\d{4})?$/.test(q)) {
      const one = await registry.getByEik(q);
      return res.json(one ? [one] : []);
    }
    // The register rate-limits requests, so only the list is returned here; details load when one is picked
    const norm = registry.normName;
    const hits = (await registry.searchByName(q)).filter(h => !h.deleted);
    hits.sort((a, b) => (norm(b.name) === norm(q)) - (norm(a.name) === norm(q)));
    res.json(hits.slice(0, 10).map(h => ({ ...h, exact: norm(h.name) === norm(q) })));
  } catch (err) {
    res.status(err.busy ? 429 : 502).json({ error: err.busy
      ? 'Търговският регистър ограничава честите заявки — опитайте отново след минута.'
      : 'Търговският регистър не отговаря в момента. Опитайте след малко.' });
  }
});

// GET /api/clients/lookup/:eik — full record + VAT registration (VIES)
router.get('/lookup/:eik', roleCheck('admin', 'office'), async (req, res) => {
  if (!/^\d{9}(\d{4})?$/.test(req.params.eik)) return res.status(400).json({ error: 'Невалиден ЕИК' });
  try {
    const [rec, vat] = await Promise.all([registry.getByEik(req.params.eik), registry.vies(req.params.eik)]);
    if (!rec) return res.status(404).json({ error: 'Няма фирма с този ЕИК' });
    res.json({ ...rec, ...vat });
  } catch (err) {
    res.status(err.busy ? 429 : 502).json({ error: err.busy
      ? 'Търговският регистър ограничава честите заявки — опитайте отново след минута.'
      : 'Търговският регистър не отговаря в момента. Опитайте след малко.' });
  }
});

// ─── Register match proposals (created by scripts/suggest_registry_matches.js) ─────
// GET /api/clients/registry-suggestions?status=pending
router.get('/registry-suggestions', roleCheck('admin', 'office'), async (req, res) => {
  const status = ['pending', 'accepted', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const { rows } = await pool.query(
    `SELECT s.*, c.name AS client_name, c.eik AS client_eik, c.phone AS client_phone, c.email AS client_email,
            c.address AS client_address, c.mol AS client_mol,
            (SELECT COUNT(*) FROM orders o WHERE o.client_id = c.id)::int AS orders,
            (SELECT COALESCE(SUM(sale_price),0) FROM orders o WHERE o.client_id = c.id)::numeric(12,2) AS turnover
     FROM client_registry_suggestions s JOIN clients c ON c.id = s.client_id
     WHERE s.status = $1
     ORDER BY CASE s.confidence WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END, turnover DESC`,
    [status]);
  res.json(rows);
});

// Fill a client card from a register record: empty fields only (ЕИК/ДДС/official name always)
async function applyRecord(db, clientId, rec) {
  const { rows: [c] } = await db.query('SELECT * FROM clients WHERE id=$1', [clientId]);
  const set = { eik: rec.eik, vat_number: rec.vat_number || c.vat_number, legal_name: rec.full_name || c.legal_name };
  for (const [k, v] of [['mol', rec.manager], ['address', rec.address], ['city', rec.city], ['phone', rec.phone],
                        ['email', rec.email], ['website', rec.website]]) {
    if (v && !c[k]) set[k] = v;
  }
  const keys = Object.keys(set);
  await db.query(
    `UPDATE clients SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(', ')}, registry_checked_at=NOW(), updated_at=NOW()
     WHERE id=$${keys.length + 1}`, [...keys.map(k => set[k]), clientId]);
}

// POST /api/clients/registry-suggestions/:sid/accept  { eik? } — accept the proposal (or one of the alternatives)
router.post('/registry-suggestions/:sid/accept', roleCheck('admin', 'office'), async (req, res) => {
  const { rows: [s] } = await pool.query('SELECT * FROM client_registry_suggestions WHERE id=$1', [req.params.sid]);
  if (!s) return res.status(404).json({ error: 'Предложението не е намерено' });
  let rec = s.candidate;
  if (req.body.eik && req.body.eik !== rec?.eik) {
    try {
      rec = { ...(await registry.getByEik(req.body.eik)), ...(await registry.vies(req.body.eik)) };
    } catch (err) {
      return res.status(err.busy ? 429 : 502).json({ error: 'Търговският регистър не отговаря — опитайте след малко.' });
    }
  }
  if (!rec?.eik) return res.status(400).json({ error: 'Няма избрана фирма' });
  await applyRecord(pool, s.client_id, rec);
  await pool.query(`UPDATE client_registry_suggestions SET status='accepted', decided_by=$1, decided_at=NOW() WHERE id=$2`,
    [req.user.id, s.id]);
  res.json({ ok: true });
});

// POST /api/clients/registry-suggestions/:sid/reject
router.post('/registry-suggestions/:sid/reject', roleCheck('admin', 'office'), async (req, res) => {
  const { rowCount } = await pool.query(
    `UPDATE client_registry_suggestions SET status=$3, decided_by=$1, decided_at=NOW() WHERE id=$2`,
    [req.user.id, req.params.sid, req.body?.filled_manually ? 'accepted' : 'rejected']);
  if (!rowCount) return res.status(404).json({ error: 'Предложението не е намерено' });
  res.json({ ok: true });
});

// GET /api/clients/:id — client card with server-side totals and paginated order history
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clients WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Клиентът не е намерен' });
  const limit = Math.min(200, parseInt(req.query.limit) || 50);

  const [orders, stats] = await Promise.all([
    pool.query(
      `SELECT o.id, o.order_number, o.external_ref, o.client_ref, o.status, o.order_type, o.order_category,
              o.payment_status, o.deadline, o.sale_price, o.is_urgent, o.created_at, o.delivered_at
       FROM orders o WHERE o.client_id=$1 ORDER BY o.created_at DESC, o.order_number DESC LIMIT $2`,
      [req.params.id, limit]),
    pool.query(
      `SELECT COUNT(*)::int AS total_orders,
              COUNT(*) FILTER (WHERE status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА'))::int AS active_orders,
              COUNT(*) FILTER (WHERE status = 'ДОСТАВЕНА')::int AS delivered_orders,
              COALESCE(SUM(sale_price) FILTER (WHERE status = 'ДОСТАВЕНА' AND order_category = 'нормална'),0)::numeric(12,2) AS total_revenue,
              COALESCE(AVG(sale_price) FILTER (WHERE status = 'ДОСТАВЕНА' AND order_category = 'нормална' AND sale_price > 0),0)::numeric(12,2) AS avg_order_value,
              COALESCE(SUM(sale_price - COALESCE((SELECT SUM(amount) FROM payments p WHERE p.order_id = o.id),0))
                FILTER (WHERE payment_status <> 'платена' AND status = 'ДОСТАВЕНА' AND order_category = 'нормална'),0)::numeric(12,2) AS unpaid_amount,
              MIN(created_at) AS first_order_at, MAX(created_at) AS last_order_at
       FROM orders o WHERE client_id=$1`, [req.params.id]),
  ]);

  const s = stats.rows[0];
  if (!canSeeMoney(req.user)) { delete s.total_revenue; delete s.avg_order_value; delete s.unpaid_amount; }
  res.json({ ...rows[0], stats: s, orders: stripMoney(req.user, orders.rows) });
});

// GET /api/clients/:id/prices — what this client has paid per product (last price, how often, range)
router.get('/:id/prices', roleCheck('admin', 'office'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (UPPER(oi.product_desc), oi.uom)
            oi.product_desc, oi.uom, oi.unit_price AS last_price, o.created_at AS last_date,
            o.id AS last_order_id, o.external_ref, o.order_number,
            COUNT(*) OVER (PARTITION BY UPPER(oi.product_desc), oi.uom) AS times,
            MIN(oi.unit_price) OVER (PARTITION BY UPPER(oi.product_desc), oi.uom) AS min_price,
            MAX(oi.unit_price) OVER (PARTITION BY UPPER(oi.product_desc), oi.uom) AS max_price
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.client_id = $1 AND oi.unit_price > 0 AND o.order_category = 'нормална'
     ORDER BY UPPER(oi.product_desc), oi.uom, o.created_at DESC`, [req.params.id]);
  res.json(rows.sort((a, b) => b.times - a.times || new Date(b.last_date) - new Date(a.last_date)));
});

// POST /api/clients
router.post('/', roleCheck('admin', 'office'), async (req, res) => {
  const { name, phone, email, address, city, eik, mol, source, notes, vat_number, website, legal_name, registry_checked_at } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Името е задължително' });
  const { rows } = await pool.query(
    `INSERT INTO clients (name, phone, email, address, city, eik, mol, source, notes, vat_number, website, legal_name, registry_checked_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [name.trim(), phone || null, email || null, address || null, city || null, eik || null, mol || null,
     source || 'office', notes || null, vat_number || null, website || null, legal_name || null,
     registry_checked_at ? new Date() : null]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/clients/:id — only keys present in the body change; '' clears a field
const FIELDS = ['name', 'phone', 'email', 'address', 'city', 'eik', 'mol', 'source', 'notes', 'active', 'is_favorite',
  'vat_number', 'website', 'legal_name', 'registry_checked_at'];
router.patch('/:id', roleCheck('admin', 'office'), async (req, res) => {
  const sets = [], params = [];
  for (const f of FIELDS) {
    if (!(f in req.body)) continue;
    let v = req.body[f];
    if (f === 'active' || f === 'is_favorite') v = !!v;
    else if (f === 'registry_checked_at') v = v ? new Date() : null;
    else if (typeof v === 'string') v = v.trim() || null;
    if (f === 'name' && !v) return res.status(400).json({ error: 'Името е задължително' });
    params.push(v);
    sets.push(`${f}=$${params.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
  params.push(req.params.id);
  if ('name' in req.body) {
    await pool.query(
      `INSERT INTO client_aliases (name_key, client_id)
       SELECT UPPER(REGEXP_REPLACE(TRIM(name), '\\s+', ' ', 'g')), id FROM clients WHERE id=$1
       ON CONFLICT (name_key) DO UPDATE SET client_id = EXCLUDED.client_id`, [req.params.id]);
  }
  const { rows } = await pool.query(
    `UPDATE clients SET ${sets.join(', ')}, updated_at=NOW() WHERE id=$${params.length} RETURNING *`, params);
  if (!rows[0]) return res.status(404).json({ error: 'Клиентът не е намерен' });
  res.json(rows[0]);
});

// POST /api/clients/:id/merge — move all orders/quotations of duplicate clients into this one, then delete them.
// Body: { from_ids: [uuid, ...] }. Admin & office.
router.post('/:id/merge', roleCheck('admin', 'office'), async (req, res) => {
  const fromIds = (req.body.from_ids || []).filter(id => id && id !== req.params.id);
  if (!fromIds.length) return res.status(400).json({ error: 'Изберете клиенти за обединяване' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [target] } = await client.query('SELECT * FROM clients WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!target) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Клиентът не е намерен' }); }
    const { rows: sources } = await client.query('SELECT * FROM clients WHERE id = ANY($1) FOR UPDATE', [fromIds]);
    // Fill empty contact fields on the target from the duplicates
    for (const f of ['phone', 'email', 'address', 'city', 'eik', 'mol']) {
      const v = sources.map(s => s[f]).find(Boolean);
      if (!target[f] && v) await client.query(`UPDATE clients SET ${f}=$1 WHERE id=$2`, [v, target.id]);
    }
    // Remember the duplicates' names so future spreadsheet imports land on this client
    await client.query(
      `INSERT INTO client_aliases (name_key, client_id)
       SELECT UPPER(REGEXP_REPLACE(TRIM(name), '\\s+', ' ', 'g')), $1 FROM clients WHERE id = ANY($2)
       ON CONFLICT (name_key) DO UPDATE SET client_id = EXCLUDED.client_id`, [target.id, fromIds]);
    await client.query('UPDATE client_aliases SET client_id=$1 WHERE client_id = ANY($2)', [target.id, fromIds]);
    // keep_as_ref: the duplicates were sites/stages/branches of this client ("ВАЛМАН-ЕТАП 1") — the part of
    // the old name after the client's name becomes the order's client reference
    if (req.body.keep_as_ref) {
      await client.query(
        `UPDATE orders o SET client_ref = COALESCE(o.client_ref, NULLIF(TRIM(BOTH ' -.' FROM
            CASE WHEN UPPER(c.name) LIKE UPPER($1) || '%' THEN SUBSTRING(c.name FROM LENGTH($1) + 1) ELSE c.name END), ''))
         FROM clients c WHERE c.id = o.client_id AND o.client_id = ANY($2)`, [target.name, fromIds]);
    }
    const moved = await client.query('UPDATE orders SET client_id=$1 WHERE client_id = ANY($2)', [target.id, fromIds]);
    await client.query('UPDATE quotations SET client_id=$1 WHERE client_id = ANY($2)', [target.id, fromIds]);
    await client.query('DELETE FROM clients WHERE id = ANY($1)', [fromIds]);
    await client.query('COMMIT');
    res.json({ ok: true, merged: sources.length, orders_moved: moved.rowCount });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
});

module.exports = router;
