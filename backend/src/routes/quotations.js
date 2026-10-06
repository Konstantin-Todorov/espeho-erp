const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getSettings, priceLine, sumLines, n } = require('../utils/pricing');
const { stageTemplate } = require('./options');

const STAGES = {
  'стъклопакет':     ['Рязане', 'Миене', 'Сглобяване', 'Заливане'],
  'единично_стъкло': ['Рязане', 'Шлайфане', 'Кантиране'],
  'смесена':         ['Рязане', 'Миене', 'Сглобяване', 'Заливане'],
};

// Prices every quote line the same way as orders. Lines saved before units existed keep their
// old meaning (price per piece) so existing quotes don't change value.
async function priceItems(items) {
  if (!Array.isArray(items)) return null;
  const settings = await getSettings();
  return items
    .filter(it => it && String(it.product_desc || '').trim())
    .map(it => {
      const line = { ...it, uom: it.uom || 'pcs' };
      return { ...line, ...priceLine(line, settings) };
    });
}

const router = express.Router();
router.use(auth, roleCheck('admin', 'office'));

// GET /api/quotations
router.get('/', async (req, res) => {
  const { status, client_id, search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];

  if (status)    { params.push(status);     conds.push(`q.status=$${params.length}`); }
  if (client_id) { params.push(client_id);  conds.push(`q.client_id=$${params.length}`); }
  if (search)    { params.push(`%${search}%`); conds.push(`(c.name ILIKE $${params.length} OR q.quote_number ILIKE $${params.length})`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  try {
    const { rows } = await pool.query(`
      SELECT q.id, q.quote_number, q.status, q.valid_until, q.total_price,
             q.created_at, q.updated_at, q.converted_to,
             jsonb_array_length(q.items) AS items_count,
             c.name AS client_name, c.phone AS client_phone,
             u.name AS created_by_name
      FROM quotations q
      JOIN clients c ON c.id=q.client_id
      JOIN users u ON u.id=q.created_by
      ${where}
      ORDER BY q.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, Math.min(500, +limit || 50), offset]
    );
    const count = await pool.query(`SELECT COUNT(*)::int FROM quotations q JOIN clients c ON c.id=q.client_id ${where}`, params);
    res.json({ data: rows, total: count.rows[0].count, page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане' });
  }
});

// GET /api/quotations/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT q.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
             u.name AS created_by_name
      FROM quotations q
      JOIN clients c ON c.id=q.client_id
      JOIN users u ON u.id=q.created_by
      WHERE q.id=$1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Офертата не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/quotations
router.post('/', async (req, res) => {
  const { client_id, valid_until, notes, items } = req.body;
  if (!client_id) return res.status(400).json({ error: 'Клиентът е задължителен' });

  try {
    const numRes = await pool.query(`SELECT NEXTVAL('quotation_seq') AS n`);
    const quoteNumber = `OFF-${String(numRes.rows[0].n).padStart(4, '0')}`;

    const priced = (await priceItems(items || [])) || [];
    const total = sumLines(priced);

    const { rows } = await pool.query(`
      INSERT INTO quotations (quote_number, client_id, created_by, valid_until, notes, items, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [quoteNumber, client_id, req.user.id, valid_until || null, notes || null,
       JSON.stringify(priced), total.toFixed(2)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/quotations/:id
router.patch('/:id', async (req, res) => {
  const { status, valid_until, notes, items, client_id } = req.body;
  if (items !== undefined && !Array.isArray(items)) return res.status(400).json({ error: 'Невалидни артикули' });
  if (status && !['DRAFT','SENT','REJECTED','EXPIRED'].includes(status)) {
    return res.status(400).json({ error: 'Невалиден статус (приемането става с „Създай поръчка“)' });
  }

  try {
    const existing = await pool.query('SELECT * FROM quotations WHERE id=$1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Не е намерена' });
    if (existing.rows[0].converted_to) return res.status(400).json({ error: 'Офертата вече е конвертирана' });

    const newItems = items !== undefined ? await priceItems(items) : existing.rows[0].items;
    const total = items !== undefined ? sumLines(newItems) : n(existing.rows[0].total_price);

    const { rows } = await pool.query(`
      UPDATE quotations SET
        status=COALESCE($1,status),
        valid_until=CASE WHEN $7::boolean THEN $2::date ELSE valid_until END,
        notes=CASE WHEN $8::boolean THEN $3 ELSE notes END,
        items=COALESCE($4,items), client_id=COALESCE($9,client_id),
        total_price=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *`,
      [status || null, valid_until || null, notes || null,
       items !== undefined ? JSON.stringify(newItems) : null,
       (total || 0).toFixed(2), req.params.id, 'valid_until' in req.body, 'notes' in req.body, client_id || null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// POST /api/quotations/:id/convert — convert to order
router.post('/:id/convert', async (req, res) => {
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const { rows: qRows } = await dbClient.query(
      'SELECT * FROM quotations WHERE id=$1 FOR UPDATE', [req.params.id]
    );
    const q = qRows[0];
    if (!q) { await dbClient.query('ROLLBACK'); return res.status(404).json({ error: 'Не е намерена' }); }
    if (q.converted_to) { await dbClient.query('ROLLBACK'); return res.status(400).json({ error: 'Вече е конвертирана' }); }
    if (q.status === 'REJECTED' || q.status === 'EXPIRED') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: 'Не може да конвертирате отказана/изтекла оферта' });
    }

    const { deadline, is_urgent, delivery_address } = req.body;
    const itemTypes = [...new Set(q.items.map(it => it.product_type).filter(t => STAGES[t]))];
    const order_type = STAGES[req.body.order_type] ? req.body.order_type
      : itemTypes.length === 1 ? itemTypes[0] : itemTypes.length > 1 ? 'смесена' : 'стъклопакет';

    // Create order from quotation
    const orderRes = await dbClient.query(`
      INSERT INTO orders (client_id, order_type, deadline, is_urgent, sale_price,
                          notes, delivery_address, source, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'office',$8) RETURNING *`,
      [q.client_id, order_type, deadline || null,
       is_urgent || false, q.total_price, q.notes, delivery_address || null, req.user.id]
    );
    const order = orderRes.rows[0];

    // Create items
    for (let i = 0; i < q.items.length; i++) {
      const it = q.items[i];
      await dbClient.query(`
        INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price, notes, sort_order,
                                 uom, area_m2, billed_qty, line_total)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [order.id, it.product_type || order_type,
         it.product_desc, n(it.width), n(it.height),
         n(it.qty) || 1, n(it.unit_price), it.notes || null, i,
         it.uom || 'pcs', n(it.area_m2), n(it.billed_qty), n(it.line_total)]
      );
    }

    // Production stages matching the order type
    const configured = await stageTemplate(order_type, dbClient);
    const stages = configured.length ? configured : STAGES[order_type];
    for (let i = 0; i < stages.length; i++) {
      await dbClient.query(
        'INSERT INTO production_stages (order_id, stage_name, stage_order) VALUES ($1,$2,$3)',
        [order.id, stages[i], i + 1]
      );
    }

    await dbClient.query('INSERT INTO order_costs (order_id) VALUES ($1) ON CONFLICT DO NOTHING', [order.id]);

    // Mark quotation as accepted + linked
    await dbClient.query(
      `UPDATE quotations SET status='ACCEPTED', converted_to=$1, updated_at=NOW() WHERE id=$2`,
      [order.id, q.id]
    );

    await dbClient.query('COMMIT');
    res.status(201).json({ order_id: order.id, order_number: order.order_number });
  } catch (err) {
    await dbClient.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    dbClient.release();
  }
});

module.exports = router;
