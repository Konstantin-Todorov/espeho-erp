const pool = require('../db/pool');

// Push a notification to one or more users
// roles: if provided, send to all users with those roles
async function notify({ userIds = [], roles = [], type, title, body, link, orderId } = {}) {
  try {
    let recipients = [...userIds];

    if (roles.length > 0) {
      const { rows } = await pool.query(
        `SELECT id FROM users WHERE role = ANY($1) AND active = true`,
        [roles]
      );
      rows.forEach(r => {
        if (!recipients.includes(r.id)) recipients.push(r.id);
      });
    }

    if (recipients.length === 0) return;

    await Promise.all(
      recipients.map(uid =>
        pool.query(
          `INSERT INTO notifications (user_id, type, title, body, link, order_id)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [uid, type, title, body || null, link || null, orderId || null]
        )
      )
    );
  } catch (err) {
    console.error('notify error:', err.message);
  }
}

module.exports = notify;
