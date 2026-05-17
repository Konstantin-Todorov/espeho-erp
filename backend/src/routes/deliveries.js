const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const notify = require('../utils/notify');

const router = express.Router();
router.use(auth);

// GET /api/deliveries — list (admin/office)
router.get('/', roleCheck('admin','office'), async (req, res) => {
  const { status, from, to, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];
  if (status) { params.push(status); conds.push(`d.status=$${params.length}`); }
  if (from)   { params.push(from);   conds.push(`d.scheduled_date>=$${params.length}`); }
  if (to)     { params.push(to);     conds.push(`d.scheduled_date<=$${params.length}`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  try {
    const { rows } = await pool.query(`
      SELECT d.*, o.order_number, c.name AS client_name, c.phone AS client_phone,
             u.name AS driver_name_db, cb.name AS created_by_name
      FROM deliveries d
      JOIN orders o ON o.id=d.order_id
      JOIN clients c ON c.id=o.client_id
      LEFT JOIN users u ON u.id=d.driver_id
      LEFT JOIN users cb ON cb.id=d.created_by
      ${where}
      ORDER BY d.scheduled_date ASC NULLS LAST, d.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
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
router.post('/', roleCheck('admin','office'), async (req, res) => {
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

// PATCH /api/deliveries/:id
router.patch('/:id', roleCheck('admin','office'), async (req, res) => {
  const { status, driver_id, driver_name, scheduled_date, address, notes, recipient_name, signature_note } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE deliveries SET
         status=COALESCE($1,status), driver_id=COALESCE($2,driver_id),
         driver_name=COALESCE($3,driver_name), scheduled_date=COALESCE($4,scheduled_date),
         address=COALESCE($5,address), notes=COALESCE($6,notes),
         recipient_name=COALESCE($7,recipient_name),
         signature_note=COALESCE($8,signature_note),
         delivered_at=CASE WHEN $1='DELIVERED' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
         updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [status||null, driver_id||null, driver_name||null, scheduled_date||null,
       address||null, notes||null, recipient_name||null, signature_note||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерена' });

    // If delivered, notify
    if (status === 'DELIVERED') {
      const d = rows[0];
      const orderQ = await pool.query(
        `SELECT o.order_number, c.name AS client_name FROM orders o JOIN clients c ON c.id=o.client_id WHERE o.id=$1`,
        [d.order_id]
      );
      if (orderQ.rows[0]) {
        await notify({
          roles: ['admin','office'],
          type: 'order_delivered',
          title: `Доставена: ${orderQ.rows[0].order_number}`,
          body: `Клиент: ${orderQ.rows[0].client_name}`,
          link: `/orders/${d.order_id}`,
          orderId: d.order_id,
        });
      }
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

module.exports = router;
