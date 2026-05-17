require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'ЕСПЕХО ERP', version: '1.0.0' });
});

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message?.includes('Неразрешен файлов тип')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏭 ЕСПЕХО ERP backend started on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
