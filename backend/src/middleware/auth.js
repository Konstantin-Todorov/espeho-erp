const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// Short cache so every request doesn't hit the DB, while deactivations / role changes
// take effect within seconds instead of when the 7-day token expires.
const cache = new Map();
const TTL = 30_000;

async function currentUser(id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL) return hit.user;
  const { rows } = await pool.query('SELECT id, name, email, role, active FROM users WHERE id=$1', [id]);
  const user = rows[0] || null;
  cache.set(id, { user, at: Date.now() });
  return user;
}

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Няма токен за автентикация' });
  }
  let payload;
  try {
    payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Невалиден или изтекъл токен' });
  }
  try {
    const user = await currentUser(payload.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Акаунтът е деактивиран' });
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.clearUserCache = id => (id ? cache.delete(id) : cache.clear());
