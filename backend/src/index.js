require('dotenv').config();
const app = require('./app');

// ── Periodic jobs ──────────────────────────────────────────
const notify = require('./utils/notify');
const { sendEmail, overdueEmail, lowStockEmail } = require('./utils/email');
const pool   = require('./db/pool');

async function checkLowStock() {
  try {
    const { rows } = await pool.query(`
      SELECT m.name, s.quantity, s.min_threshold
      FROM stock s JOIN materials m ON m.id=s.material_id
      WHERE s.quantity < s.min_threshold AND s.min_threshold > 0
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.type='low_stock' AND n.title = 'Ниска наличност: '||m.name
            AND n.created_at > NOW() - INTERVAL '24 hours'
        )
      LIMIT 10
    `);
    if (rows.length === 0) return;

    for (const s of rows) {
      await notify({
        roles: ['admin','warehouse'],
        type: 'low_stock',
        title: `Ниска наличност: ${s.name}`,
        body: `Налично: ${s.quantity} / Минимум: ${s.min_threshold}`,
        link: '/warehouse',
      });
    }

    // Email warehouse/admin users
    const warehouseEmails = await pool.query(
      `SELECT email FROM users WHERE role IN ('admin','warehouse') AND active=true AND email IS NOT NULL`
    );
    for (const s of rows) {
      for (const u of warehouseEmails.rows) {
        const tpl = lowStockEmail(s.name, s.quantity, s.min_threshold);
        sendEmail({ to: u.email, ...tpl });
      }
    }
  } catch (err) {
    console.error('checkLowStock error:', err.message);
  }
}

async function checkOverdueOrders() {
  try {
    const { rows } = await pool.query(`
      SELECT o.id, o.order_number, o.deadline, c.name AS client_name
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
    // Also email office/admin users
    if (rows.length > 0) {
      console.log(`⚠️  Sent overdue notifications for ${rows.length} orders`);
      const adminEmails = await pool.query(
        `SELECT email FROM users WHERE role IN ('admin','office') AND active=true AND email IS NOT NULL`
      );
      for (const o of rows) {
        for (const u of adminEmails.rows) {
          const tpl = overdueEmail(o.order_number, o.client_name, o.deadline ? new Date(o.deadline).toLocaleDateString('bg-BG') : 'неизвестна');
          sendEmail({ to: u.email, ...tpl });
        }
      }
    }
  } catch (err) {
    console.error('checkOverdueOrders error:', err.message);
  }
}

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const runMigrations = require('./db/migrate');

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🏭 ЕСПЕХО ERP backend started on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      checkOverdueOrders();
      checkLowStock();
      setInterval(checkOverdueOrders, 60 * 60 * 1000);
      setInterval(checkLowStock, 60 * 60 * 1000);
    });
  })
  .catch(err => {
    console.error('❌ Migrations failed — server not started:', err.message);
    process.exit(1);
  });
