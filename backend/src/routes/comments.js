const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/comments/:orderId
router.get('/:orderId', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.name AS user_name, u.role AS user_role
     FROM order_comments c JOIN users u ON u.id=c.user_id
     WHERE c.order_id=$1 ORDER BY c.created_at ASC`,
    [req.params.orderId]
  );
  res.json(rows);
});

// POST /api/comments/:orderId
router.post('/:orderId', async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Съобщението е задължително' });
  const { rows } = await pool.query(
    `INSERT INTO order_comments (order_id, user_id, message)
     VALUES ($1,$2,$3) RETURNING *`,
    [req.params.orderId, req.user.id, message.trim()]
  );
  // Return with user info
  const full = await pool.query(
    `SELECT c.*, u.name AS user_name, u.role AS user_role
     FROM order_comments c JOIN users u ON u.id=c.user_id WHERE c.id=$1`,
    [rows[0].id]
  );
  res.status(201).json(full.rows[0]);
});

// DELETE /api/comments/:id
router.delete('/msg/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM order_comments WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Не е намерено' });
  if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'Нямате права' });
  }
  await pool.query('DELETE FROM order_comments WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
