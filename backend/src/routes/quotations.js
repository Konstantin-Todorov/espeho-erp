const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

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
             c.name AS client_name, c.phone AS client_phone,
             u.name AS created_by_name
      FROM quotations q
      JOIN clients c ON c.id=q.client_id
      JOIN users u ON u.id=q.created_by
      ${where}
      ORDER BY q.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
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

    const total = (items || []).reduce((sum, it) => sum + (Number(it.qty || 1) * Number(it.unit_price || 0)), 0);

    const { rows } = await pool.query(`
      INSERT INTO quotations (quote_number, client_id, created_by, valid_until, notes, items, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [quoteNumber, client_id, req.user.id, valid_until || null, notes || null,
       JSON.stringify(items || []), total.toFixed(2)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/quotations/:id
router.patch('/:id', async (req, res) => {
  const { status, valid_until, notes, items } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM quotations WHERE id=$1', [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Не е намерена' });
    if (existing.rows[0].converted_to) return res.status(400).json({ error: 'Офертата вече е конвертирана' });

    const newItems = items !== undefined ? items : existing.rows[0].items;
    const total = newItems.reduce((sum, it) => sum + (Number(it.qty || 1) * Number(it.unit_price || 0)), 0);

    const { rows } = await pool.query(`
      UPDATE quotations SET
        status=COALESCE($1,status), valid_until=COALESCE($2,valid_until),
        notes=COALESCE($3,notes), items=COALESCE($4,items),
        total_price=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *`,
      [status || null, valid_until || null, notes || null,
       items !== undefined ? JSON.stringify(items) : null,
       total.toFixed(2), req.params.id]
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
      'SELECT * FROM quotations WHERE id=$1', [req.params.id]
    );
    const q = qRows[0];
    if (!q) { await dbClient.query('ROLLBACK'); return res.status(404).json({ error: 'Не е намерена' }); }
    if (q.converted_to) { await dbClient.query('ROLLBACK'); return res.status(400).json({ error: 'Вече е конвертирана' }); }
    if (q.status === 'REJECTED' || q.status === 'EXPIRED') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: 'Не може да конвертирате отказана/изтекла оферта' });
    }

    const { order_type, deadline, is_urgent, delivery_address } = req.body;

    // Create order from quotation
    const orderRes = await dbClient.query(`
      INSERT INTO orders (client_id, order_type, deadline, is_urgent, sale_price,
                          notes, delivery_address, source, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'office',$8) RETURNING *`,
      [q.client_id, order_type || 'стъклопакет', deadline || null,
       is_urgent || false, q.total_price, q.notes, delivery_address || null, req.user.id]
    );
    const order = orderRes.rows[0];

    // Create items
    for (let i = 0; i < q.items.length; i++) {
      const it = q.items[i];
      await dbClient.query(`
        INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price, notes, sort_order)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [order.id, it.product_type || order_type || 'стъклопакет',
         it.product_desc, it.width || null, it.height || null,
         it.qty || 1, it.unit_price || null, it.notes || null, i]
      );
    }

    // Default production stages
    const stages = [
      { name: 'Рязане', order: 1 }, { name: 'Миене', order: 2 },
      { name: 'Сглобяване', order: 3 }, { name: 'Заливане', order: 4 },
    ];
    for (const s of stages) {
      await dbClient.query(
        'INSERT INTO production_stages (order_id, stage_name, stage_order) VALUES ($1,$2,$3)',
        [order.id, s.name, s.order]
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
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при конвертиране' });
  } finally {
    dbClient.release();
  }
});

module.exports = router;
