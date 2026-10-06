require('dotenv').config();
const express = require('express');
require('express-async-errors'); // route handlers that throw/reject go to the error handler instead of crashing the process
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1); // Railway sits behind a proxy — needed for correct client IPs in rate limiting
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploaded files are served only through the authenticated /api/files/download route

// Brute-force protection for login and the public tracking page
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Твърде много опити за вход. Опитайте след 15 минути.' } }));
app.use('/api/public', rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/clients',    require('./routes/clients'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/production', require('./routes/production'));
app.use('/api/defects',    require('./routes/defects'));
app.use('/api/warehouse',  require('./routes/warehouse'));
app.use('/api/machines',   require('./routes/machines'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/files',      require('./routes/files'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/glass',      require('./routes/glass'));
app.use('/api/comments',   require('./routes/comments'));
app.use('/api/public',         require('./routes/public'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/quotations',     require('./routes/quotations'));
app.use('/api/quality',        require('./routes/quality'));
app.use('/api/deliveries',     require('./routes/deliveries'));
app.use('/api/suppliers',      require('./routes/suppliers'));
app.use('/api/admin',          require('./routes/admin'));
app.use('/api/settings',       require('./routes/settings'));
app.use('/api/options',        require('./routes/options'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'ЕСПЕХО ERP', version: '1.0.0' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message?.includes('Неразрешен файлов тип')) {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Файлът е твърде голям (макс. 20 MB)' });
  }
  // Postgres input errors (bad UUID, invalid enum/CHECK value, bad number) are client errors, not server crashes
  if (['22P02', '23514', '22003', '22007', '22008'].includes(err.code)) {
    return res.status(400).json({ error: 'Невалидни данни' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'Записът е свързан с други данни и не може да бъде променен/изтрит' });
  }
  console.error(err.stack || err);
  res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
});

module.exports = app;
