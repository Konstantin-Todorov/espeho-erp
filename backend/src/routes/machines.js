const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

// GET /api/machines
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*,
        (m.last_service + (m.service_interval_days || ' days')::INTERVAL)::date AS next_service_date,
        CASE WHEN m.last_service IS NOT NULL AND
                  m.last_service + (m.service_interval_days || ' days')::INTERVAL < NOW()
             THEN true ELSE false END AS service_overdue
      FROM machines m WHERE m.active=true ORDER BY m.name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/machines/:id — with maintenance history
router.get('/:id', async (req, res) => {
  try {
    const machineQ = await pool.query(`
      SELECT m.*,
        (m.last_service + (m.service_interval_days || ' days')::INTERVAL)::date AS next_service_date,
        CASE WHEN m.last_service + (m.service_interval_days || ' days')::INTERVAL < NOW()
             THEN true ELSE false END AS service_overdue
      FROM machines m WHERE m.id=$1`, [req.params.id]
    );
    if (!machineQ.rows[0]) return res.status(404).json({ error: 'Машината не е намерена' });

    const logs = await pool.query(
      `SELECT ml.*, u.name AS worker_name FROM maintenance_logs ml
       LEFT JOIN users u ON u.id=ml.worker_id
       WHERE ml.machine_id=$1 ORDER BY ml.performed_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json({ ...machineQ.rows[0], maintenance_logs: logs.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/machines
router.post('/', roleCheck('admin'), async (req, res) => {
  const { name, type, model, serial_number, cost_per_hour, service_interval_days, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO machines (name, type, model, serial_number, cost_per_hour, service_interval_days, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, type, model, serial_number, cost_per_hour||0, service_interval_days||90, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// POST /api/machines/:id/maintenance
router.post('/:id/maintenance', roleCheck('admin','production'), async (req, res) => {
  const { maintenance_type, performed_by, cost, notes, performed_at, next_service } = req.body;
  if (!maintenance_type || !notes) {
    return res.status(400).json({ error: 'Типът и бележките са задължителни' });
  }
  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const { rows } = await dbClient.query(
      `INSERT INTO maintenance_logs (machine_id, maintenance_type, performed_by, worker_id, cost, notes, performed_at, next_service)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.params.id, maintenance_type, performed_by, req.user.id, cost||0, notes,
       performed_at || new Date().toISOString().split('T')[0], next_service || null]
    );

    // Update machine last_service
    await dbClient.query(
      `UPDATE machines SET last_service=$1 WHERE id=$2`,
      [performed_at || new Date().toISOString().split('T')[0], req.params.id]
    );

    await dbClient.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ error: 'Грешка при записване' });
  } finally {
    dbClient.release();
  }
});

// PATCH /api/machines/:id
router.patch('/:id', roleCheck('admin'), async (req, res) => {
  const { name, type, model, cost_per_hour, service_interval_days, notes, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE machines SET
         name=COALESCE($1,name), type=COALESCE($2,type), model=COALESCE($3,model),
         cost_per_hour=COALESCE($4,cost_per_hour),
         service_interval_days=COALESCE($5,service_interval_days),
         notes=COALESCE($6,notes), active=COALESCE($7,active)
       WHERE id=$8 RETURNING *`,
      [name, type, model, cost_per_hour, service_interval_days, notes, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Машината не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

module.exports = router;
