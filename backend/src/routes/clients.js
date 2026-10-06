const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { canSeeMoney, stripMoney } = require('../utils/financial');

const router = express.Router();
router.use(auth);

// GET /api/clients
router.get('/', async (req, res) => {
  const { search } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 50));
  const params = [];
  let where = '';
  if (search?.trim()) {
    params.push(`%${search.trim()}%`);
    where = `WHERE c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1 OR c.eik ILIKE $1 OR c.city ILIKE $1`;
  }
  const sort = req.query.sort === 'recent'
    ? 'last_order_at DESC NULLS LAST, c.name'
    : req.query.sort === 'orders' ? 'order_count DESC, c.name' : 'c.name';

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

// GET /api/clients/:id — client card with server-side totals and paginated order history
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM clients WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Клиентът не е намерен' });
  const limit = Math.min(200, parseInt(req.query.limit) || 50);

  const [orders, stats] = await Promise.all([
    pool.query(
      `SELECT o.id, o.order_number, o.external_ref, o.status, o.order_type, o.order_category,
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
  const { name, phone, email, address, city, eik, mol, source, notes } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Името е задължително' });
  const { rows } = await pool.query(
    `INSERT INTO clients (name, phone, email, address, city, eik, mol, source, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name.trim(), phone || null, email || null, address || null, city || null, eik || null, mol || null,
     source || 'office', notes || null]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/clients/:id — only keys present in the body change; '' clears a field
const FIELDS = ['name', 'phone', 'email', 'address', 'city', 'eik', 'mol', 'source', 'notes', 'active'];
router.patch('/:id', roleCheck('admin', 'office'), async (req, res) => {
  const sets = [], params = [];
  for (const f of FIELDS) {
    if (!(f in req.body)) continue;
    let v = req.body[f];
    if (f === 'active') v = !!v;
    else if (typeof v === 'string') v = v.trim() || null;
    if (f === 'name' && !v) return res.status(400).json({ error: 'Името е задължително' });
    params.push(v);
    sets.push(`${f}=$${params.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
  params.push(req.params.id);
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
