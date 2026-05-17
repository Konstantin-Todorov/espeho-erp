const express = require('express');
const pool = require('../db/pool');

const router = express.Router(); // no auth

// GET /api/public/track/:token — public order tracking (no login)
router.get('/track/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.order_number, o.status, o.order_type, o.deadline, o.is_urgent,
              o.created_at, o.notes,
              c.name AS client_name,
              json_agg(json_build_object(
                'stage_name', ps.stage_name,
                'status', ps.status,
                'stage_order', ps.stage_order
              ) ORDER BY ps.stage_order) AS stages
       FROM orders o
       JOIN clients c ON c.id=o.client_id
       LEFT JOIN production_stages ps ON ps.order_id=o.id
       WHERE o.tracking_token=$1
       GROUP BY o.id, c.name`,
      [req.params.token]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

module.exports = router;
