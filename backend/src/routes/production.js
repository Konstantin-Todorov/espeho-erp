const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const notify = require('../utils/notify');

const router = express.Router();
router.use(auth);

// GET /api/production/board — Kanban view
// GET /api/production/workers — all active users available for stage assignment
router.get('/workers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, role FROM users WHERE active=true ORDER BY
         CASE role WHEN 'production' THEN 1 WHEN 'admin' THEN 2 ELSE 3 END, name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

router.get('/board', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.id, o.order_number, o.status, o.order_type, o.deadline, o.is_urgent,
             o.created_at, c.name AS client_name,
             json_agg(
               json_build_object(
                 'id', ps.id, 'stage_name', ps.stage_name,
                 'stage_order', ps.stage_order, 'status', ps.status,
                 'worker_name', wu.name, 'started_at', ps.started_at,
                 'assigned_to', ps.assigned_to
               ) ORDER BY ps.stage_order
             ) AS stages
      FROM orders o
      JOIN clients c ON c.id = o.client_id
      JOIN production_stages ps ON ps.order_id = o.id
      LEFT JOIN users wu ON wu.id = ps.assigned_to
      WHERE o.status IN ('МАТЕРИАЛИ','ПРОИЗВОДСТВО','ГОТОВА')
      GROUP BY o.id, c.name
      ORDER BY o.is_urgent DESC, o.deadline ASC NULLS LAST`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на борда' });
  }
});

// GET /api/production/my-work — today's work for logged-in worker
router.get('/my-work', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT ps.id, ps.stage_name, ps.status, ps.stage_order, ps.assigned_to,
             (ps.assigned_to = $1) AS mine,
             o.id AS order_id, o.order_number, o.external_ref, o.order_type, o.is_urgent, o.deadline,
             c.name AS client_name,
             NOT EXISTS (SELECT 1 FROM production_stages p2 WHERE p2.order_id = ps.order_id
                          AND p2.stage_order < ps.stage_order AND p2.status NOT IN ('ГОТОВ','ПРОПУСНАТ')) AS can_start
      FROM production_stages ps
      JOIN orders o ON o.id = ps.order_id
      JOIN clients c ON c.id = o.client_id
      WHERE ps.status IN ('ЧАКАЩ','В_ПРОЦЕС')
        AND o.status = 'ПРОИЗВОДСТВО'
        AND (ps.assigned_to = $1 OR ps.assigned_to IS NULL)
      ORDER BY (ps.assigned_to = $1) DESC NULLS LAST, (ps.status = 'В_ПРОЦЕС') DESC,
               o.is_urgent DESC, o.deadline ASC NULLS LAST, ps.stage_order`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/production/stages/:orderId
router.get('/stages/:orderId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ps.*, u.name AS worker_name, m.name AS machine_name
       FROM production_stages ps
       LEFT JOIN users u ON u.id = ps.assigned_to
       LEFT JOIN machines m ON m.id = ps.machine_id
       WHERE ps.order_id=$1 ORDER BY ps.stage_order`,
      [req.params.orderId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// PATCH /api/production/stages/:id — start / finish / skip a stage, assign worker or machine, add notes
router.patch('/stages/:id', roleCheck('admin','office','production'), async (req, res) => {
  const { status, machine_id, notes, assigned_to } = req.body;
  if (status && !['ЧАКАЩ','В_ПРОЦЕС','ГОТОВ','ПРОПУСНАТ'].includes(status)) {
    return res.status(400).json({ error: 'Невалиден статус на етап' });
  }
  const dbClient = await pool.connect();
  let orderBecameReady = null;
  try {
    await dbClient.query('BEGIN');
    const { rows: [stage] } = await dbClient.query(
      `SELECT ps.*, o.status AS order_status, o.order_number, o.external_ref, c.name AS client_name
       FROM production_stages ps JOIN orders o ON o.id = ps.order_id JOIN clients c ON c.id = o.client_id
       WHERE ps.id=$1 FOR UPDATE OF ps`, [req.params.id]);
    if (!stage) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Етапът не е намерен' });
    }

    if (status && status !== stage.status) {
      // Stages can only be worked on while the order is in production
      if (stage.order_status !== 'ПРОИЗВОДСТВО' && req.user.role !== 'admin') {
        await dbClient.query('ROLLBACK');
        return res.status(400).json({ error: `Поръчката е в статус „${stage.order_status}“ — етапите се работят само когато е „ПРОИЗВОДСТВО“` });
      }
      if (status === 'В_ПРОЦЕС' && req.user.role !== 'admin') {
        const { rows: prev } = await dbClient.query(
          `SELECT id FROM production_stages
           WHERE order_id=$1 AND stage_order < $2 AND status NOT IN ('ГОТОВ','ПРОПУСНАТ')`,
          [stage.order_id, stage.stage_order]);
        if (prev.length) {
          await dbClient.query('ROLLBACK');
          return res.status(400).json({ error: 'Предишният етап все още не е завършен' });
        }
      }
    }

    // Who is assigned: explicit choice wins; a production worker who starts an unassigned stage takes it
    let newAssignee = stage.assigned_to;
    if (assigned_to !== undefined) newAssignee = assigned_to || null;
    else if (status === 'В_ПРОЦЕС' && !stage.assigned_to && req.user.role === 'production') newAssignee = req.user.id;

    const newStatus = status || stage.status;
    const { rows: [updated] } = await dbClient.query(
      `UPDATE production_stages SET
         status=$1::stage_status,
         machine_id=CASE WHEN $2::boolean THEN $3::uuid ELSE machine_id END,
         assigned_to=$4,
         started_at=CASE WHEN $1 = 'В_ПРОЦЕС' AND started_at IS NULL THEN NOW()
                         WHEN $1 = 'ЧАКАЩ' THEN NULL ELSE started_at END,
         completed_at=CASE WHEN $1 IN ('ГОТОВ','ПРОПУСНАТ') THEN COALESCE(completed_at, NOW()) ELSE NULL END,
         notes=CASE WHEN $5::boolean THEN $6 ELSE notes END
       WHERE id=$7 RETURNING *`,
      [newStatus, machine_id !== undefined, machine_id || null, newAssignee,
       notes !== undefined, notes || null, req.params.id]);

    // All stages finished → order becomes ГОТОВА (only from ПРОИЗВОДСТВО)
    if (newStatus === 'ГОТОВ' && stage.order_status === 'ПРОИЗВОДСТВО') {
      const { rows: remaining } = await dbClient.query(
        `SELECT id FROM production_stages WHERE order_id=$1 AND status NOT IN ('ГОТОВ','ПРОПУСНАТ')`,
        [stage.order_id]);
      if (!remaining.length) {
        await dbClient.query(
          `UPDATE orders SET status='ГОТОВА', updated_by=$2, updated_at=NOW() WHERE id=$1`,
          [stage.order_id, req.user.id]);
        await dbClient.query(
          `INSERT INTO order_comments (order_id, user_id, message) VALUES ($1,$2,'Статус: ПРОИЗВОДСТВО → ГОТОВА (всички етапи завършени)')`,
          [stage.order_id, req.user.id]);
        orderBecameReady = stage;
      }
    }

    await dbClient.query('COMMIT');
    if (orderBecameReady) {
      const num = orderBecameReady.external_ref || `#${orderBecameReady.order_number}`;
      await notify({ roles: ['admin','office'], type: 'order_ready',
        title: `Поръчка ${num} е готова`, body: `Клиент: ${orderBecameReady.client_name} — всички етапи са завършени`,
        link: `/orders/${orderBecameReady.order_id}`, orderId: orderBecameReady.order_id });
    }
    res.json({ ...updated, order_ready: !!orderBecameReady });
  } catch (err) {
    await dbClient.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    dbClient.release();
  }
});

// POST /api/production/stages — add a stage to an existing order
router.post('/stages', roleCheck('admin','office'), async (req, res) => {
  const { order_id, stage_name, notes } = req.body;
  if (!order_id || !stage_name?.trim()) {
    return res.status(400).json({ error: 'order_id и stage_name са задължителни' });
  }
  try {
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(stage_order),0) AS max FROM production_stages WHERE order_id=$1',
      [order_id]
    );
    const nextOrder = maxOrder.rows[0].max + 1;
    const { rows } = await pool.query(
      `INSERT INTO production_stages (order_id, stage_name, stage_order, status, notes)
       VALUES ($1, $2, $3, 'ЧАКАЩ', $4) RETURNING *`,
      [order_id, stage_name.trim(), nextOrder, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при добавяне на етап' });
  }
});

// POST /api/production/labor — log labor time
router.post('/labor', roleCheck('admin','office','production'), async (req, res) => {
  const { order_id, stage_id, minutes, notes, description, worker_id: reqWorkerId } = req.body;
  if (!order_id || !minutes || minutes <= 0) {
    return res.status(400).json({ error: 'order_id и минути са задължителни' });
  }
  // Admin/office can log on behalf of another worker; production logs for themselves
  const isPrivileged = ['admin','office'].includes(req.user.role);
  const workerId = (isPrivileged && reqWorkerId) ? reqWorkerId : req.user.id;

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Get worker's hourly rate
    const userQ = await dbClient.query('SELECT hourly_rate FROM users WHERE id=$1', [workerId]);
    const hourlyRate = userQ.rows[0]?.hourly_rate || 0;
    const laborCost = (minutes / 60) * hourlyRate;
    const combinedNotes = [description, notes].filter(Boolean).join(' · ') || null;

    const { rows } = await dbClient.query(
      `INSERT INTO labor_logs (order_id, stage_id, worker_id, minutes, hourly_rate, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [order_id, stage_id || null, workerId, minutes, hourlyRate, combinedNotes]
    );

    // Update order cost card
    await dbClient.query(
      `UPDATE order_costs SET labor_cost = labor_cost + $1, updated_at=NOW() WHERE order_id=$2`,
      [laborCost.toFixed(2), order_id]
    );

    await dbClient.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при записване на труд' });
  } finally {
    dbClient.release();
  }
});

// GET /api/production/stats — admin stats
router.get('/stats', roleCheck('admin','office'), async (req, res) => {
  const { from, to } = req.query;
  try {
    const [byWorker, byStage, throughput] = await Promise.all([
      pool.query(`
        SELECT u.name, SUM(ll.minutes)::int AS total_minutes,
               SUM(ll.minutes * ll.hourly_rate / 60)::numeric(10,2) AS labor_cost,
               COUNT(DISTINCT ll.order_id)::int AS orders_worked
        FROM labor_logs ll JOIN users u ON u.id = ll.worker_id
        WHERE ($1::date IS NULL OR ll.logged_at >= $1)
          AND ($2::date IS NULL OR ll.logged_at <= $2)
        GROUP BY u.id, u.name ORDER BY total_minutes DESC`,
        [from || null, to || null]
      ),
      pool.query(`
        SELECT stage_name, COUNT(*)::int AS count,
               AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600)::numeric(6,2) AS avg_hours
        FROM production_stages WHERE status='ГОТОВ'
        GROUP BY stage_name ORDER BY stage_name`
      ),
      pool.query(`
        SELECT DATE_TRUNC('day', updated_at)::date AS day, COUNT(*)::int AS count
        FROM orders WHERE status='ГОТОВА'
          AND ($1::date IS NULL OR updated_at >= $1)
          AND ($2::date IS NULL OR updated_at <= $2)
        GROUP BY 1 ORDER BY 1`,
        [from || null, to || null]
      ),
    ]);
    res.json({ byWorker: byWorker.rows, byStage: byStage.rows, throughput: throughput.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка при статистиките' });
  }
});

module.exports = router;
