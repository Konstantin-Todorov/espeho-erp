const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const notify = require('../utils/notify');

const router = express.Router();
router.use(auth);

// GET /api/deliveries — list (admin/office)
router.get('/', roleCheck('admin','office','warehouse'), async (req, res) => {
  const { status, from, to, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];
  if (status) { params.push(status); conds.push(`d.status=$${params.length}`); }
  if (from)   { params.push(from);   conds.push(`d.scheduled_date>=$${params.length}`); }
  if (to)     { params.push(to);     conds.push(`d.scheduled_date<=$${params.length}::date`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  try {
    const { rows } = await pool.query(`
      SELECT d.*, o.order_number, o.external_ref, o.status AS order_status, c.name AS client_name, c.phone AS client_phone,
             u.name AS driver_name_db, cb.name AS created_by_name
      FROM deliveries d
      JOIN orders o ON o.id=d.order_id
      JOIN clients c ON c.id=o.client_id
      LEFT JOIN users u ON u.id=d.driver_id
      LEFT JOIN users cb ON cb.id=d.created_by
      ${where}
      ORDER BY d.scheduled_date ASC NULLS LAST, d.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, Math.min(500, +limit || 50), offset]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/deliveries/order/:orderId
router.get('/order/:orderId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, u.name AS driver_name_db FROM deliveries d LEFT JOIN users u ON u.id=d.driver_id
       WHERE d.order_id=$1 ORDER BY d.created_at DESC`,
      [req.params.orderId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/deliveries
router.post('/', roleCheck('admin','office','warehouse'), async (req, res) => {
  const { order_id, driver_id, driver_name, scheduled_date, address, notes } = req.body;
  if (!order_id) return res.status(400).json({ error: 'Поръчката е задължителна' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO deliveries (order_id, driver_id, driver_name, scheduled_date, address, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [order_id, driver_id || null, driver_name || null, scheduled_date || null,
       address || null, notes || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/deliveries/:id — only keys present in the body change.
// Marking a delivery DELIVERED also hands the order over (ДОСТАВЕНА) if it was ready.
const FIELDS = ['status','driver_id','driver_name','scheduled_date','address','notes','recipient_name','signature_note'];
router.patch('/:id', roleCheck('admin','office','warehouse'), async (req, res) => {
  const { status } = req.body;
  if (status && !['PENDING','IN_TRANSIT','DELIVERED','FAILED'].includes(status)) {
    return res.status(400).json({ error: 'Невалиден статус' });
  }
  const sets = [], params = [];
  for (const f of FIELDS) {
    if (!(f in req.body)) continue;
    params.push(req.body[f] === '' ? null : req.body[f]);
    sets.push(`${f}=$${params.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
  if (status === 'DELIVERED') sets.push('delivered_at=COALESCE(delivered_at, NOW())');
  params.push(req.params.id);

  const db = await pool.connect();
  let d, order;
  try {
    await db.query('BEGIN');
    ({ rows: [d] } = await db.query(
      `UPDATE deliveries SET ${sets.join(', ')}, updated_at=NOW() WHERE id=$${params.length} RETURNING *`, params));
    if (!d) { await db.query('ROLLBACK'); return res.status(404).json({ error: 'Не е намерена' }); }
    if (status === 'DELIVERED') {
      ({ rows: [order] } = await db.query(
        `UPDATE orders o SET status='ДОСТАВЕНА', delivered_at=COALESCE(o.delivered_at, NOW()), updated_by=$2, updated_at=NOW(),
                installation_status = CASE WHEN o.fulfillment='монтаж' AND o.installation_status IS NULL THEN 'ЗА_МОНТАЖ' ELSE o.installation_status END
         WHERE o.id=$1 AND o.status IN ('ГОТОВА','ПРОИЗВОДСТВО')
         RETURNING o.id, o.order_number, o.external_ref, (SELECT name FROM clients WHERE id=o.client_id) AS client_name`,
        [d.order_id, req.user.id]));
      if (order) {
        await db.query(`INSERT INTO order_comments (order_id, user_id, message) VALUES ($1,$2,'Статус: → ДОСТАВЕНА (доставката е отбелязана като доставена)')`,
          [d.order_id, req.user.id]);
      }
    }
    await db.query('COMMIT');
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    db.release();
  }

  if (order) {
    await notify({ roles: ['admin','office'], type: 'order_delivered',
      title: `Доставена: ${order.external_ref || '#' + order.order_number}`, body: `Клиент: ${order.client_name}`,
      link: `/orders/${d.order_id}`, orderId: d.order_id });
  }
  res.json(d);
});

module.exports = router;
