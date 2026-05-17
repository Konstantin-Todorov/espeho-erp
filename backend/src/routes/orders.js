const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

const STAGE_TEMPLATES = {
  'стъклопакет':      [{ name: 'Рязане', order: 1 }, { name: 'Миене', order: 2 }, { name: 'Сглобяване', order: 3 }, { name: 'Заливане', order: 4 }],
  'единично_стъкло':  [{ name: 'Рязане', order: 1 }, { name: 'Шлайфане', order: 2 }, { name: 'Кантиране', order: 3 }],
  'смесена':          [{ name: 'Рязане', order: 1 }, { name: 'Миене', order: 2 }, { name: 'Сглобяване', order: 3 }, { name: 'Заливане', order: 4 }],
};

// GET /api/orders
router.get('/', async (req, res) => {
  const { status, client_id, urgent, from, to, search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];

  if (status)    { params.push(status);     conditions.push(`o.status = $${params.length}::order_status`); }
  if (client_id) { params.push(client_id);  conditions.push(`o.client_id = $${params.length}`); }
  if (urgent === 'true') conditions.push(`o.is_urgent = true`);
  if (from)      { params.push(from);       conditions.push(`o.created_at >= $${params.length}`); }
  if (to)        { params.push(to);         conditions.push(`o.created_at <= $${params.length}`); }
  if (search)    { params.push(`%${search}%`); conditions.push(`(c.name ILIKE $${params.length} OR o.order_number::text ILIKE $${params.length})`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const query = `
      SELECT o.id, o.order_number, o.status, o.order_type, o.deadline, o.is_urgent,
             o.created_at, o.updated_at,
             c.id AS client_id, c.name AS client_name, c.phone AS client_phone,
             u.name AS created_by_name,
             oc.total_cost,
             CASE WHEN req.user_role IN ('admin','office') THEN o.sale_price ELSE NULL END AS sale_price,
             (SELECT COUNT(*) FROM defects d WHERE d.order_id = o.id AND d.decision IS NULL) AS open_defects
      FROM orders o
      JOIN clients c ON c.id = o.client_id
      JOIN users u ON u.id = o.created_by
      LEFT JOIN order_costs oc ON oc.order_id = o.id
      CROSS JOIN (SELECT $${params.length + 1}::text AS user_role) req
      ${where}
      ORDER BY o.is_urgent DESC, o.deadline ASC NULLS LAST, o.created_at DESC
      LIMIT $${params.length + 2} OFFSET $${params.length + 3}`;

    params.push(req.user.role, limit, offset);

    const countQuery = `
      SELECT COUNT(*)::int FROM orders o
      JOIN clients c ON c.id = o.client_id
      ${where}`;

    const [data, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -3)),
    ]);
    res.json({ data: data.rows, total: count.rows[0].count, page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на поръчките' });
  }
});

// GET /api/orders/:id — full detail
router.get('/:id', async (req, res) => {
  try {
    const orderQ = await pool.query(
      `SELECT o.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
              u.name AS created_by_name
       FROM orders o
       JOIN clients c ON c.id = o.client_id
       JOIN users u ON u.id = o.created_by
       WHERE o.id=$1`, [req.params.id]
    );
    if (!orderQ.rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });

    const [items, stages, costs, defects, files, labor] = await Promise.all([
      pool.query('SELECT * FROM order_items WHERE order_id=$1 ORDER BY sort_order', [req.params.id]),
      pool.query(`SELECT ps.*, u.name AS worker_name, m.name AS machine_name
                  FROM production_stages ps
                  LEFT JOIN users u ON u.id = ps.assigned_to
                  LEFT JOIN machines m ON m.id = ps.machine_id
                  WHERE ps.order_id=$1 ORDER BY ps.stage_order`, [req.params.id]),
      pool.query('SELECT * FROM order_costs WHERE order_id=$1', [req.params.id]),
      pool.query(`SELECT d.*, u.name AS worker_name, m.name AS machine_name
                  FROM defects d
                  LEFT JOIN users u ON u.id = d.worker_id
                  LEFT JOIN machines m ON m.id = d.machine_id
                  WHERE d.order_id=$1 ORDER BY d.created_at DESC`, [req.params.id]),
      pool.query(`SELECT f.*, u.name AS uploaded_by_name
                  FROM order_files f JOIN users u ON u.id = f.uploaded_by
                  WHERE f.order_id=$1 ORDER BY f.created_at DESC`, [req.params.id]),
      pool.query(`SELECT ll.*, u.name AS worker_name
                  FROM labor_logs ll JOIN users u ON u.id = ll.worker_id
                  WHERE ll.order_id=$1 ORDER BY ll.logged_at DESC`, [req.params.id]),
    ]);

    const order = orderQ.rows[0];
    // Hide financial data from production workers
    if (req.user.role === 'production') {
      delete order.sale_price;
      if (costs.rows[0]) {
        delete costs.rows[0].material_cost;
        delete costs.rows[0].labor_cost;
        delete costs.rows[0].machine_cost;
        delete costs.rows[0].total_cost;
      }
    }

    res.json({
      ...order,
      items: items.rows,
      stages: stages.rows,
      costs: costs.rows[0] || null,
      defects: defects.rows,
      files: files.rows,
      labor: labor.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/orders
router.post('/', roleCheck('admin','office'), async (req, res) => {
  const { client_id, order_type, deadline, is_urgent, sale_price, notes, delivery_address, source, items } = req.body;
  if (!client_id || !order_type) {
    return res.status(400).json({ error: 'Клиентът и типът са задължителни' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `INSERT INTO orders (client_id, order_type, deadline, is_urgent, sale_price, notes,
                           delivery_address, source, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [client_id, order_type, deadline, is_urgent || false, sale_price, notes,
       delivery_address, source || 'office', req.user.id]
    );
    const order = orderRes.rows[0];

    // Create order items
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await client.query(
          `INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price, notes, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [order.id, it.product_type || order_type, it.product_desc, it.width, it.height,
           it.qty || 1, it.unit_price, it.notes, i]
        );
      }
    }

    // Create production stages
    const stages = STAGE_TEMPLATES[order_type] || STAGE_TEMPLATES['стъклопакет'];
    for (const stage of stages) {
      await client.query(
        `INSERT INTO production_stages (order_id, stage_name, stage_order) VALUES ($1,$2,$3)`,
        [order.id, stage.name, stage.order]
      );
    }

    // Initialize cost card
    await client.query(
      `INSERT INTO order_costs (order_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [order.id]
    );

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване на поръчка' });
  } finally {
    client.release();
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', roleCheck('admin','office','production'), async (req, res) => {
  const { status, notes } = req.body;
  const validTransitions = {
    'НОВА':         ['МАТЕРИАЛИ','ОТКАЗАНА'],
    'МАТЕРИАЛИ':    ['ПРОИЗВОДСТВО','НОВА','ОТКАЗАНА'],
    'ПРОИЗВОДСТВО': ['ГОТОВА','ОТКАЗАНА'],
    'ГОТОВА':       ['ДОСТАВЕНА'],
    'ДОСТАВЕНА':    [],
    'ОТКАЗАНА':     [],
  };

  try {
    const { rows } = await pool.query('SELECT status FROM orders WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });

    const current = rows[0].status;
    const allowed = validTransitions[current] || [];

    // Admin can override transitions
    if (req.user.role !== 'admin' && !allowed.includes(status)) {
      return res.status(400).json({ error: `Не може да се премине от ${current} към ${status}` });
    }

    const { rows: updated } = await pool.query(
      `UPDATE orders SET status=$1::order_status, notes=COALESCE($2,notes),
       updated_by=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [status, notes, req.user.id, req.params.id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при обновяване на статус' });
  }
});

// PATCH /api/orders/:id — general update
router.patch('/:id', roleCheck('admin','office'), async (req, res) => {
  const { client_id, deadline, is_urgent, sale_price, notes, delivery_address, source } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE orders SET
         client_id=COALESCE($1,client_id), deadline=COALESCE($2,deadline),
         is_urgent=COALESCE($3,is_urgent), sale_price=COALESCE($4,sale_price),
         notes=COALESCE($5,notes), delivery_address=COALESCE($6,delivery_address),
         source=COALESCE($7,source), updated_by=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [client_id, deadline, is_urgent, sale_price, notes, delivery_address, source, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

module.exports = router;
