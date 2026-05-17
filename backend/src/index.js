require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.FRONTEND_URL || 'http://localhost:5173'),
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
app.use('/api/comments',   require('./routes/comments'));
app.use('/api/public',         require('./routes/public'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/quotations',     require('./routes/quotations'));

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
  console.error(err.stack);
  if (err.message?.includes('Неразрешен файлов тип')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Вътрешна грешка на сървъра' });
});

// ── Periodic jobs ──────────────────────────────────────────
const notify = require('./utils/notify');
const pool   = require('./db/pool');

async function checkLowStock() {
  try {
    const { rows } = await pool.query(`
      SELECT m.name, s.quantity, s.min_threshold
      FROM stock s JOIN materials m ON m.id=s.material_id
      WHERE s.quantity < s.min_threshold AND s.min_threshold > 0
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.type='low_stock' AND n.body LIKE '%'||m.name||'%'
            AND n.created_at > NOW() - INTERVAL '24 hours'
        )
      LIMIT 10
    `);
    for (const s of rows) {
      await notify({
        roles: ['admin','warehouse'],
        type: 'low_stock',
        title: `Ниска наличност: ${s.name}`,
        body: `Налично: ${s.quantity} / Минимум: ${s.min_threshold}`,
        link: '/warehouse',
      });
    }
  } catch (err) {
    console.error('checkLowStock error:', err.message);
  }
}

async function checkOverdueOrders() {
  try {
    const { rows } = await pool.query(`
      SELECT o.id, o.order_number, c.name AS client_name
      FROM orders o JOIN clients c ON c.id=o.client_id
      WHERE o.deadline < NOW()::date
        AND o.status NOT IN ('ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА')
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.order_id=o.id AND n.type='overdue'
            AND n.created_at > NOW() - INTERVAL '24 hours'
        )
    `);
    for (const o of rows) {
      await notify({
        roles: ['admin','office'],
        type: 'overdue',
        title: `Просрочена поръчка: ${o.order_number}`,
        body: `Клиент: ${o.client_name}`,
        link: `/orders/${o.id}`,
        orderId: o.id,
      });
    }
    if (rows.length > 0) console.log(`⚠️  Sent overdue notifications for ${rows.length} orders`);
  } catch (err) {
    console.error('checkOverdueOrders error:', err.message);
  }
}

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏭 ЕСПЕХО ERP backend started on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  // Check overdue orders and low stock every hour
  checkOverdueOrders();
  checkLowStock();
  setInterval(checkOverdueOrders, 60 * 60 * 1000);
  setInterval(checkLowStock, 60 * 60 * 1000);
});
