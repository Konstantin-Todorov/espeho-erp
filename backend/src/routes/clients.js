const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

// GET /api/clients
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = `SELECT c.*, COUNT(o.id)::int AS order_count
                 FROM clients c LEFT JOIN orders o ON o.client_id = c.id`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1`;
    }
    query += ` GROUP BY c.id ORDER BY c.name LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);

    const countQ = search
      ? `SELECT COUNT(*)::int FROM clients WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*)::int FROM clients`;
    const countParams = search ? [`%${search}%`] : [];

    const [data, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQ, countParams),
    ]);
    res.json({ data: data.rows, total: count.rows[0].count, page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на клиентите' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Клиентът не е намерен' });

    const orders = await pool.query(
      `SELECT o.id, o.order_number, o.status, o.order_type, o.deadline, o.sale_price,
              o.is_urgent, o.created_at
       FROM orders o WHERE o.client_id=$1 ORDER BY o.created_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json({ ...rows[0], orders: orders.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/clients
router.post('/', roleCheck('admin','office'), async (req, res) => {
  const { name, phone, email, address, city, eik, mol, source, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO clients (name, phone, email, address, city, eik, mol, source, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, phone, email, address, city, eik, mol, source || 'office', notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при създаване на клиент' });
  }
});

// PATCH /api/clients/:id
router.patch('/:id', roleCheck('admin','office'), async (req, res) => {
  const { name, phone, email, address, city, eik, mol, source, notes, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clients SET
         name=COALESCE($1,name), phone=COALESCE($2,phone), email=COALESCE($3,email),
         address=COALESCE($4,address), city=COALESCE($5,city), eik=COALESCE($6,eik),
         mol=COALESCE($7,mol), source=COALESCE($8,source), notes=COALESCE($9,notes),
         active=COALESCE($10,active), updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, phone, email, address, city, eik, mol, source, notes, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Клиентът не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

module.exports = router;
