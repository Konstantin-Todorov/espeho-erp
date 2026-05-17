const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

// GET /api/products — list all active product templates
router.get('/', async (req, res) => {
  const { order_type } = req.query;
  try {
    const params = [];
    let where = 'WHERE active = true';
    if (order_type) {
      params.push(order_type);
      where += ` AND order_type = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT * FROM product_templates ${where} ORDER BY sort_order, name`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на каталога' });
  }
});

// POST /api/products — create new template (admin/office)
router.post('/', roleCheck('admin', 'office'), async (req, res) => {
  const { name, order_type, default_description, default_width, default_height, unit_price, notes, sort_order } = req.body;
  if (!name || !order_type) {
    return res.status(400).json({ error: 'Наименованието и типът са задължителни' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO product_templates (name, order_type, default_description, default_width, default_height, unit_price, notes, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, order_type, default_description, default_width || null, default_height || null, unit_price || null, notes, sort_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/products/:id — update template (admin/office)
router.patch('/:id', roleCheck('admin', 'office'), async (req, res) => {
  const { name, order_type, default_description, default_width, default_height, unit_price, notes, sort_order, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE product_templates SET
         name = COALESCE($1, name),
         order_type = COALESCE($2, order_type),
         default_description = COALESCE($3, default_description),
         default_width = COALESCE($4, default_width),
         default_height = COALESCE($5, default_height),
         unit_price = COALESCE($6, unit_price),
         notes = COALESCE($7, notes),
         sort_order = COALESCE($8, sort_order),
         active = COALESCE($9, active)
       WHERE id = $10 RETURNING *`,
      [name, order_type, default_description, default_width, default_height, unit_price, notes, sort_order, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Шаблонът не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// DELETE /api/products/:id — soft delete (admin only)
router.delete('/:id', roleCheck('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE product_templates SET active = false WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Шаблонът не е намерен' });
    res.json({ message: 'Изтрито успешно' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при изтриване' });
  }
});

module.exports = router;
