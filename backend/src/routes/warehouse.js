const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

// GET /api/warehouse/materials
router.get('/materials', async (req, res) => {
  const { category, search, page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];

  if (category) { params.push(category); conds.push(`m.category=$${params.length}::material_category`); }
  if (search)   { params.push(`%${search}%`); conds.push(`(m.name ILIKE $${params.length} OR m.code ILIKE $${params.length})`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  try {
    const { rows } = await pool.query(`
      SELECT m.*, COALESCE(SUM(s.quantity),0)::numeric AS total_qty,
             json_agg(json_build_object(
               'location_id', l.id, 'location_name', l.name,
               'quantity', s.quantity, 'min_threshold', s.min_threshold,
               'below_threshold', s.quantity < s.min_threshold
             ) ORDER BY l.name) FILTER (WHERE l.id IS NOT NULL) AS stock_by_location
      FROM materials m
      LEFT JOIN stock s ON s.material_id=m.id
      LEFT JOIN locations l ON l.id=s.location_id
      ${where}
      GROUP BY m.id
      ORDER BY m.category, m.name
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на материалите' });
  }
});

// GET /api/warehouse/low-stock — for persistent alert
router.get('/low-stock', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.id, m.name, m.unit, m.category,
             s.quantity, s.min_threshold, l.name AS location_name
      FROM stock s
      JOIN materials m ON m.id=s.material_id
      JOIN locations l ON l.id=s.location_id
      WHERE s.quantity < s.min_threshold AND s.min_threshold > 0
      ORDER BY (s.quantity / NULLIF(s.min_threshold,0)) ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/warehouse/locations
router.get('/locations', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM locations ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/warehouse/locations
router.post('/locations', roleCheck('admin','warehouse'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO locations (name, description) VALUES ($1,$2) RETURNING *`,
      [name, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/warehouse/locations/:id
router.patch('/locations/:id', roleCheck('admin','warehouse'), async (req, res) => {
  const { name, description } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE locations SET name=COALESCE($1,name), description=COALESCE($2,description) WHERE id=$3 RETURNING *`,
      [name||null, description||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Локацията не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// GET /api/warehouse/movements
router.get('/movements', async (req, res) => {
  const { material_id, order_id, movement_type, from, to, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];

  if (material_id)   { params.push(material_id);   conds.push(`sm.material_id=$${params.length}`); }
  if (order_id)      { params.push(order_id);       conds.push(`sm.order_id=$${params.length}`); }
  if (movement_type) { params.push(movement_type);  conds.push(`sm.movement_type=$${params.length}::movement_type`); }
  if (from)          { params.push(from);           conds.push(`sm.created_at>=$${params.length}`); }
  if (to)            { params.push(to);             conds.push(`sm.created_at<=$${params.length}`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  try {
    const { rows } = await pool.query(`
      SELECT sm.*, m.name AS material_name, m.unit, l.name AS location_name,
             o.order_number, u.name AS worker_name
      FROM stock_movements sm
      JOIN materials m ON m.id=sm.material_id
      LEFT JOIN locations l ON l.id=sm.location_id
      LEFT JOIN orders o ON o.id=sm.order_id
      JOIN users u ON u.id=sm.worker_id
      ${where}
      ORDER BY sm.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/warehouse/receive — receive materials
router.post('/receive', roleCheck('admin','warehouse'), async (req, res) => {
  const { material_id, location_id, quantity, unit_price, notes } = req.body;
  if (!material_id || !location_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Всички полета са задължителни' });
  }
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    await dbClient.query(
      `INSERT INTO stock (material_id, location_id, quantity, min_threshold)
       VALUES ($1,$2,$3,0)
       ON CONFLICT (material_id, location_id) DO UPDATE
       SET quantity = stock.quantity + EXCLUDED.quantity, updated_at=NOW()`,
      [material_id, location_id, quantity]
    );

    const { rows } = await dbClient.query(
      `INSERT INTO stock_movements (material_id, location_id, movement_type, quantity, unit_price, worker_id, notes)
       VALUES ($1,$2,'ПОЛУЧЕНО',$3,$4,$5,$6) RETURNING *`,
      [material_id, location_id, quantity, unit_price || 0, req.user.id, notes]
    );

    // Update material price
    if (unit_price) {
      await dbClient.query(
        'UPDATE materials SET price_per_unit=$1, updated_at=NOW() WHERE id=$2',
        [unit_price, material_id]
      );
    }

    await dbClient.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при получаване' });
  } finally {
    dbClient.release();
  }
});

// POST /api/warehouse/issue — issue materials to order
router.post('/issue', roleCheck('admin','warehouse','production'), async (req, res) => {
  const { material_id, location_id, order_id, quantity, notes } = req.body;
  if (!material_id || !order_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Всички полета са задължителни' });
  }
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Check stock
    const stockQ = await dbClient.query(
      'SELECT quantity FROM stock WHERE material_id=$1 AND location_id=$2',
      [material_id, location_id]
    );
    if (!stockQ.rows[0] || stockQ.rows[0].quantity < quantity) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ error: 'Недостатъчна наличност' });
    }

    // Get material price
    const matQ = await dbClient.query(
      'SELECT price_per_unit FROM materials WHERE id=$1', [material_id]
    );
    const unitPrice = matQ.rows[0]?.price_per_unit || 0;
    const totalCost = quantity * unitPrice;

    // Deduct stock
    await dbClient.query(
      `UPDATE stock SET quantity = quantity - $1, updated_at=NOW()
       WHERE material_id=$2 AND location_id=$3`,
      [quantity, material_id, location_id]
    );

    // Log movement
    const { rows } = await dbClient.query(
      `INSERT INTO stock_movements (material_id, location_id, order_id, movement_type, quantity, unit_price, worker_id, notes)
       VALUES ($1,$2,$3,'ИЗПИСАНО',$4,$5,$6,$7) RETURNING *`,
      [material_id, location_id, order_id, quantity, unitPrice, req.user.id, notes]
    );

    // Update order costs
    await dbClient.query(
      `UPDATE order_costs SET material_cost = material_cost + $1, updated_at=NOW()
       WHERE order_id=$2`,
      [totalCost.toFixed(2), order_id]
    );

    await dbClient.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при изписване' });
  } finally {
    dbClient.release();
  }
});

// POST /api/warehouse/materials — create new material
router.post('/materials', roleCheck('admin','warehouse'), async (req, res) => {
  const { name, code, category, unit, price_per_unit, description } = req.body;
  if (!name || !unit || !category) {
    return res.status(400).json({ error: 'Назованието, единицата и категорията са задължителни' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO materials (name, code, category, unit, price_per_unit, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, code, category, unit, price_per_unit || 0, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Кодът вече съществува' });
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/warehouse/materials/:id — update material
router.patch('/materials/:id', roleCheck('admin','warehouse'), async (req, res) => {
  const { name, code, category, unit, price_per_unit, description, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE materials SET name=COALESCE($1,name), code=COALESCE($2,code),
       category=COALESCE($3::material_category,category), unit=COALESCE($4,unit),
       price_per_unit=COALESCE($5,price_per_unit), description=COALESCE($6,description),
       active=COALESCE($7,active), updated_at=NOW() WHERE id=$8 RETURNING *`,
      [name, code, category, unit, price_per_unit, description, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при обновяване на материала' });
  }
});

// DELETE /api/warehouse/materials/:id — soft delete (set active=false)
router.delete('/materials/:id', roleCheck('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE materials SET active=false, updated_at=NOW() WHERE id=$1 RETURNING id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерен' });
    res.json({ message: 'Материалът е деактивиран' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при изтриване' });
  }
});

// PATCH /api/warehouse/stock/:materialId/:locationId — update threshold
router.patch('/stock/:materialId/:locationId', roleCheck('admin','warehouse'), async (req, res) => {
  const { min_threshold } = req.body;
  try {
    await pool.query(
      `UPDATE stock SET min_threshold=$1, updated_at=NOW()
       WHERE material_id=$2 AND location_id=$3`,
      [min_threshold, req.params.materialId, req.params.locationId]
    );
    res.json({ message: 'Обновено' });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

module.exports = router;
