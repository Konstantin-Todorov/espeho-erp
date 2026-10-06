const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { clearUserCache } = auth;
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и парола са задължителни' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = rows[0];
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Грешен email или парола' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Грешен email или парола' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, hourly_rate FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Потребителят не съществува' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/auth/users — admin only
router.get('/users', auth, roleCheck('admin'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, hourly_rate, active, created_at FROM users ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/auth/users — admin only
router.post('/users', auth, roleCheck('admin'), async (req, res) => {
  const { name, email, password, role, hourly_rate } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Всички полета са задължителни' });
  }
  if (password.length < 6) return res.status(400).json({ error: 'Паролата трябва да е поне 6 символа' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, hourly_rate)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, hourly_rate`,
      [name, email.toLowerCase().trim(), hash, role, hourly_rate || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email вече съществува' });
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// PATCH /api/auth/me — any user may change their own display name
router.patch('/me', auth, async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).json({ error: 'Името е задължително' });
  const { rows } = await pool.query(
    'UPDATE users SET name=$1, updated_at=NOW() WHERE id=$2 RETURNING id, name, email, role',
    [name, req.user.id]);
  clearUserCache(req.user.id);
  res.json(rows[0]);
});

// PATCH /api/auth/users/:id — admin only
router.patch('/users/:id', auth, roleCheck('admin'), async (req, res) => {
  const { name, role, hourly_rate, active, password } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : undefined;
  if (req.params.id === req.user.id && (active === false || (role && role !== 'admin'))) {
    return res.status(400).json({ error: 'Не можете да деактивирате или да смените ролята на собствения си акаунт' });
  }
  if (password && password.length < 6) return res.status(400).json({ error: 'Паролата трябва да е поне 6 символа' });
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2',
        [hash, req.params.id]
      );
    }
    const { rows } = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email),
       role=COALESCE($3,role), hourly_rate=COALESCE($4,hourly_rate),
       active=COALESCE($5,active), updated_at=NOW()
       WHERE id=$6 RETURNING id, name, email, role, hourly_rate, active`,
      [name, email, role, hourly_rate, active, req.params.id]
    );
    clearUserCache(req.params.id);
    if (!rows[0]) return res.status(404).json({ error: 'Потребителят не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email вече съществува' });
    throw err;
  }
});

// POST /api/auth/change-password — self-service
router.post('/change-password', auth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Попълнете и двете полета' });
  }
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    // 400, not 401 — a 401 would make the app think the session expired and log the user out
    if (!valid) return res.status(400).json({ error: 'Грешна текуща парола' });
    if (new_password.length < 6) return res.status(400).json({ error: 'Новата парола трябва да е поне 6 символа' });
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Паролата е сменена успешно' });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

module.exports = router;
