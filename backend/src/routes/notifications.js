const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/notifications — get user's notifications
router.get('/', async (req, res) => {
  const { page = 1, limit = 50, unread_only } = req.query;
  const offset = (page - 1) * limit;
  const readCond = unread_only === 'true' ? 'AND read_at IS NULL' : '';
  try {
    const { rows } = await pool.query(
      `SELECT id, type, title, body, link, order_id, read_at, created_at
       FROM notifications
       WHERE user_id = $1 ${readCond}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    const { rows: cnt } = await pool.query(
      `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread
       FROM notifications WHERE user_id=$1`, [req.user.id]
    );
    res.json({ notifications: rows, unread: cnt[0].unread, total: cnt[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL`,
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET read_at = NOW()
       WHERE user_id = $1 AND read_at IS NULL`,
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

module.exports = router;
