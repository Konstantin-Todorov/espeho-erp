const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth, roleCheck('admin','office'));

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [orderStats, revenueStats, prevMonthStats, defectStats, lowStock, recentOrders, urgentActive] = await Promise.all([
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM orders GROUP BY status`),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status NOT IN ('ОТКАЗАНА'))::int AS total_orders,
          COALESCE(SUM(sale_price) FILTER (WHERE status='ДОСТАВЕНА'), 0)::numeric(12,2) AS revenue_delivered,
          COALESCE(SUM(oc.total_cost) FILTER (WHERE o.status='ДОСТАВЕНА'), 0)::numeric(12,2) AS cost_delivered,
          COALESCE(SUM(sale_price) FILTER (WHERE status NOT IN ('ОТКАЗАНА','ДОСТАВЕНА')), 0)::numeric(12,2) AS pipeline_value
        FROM orders o LEFT JOIN order_costs oc ON oc.order_id=o.id
        WHERE o.created_at >= DATE_TRUNC('month', NOW())`),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE status NOT IN ('ОТКАЗАНА'))::int AS total_orders,
          COALESCE(SUM(sale_price) FILTER (WHERE status='ДОСТАВЕНА'), 0)::numeric(12,2) AS revenue_delivered
        FROM orders o
        WHERE o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
          AND o.created_at < DATE_TRUNC('month', NOW())`),
      pool.query(`
        SELECT COUNT(*)::int AS count, COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
        FROM defects WHERE created_at >= DATE_TRUNC('month', NOW())`),
      pool.query(`
        SELECT COUNT(*)::int AS count FROM stock
        WHERE quantity < min_threshold AND min_threshold > 0`),
      pool.query(`
        SELECT o.id, o.order_number, o.status, o.is_urgent, o.deadline,
               c.name AS client_name, o.sale_price
        FROM orders o JOIN clients c ON c.id=o.client_id
        WHERE o.status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА')
        ORDER BY o.is_urgent DESC, o.deadline ASC NULLS LAST
        LIMIT 10`),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE deadline < NOW()::date
            AND status NOT IN ('ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА'))::int AS overdue,
          COUNT(*) FILTER (WHERE deadline BETWEEN NOW()::date AND (NOW() + INTERVAL '7 days')::date
            AND status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА'))::int AS due_this_week,
          COUNT(*) FILTER (WHERE is_urgent = true
            AND status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА'))::int AS urgent_active
        FROM orders`),
    ]);

    // Orders by day (last 30 days)
    const ordersByDay = await pool.query(`
      SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1`);

    // Revenue by week (last 12 weeks)
    const revenueByWeek = await pool.query(`
      SELECT DATE_TRUNC('week', created_at)::date AS week,
             COALESCE(SUM(sale_price),0)::numeric(12,2) AS revenue
      FROM orders WHERE status='ДОСТАВЕНА' AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY 1 ORDER BY 1`);

    res.json({
      orderStats: orderStats.rows,
      revenue: revenueStats.rows[0],
      prevMonth: prevMonthStats.rows[0],
      defects: defectStats.rows[0],
      lowStockCount: lowStock.rows[0].count,
      recentOrders: recentOrders.rows,
      urgentActive: urgentActive.rows[0],
      ordersByDay: ordersByDay.rows,
      revenueByWeek: revenueByWeek.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при зареждане на дашборда' });
  }
});

// GET /api/reports/orders — detailed order report
router.get('/orders', async (req, res) => {
  const { from, to, status, client_id } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT o.order_number, o.status, o.order_type, o.deadline, o.created_at,
             o.sale_price, oc.total_cost,
             CASE WHEN o.sale_price > 0 AND oc.total_cost > 0
                  THEN ROUND((o.sale_price - oc.total_cost) / o.sale_price * 100, 1)
                  ELSE NULL END AS margin_pct,
             c.name AS client_name, u.name AS created_by
      FROM orders o
      JOIN clients c ON c.id=o.client_id
      JOIN users u ON u.id=o.created_by
      LEFT JOIN order_costs oc ON oc.order_id=o.id
      WHERE ($1::date IS NULL OR o.created_at>=$1)
        AND ($2::date IS NULL OR o.created_at<=$2)
        AND ($3::text IS NULL OR o.status=$3::order_status)
        AND ($4::uuid IS NULL OR o.client_id=$4)
      ORDER BY o.created_at DESC`,
      [from||null, to||null, status||null, client_id||null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/costs — cost vs revenue analysis
router.get('/costs', async (req, res) => {
  const { from, to } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(oc.material_cost),0)::numeric(12,2) AS total_material,
        COALESCE(SUM(oc.labor_cost),0)::numeric(12,2) AS total_labor,
        COALESCE(SUM(oc.machine_cost),0)::numeric(12,2) AS total_machine,
        COALESCE(SUM(oc.overhead_cost),0)::numeric(12,2) AS total_overhead,
        COALESCE(SUM(oc.total_cost),0)::numeric(12,2) AS total_cost,
        COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS total_revenue,
        COALESCE(SUM(o.sale_price - oc.total_cost),0)::numeric(12,2) AS total_margin,
        COUNT(o.id)::int AS order_count
      FROM orders o
      JOIN order_costs oc ON oc.order_id=o.id
      WHERE o.status IN ('ГОТОВА','ДОСТАВЕНА')
        AND ($1::date IS NULL OR o.created_at>=$1)
        AND ($2::date IS NULL OR o.created_at<=$2)`,
      [from||null, to||null]
    );

    // By month breakdown
    const monthly = await pool.query(`
      SELECT DATE_TRUNC('month', o.created_at)::date AS month,
             COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS revenue,
             COALESCE(SUM(oc.total_cost),0)::numeric(12,2) AS cost,
             COALESCE(SUM(o.sale_price - oc.total_cost),0)::numeric(12,2) AS margin
      FROM orders o JOIN order_costs oc ON oc.order_id=o.id
      WHERE o.status IN ('ГОТОВА','ДОСТАВЕНА')
        AND ($1::date IS NULL OR o.created_at>=$1)
        AND ($2::date IS NULL OR o.created_at<=$2)
      GROUP BY 1 ORDER BY 1`,
      [from||null, to||null]
    );

    res.json({ summary: rows[0], monthly: monthly.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/materials — material consumption
router.get('/materials', async (req, res) => {
  const { from, to } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT m.name, m.unit, m.category,
             SUM(ABS(sm.quantity))::numeric(12,4) AS total_consumed,
             SUM(sm.total_value)::numeric(12,2) AS total_value
      FROM stock_movements sm JOIN materials m ON m.id=sm.material_id
      WHERE sm.movement_type='ИЗПИСАНО'
        AND ($1::date IS NULL OR sm.created_at>=$1)
        AND ($2::date IS NULL OR sm.created_at<=$2)
      GROUP BY m.id, m.name, m.unit, m.category
      ORDER BY total_value DESC`,
      [from||null, to||null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/production — production per worker
router.get('/production', async (req, res) => {
  const { from, to } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT u.name, u.role,
             COUNT(DISTINCT ll.order_id)::int AS orders_worked,
             COALESCE(SUM(ll.minutes),0)::int AS total_minutes,
             COALESCE(SUM(ll.minutes * ll.hourly_rate / 60),0)::numeric(10,2) AS labor_cost,
             COUNT(DISTINCT d.id)::int AS defects_caused
      FROM users u
      LEFT JOIN labor_logs ll ON ll.worker_id=u.id
        AND ($1::date IS NULL OR ll.logged_at>=$1)
        AND ($2::date IS NULL OR ll.logged_at<=$2)
      LEFT JOIN defects d ON d.worker_id=u.id
        AND ($1::date IS NULL OR d.created_at>=$1)
        AND ($2::date IS NULL OR d.created_at<=$2)
      WHERE u.role='production'
      GROUP BY u.id, u.name, u.role
      ORDER BY total_minutes DESC`,
      [from||null, to||null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/clients — revenue by client
router.get('/clients', async (req, res) => {
  const { from, to, limit = 20 } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.phone,
        COUNT(o.id)::int AS total_orders,
        COUNT(o.id) FILTER (WHERE o.status NOT IN ('ОТКАЗАНА'))::int AS active_orders,
        COUNT(o.id) FILTER (WHERE o.status='ДОСТАВЕНА')::int AS delivered_orders,
        COUNT(o.id) FILTER (WHERE o.status='ОТКАЗАНА')::int AS cancelled_orders,
        COALESCE(SUM(o.sale_price) FILTER (WHERE o.status='ДОСТАВЕНА'), 0)::numeric(12,2) AS total_revenue,
        COALESCE(AVG(o.sale_price) FILTER (WHERE o.status='ДОСТАВЕНА'), 0)::numeric(12,2) AS avg_order_value,
        MAX(o.created_at) AS last_order_at
      FROM clients c
      LEFT JOIN orders o ON o.client_id=c.id
        AND ($1::date IS NULL OR o.created_at>=$1)
        AND ($2::date IS NULL OR o.created_at<=$2)
      GROUP BY c.id, c.name, c.phone
      HAVING COUNT(o.id) > 0
      ORDER BY total_revenue DESC
      LIMIT $3`,
      [from||null, to||null, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/order-types — breakdown by type
router.get('/order-types', async (req, res) => {
  const { from, to } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT o.order_type,
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (WHERE o.status='ДОСТАВЕНА')::int AS delivered,
        COUNT(*) FILTER (WHERE o.status='ОТКАЗАНА')::int AS cancelled,
        COALESCE(SUM(o.sale_price) FILTER (WHERE o.status='ДОСТАВЕНА'),0)::numeric(12,2) AS revenue,
        COALESCE(AVG(o.sale_price) FILTER (WHERE o.status='ДОСТАВЕНА'),0)::numeric(12,2) AS avg_price
      FROM orders o
      WHERE ($1::date IS NULL OR o.created_at>=$1)
        AND ($2::date IS NULL OR o.created_at<=$2)
      GROUP BY o.order_type ORDER BY total_orders DESC`,
      [from||null, to||null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

// GET /api/reports/defect-analysis — defect breakdown
router.get('/defect-analysis', async (req, res) => {
  const { from, to } = req.query;
  try {
    const [byCause, byWorker, monthly] = await Promise.all([
      pool.query(`
        SELECT cause_type, COUNT(*)::int AS count,
               COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
        FROM defects
        WHERE ($1::date IS NULL OR created_at>=$1) AND ($2::date IS NULL OR created_at<=$2)
        GROUP BY cause_type ORDER BY count DESC`,
        [from||null, to||null]
      ),
      pool.query(`
        SELECT u.name AS worker_name, COUNT(d.id)::int AS defect_count,
               COALESCE(SUM(d.total_cost),0)::numeric(10,2) AS total_cost
        FROM users u LEFT JOIN defects d ON d.worker_id=u.id
          AND ($1::date IS NULL OR d.created_at>=$1) AND ($2::date IS NULL OR d.created_at<=$2)
        WHERE u.role='production' GROUP BY u.id, u.name ORDER BY defect_count DESC`,
        [from||null, to||null]
      ),
      pool.query(`
        SELECT DATE_TRUNC('month', created_at)::date AS month,
               COUNT(*)::int AS count,
               COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
        FROM defects
        WHERE ($1::date IS NULL OR created_at>=$1) AND ($2::date IS NULL OR created_at<=$2)
        GROUP BY 1 ORDER BY 1`,
        [from||null, to||null]
      ),
    ]);
    res.json({ byCause: byCause.rows, byWorker: byWorker.rows, monthly: monthly.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка в репорта' });
  }
});

module.exports = router;
