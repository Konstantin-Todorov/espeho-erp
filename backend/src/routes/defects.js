const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

// GET /api/defects
router.get('/', async (req, res) => {
  const { order_id, worker_id, from, to, cause_type, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conds = [];

  if (order_id)   { params.push(order_id);   conds.push(`d.order_id=$${params.length}`); }
  if (worker_id)  { params.push(worker_id);   conds.push(`d.worker_id=$${params.length}`); }
  if (cause_type) { params.push(cause_type);  conds.push(`d.cause_type=$${params.length}::defect_cause`); }
  if (from)       { params.push(from);        conds.push(`d.created_at>=$${params.length}`); }
  if (to)         { params.push(to);          conds.push(`d.created_at<=$${params.length}`); }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  try {
    const { rows } = await pool.query(`
      SELECT d.*, o.order_number,
             u.name AS worker_name, m.name AS machine_name,
             ru.name AS resolved_by_name,
             ps.stage_name
      FROM defects d
      JOIN orders o ON o.id = d.order_id
      JOIN users u ON u.id = d.worker_id
      LEFT JOIN machines m ON m.id = d.machine_id
      LEFT JOIN users ru ON ru.id = d.resolved_by
      LEFT JOIN production_stages ps ON ps.id = d.stage_id
      ${where}
      ORDER BY d.created_at DESC
      LIMIT $${params.length+1} OFFSET $${params.length+2}`,
      [...params, limit, offset]
    );

    const countQ = await pool.query(
      `SELECT COUNT(*)::int FROM defects d ${where}`, params
    );
    res.json({ data: rows, total: countQ.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на брак' });
  }
});

// GET /api/defects/summary — monthly stats
router.get('/summary', roleCheck('admin','office'), async (req, res) => {
  const { from, to } = req.query;
  try {
    const [byCause, byWorker, byMachine, totals] = await Promise.all([
      pool.query(`
        SELECT cause_type, COUNT(*)::int AS count,
               SUM(total_cost)::numeric(10,2) AS total_cost
        FROM defects
        WHERE ($1::date IS NULL OR created_at>=$1) AND ($2::date IS NULL OR created_at<=$2)
        GROUP BY cause_type ORDER BY total_cost DESC`, [from||null, to||null]),
      pool.query(`
        SELECT u.name, COUNT(d.id)::int AS count,
               SUM(d.total_cost)::numeric(10,2) AS total_cost
        FROM defects d JOIN users u ON u.id=d.worker_id
        WHERE ($1::date IS NULL OR d.created_at>=$1) AND ($2::date IS NULL OR d.created_at<=$2)
        GROUP BY u.id, u.name ORDER BY total_cost DESC`, [from||null, to||null]),
      pool.query(`
        SELECT m.name, COUNT(d.id)::int AS count,
               SUM(d.total_cost)::numeric(10,2) AS total_cost
        FROM defects d JOIN machines m ON m.id=d.machine_id
        WHERE d.machine_id IS NOT NULL
          AND ($1::date IS NULL OR d.created_at>=$1) AND ($2::date IS NULL OR d.created_at<=$2)
        GROUP BY m.id, m.name ORDER BY total_cost DESC`, [from||null, to||null]),
      pool.query(`
        SELECT COUNT(*)::int AS total_count,
               SUM(total_cost)::numeric(10,2) AS total_cost,
               SUM(CASE WHEN decision='преработка' THEN 1 ELSE 0 END)::int AS remake_count,
               SUM(CASE WHEN decision='отписване' THEN 1 ELSE 0 END)::int AS writeoff_count
        FROM defects
        WHERE ($1::date IS NULL OR created_at>=$1) AND ($2::date IS NULL OR created_at<=$2)`,
        [from||null, to||null]),
    ]);
    res.json({ byCause: byCause.rows, byWorker: byWorker.rows, byMachine: byMachine.rows, totals: totals.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Грешка при статистиките' });
  }
});

// POST /api/defects
router.post('/', roleCheck('admin','production'), async (req, res) => {
  const { order_id, stage_id, machine_id, cause_type, cause_notes, material_cost, labor_cost, decision, notes } = req.body;
  if (!order_id || !cause_type) {
    return res.status(400).json({ error: 'order_id и причина са задължителни' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO defects (order_id, stage_id, worker_id, machine_id, cause_type, cause_notes,
                            material_cost, labor_cost, decision, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [order_id, stage_id, req.user.id, machine_id, cause_type, cause_notes,
       material_cost || 0, labor_cost || 0, decision || null, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при записване на брак' });
  }
});

// PATCH /api/defects/:id/resolve
router.patch('/:id/resolve', roleCheck('admin','office','production'), async (req, res) => {
  const { decision, notes } = req.body;
  if (!decision) return res.status(400).json({ error: 'Решението е задължително' });
  try {
    const { rows } = await pool.query(
      `UPDATE defects SET decision=$1::defect_decision, notes=COALESCE($2,notes),
       resolved_at=NOW(), resolved_by=$3 WHERE id=$4 RETURNING *`,
      [decision, notes, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Бракът не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

module.exports = router;
