const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getSettings, n } = require('../utils/pricing');

const router = express.Router();
router.use(auth, roleCheck('admin','office'));

// Revenue rules (one place):
//  • only orders handed over to the client (ДОСТАВЕНА) and only real sales (category "нормална") —
//    warranty / internal / sample orders are not revenue
//  • dated by when they were handed over (delivered_at), not when they were created
//  • sale prices are WITH VAT; margin = price without VAT − cost (cost is without VAT)
const SOLD = `o.status = 'ДОСТАВЕНА' AND o.order_category = 'нормална'`;
const SOLD_AT = `COALESCE(o.delivered_at, o.created_at)`;
// Date range on a timestamp column: inclusive "to" day
const range = (col, a = '$1', b = '$2') =>
  `(${a}::date IS NULL OR ${col} >= ${a}::date) AND (${b}::date IS NULL OR ${col} < ${b}::date + 1)`;
const M2 = `(SELECT COALESCE(SUM(COALESCE(oi.area_m2 * oi.qty, oi.width * oi.height / 1e6 * oi.qty)),0)
             FROM order_items oi WHERE oi.order_id = o.id AND oi.uom = 'm2')`;

async function vatDivisor() {
  const s = await getSettings();
  return 1 + (n(s.vat_pct) ?? 20) / 100;
}

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res) => {
  const vat = await vatDivisor();
  const [orderStats, revenueStats, prevMonthStats, defectStats, lowStock, recentOrders, urgentActive,
         ordersByDay, revenueByWeek, ytd, monthly, receivables] = await Promise.all([
    pool.query(`SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status`),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE o.status <> 'ОТКАЗАНА' AND o.created_at >= DATE_TRUNC('month', NOW()))::int AS total_orders,
        COALESCE(SUM(o.sale_price) FILTER (WHERE ${SOLD} AND ${SOLD_AT} >= DATE_TRUNC('month', NOW())), 0)::numeric(12,2) AS revenue_delivered,
        COALESCE(SUM(oc.total_cost) FILTER (WHERE ${SOLD} AND ${SOLD_AT} >= DATE_TRUNC('month', NOW())), 0)::numeric(12,2) AS cost_delivered,
        COALESCE(SUM(o.sale_price) FILTER (WHERE o.status NOT IN ('ОТКАЗАНА','ДОСТАВЕНА') AND o.order_category = 'нормална'), 0)::numeric(12,2) AS pipeline_value
      FROM orders o LEFT JOIN order_costs oc ON oc.order_id=o.id`),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE o.status <> 'ОТКАЗАНА' AND o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                           AND o.created_at < DATE_TRUNC('month', NOW()))::int AS total_orders,
        COALESCE(SUM(o.sale_price) FILTER (WHERE ${SOLD} AND ${SOLD_AT} >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                           AND ${SOLD_AT} < DATE_TRUNC('month', NOW())), 0)::numeric(12,2) AS revenue_delivered
      FROM orders o`),
    pool.query(`
      SELECT COUNT(*)::int AS count, COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
      FROM defects WHERE created_at >= DATE_TRUNC('month', NOW())`),
    pool.query(`SELECT COUNT(*)::int AS count FROM stock WHERE quantity < min_threshold AND min_threshold > 0`),
    pool.query(`
      SELECT o.id, o.order_number, o.external_ref, o.status, o.is_urgent, o.deadline, o.payment_status,
             c.name AS client_name, o.sale_price
      FROM orders o JOIN clients c ON c.id=o.client_id
      WHERE o.status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА')
      ORDER BY o.is_urgent DESC, o.deadline ASC NULLS LAST, o.created_at DESC
      LIMIT 10`),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE deadline < NOW()::date AND status NOT IN ('ГОТОВА','ДОСТАВЕНА','ОТКАЗАНА'))::int AS overdue,
        COUNT(*) FILTER (WHERE deadline BETWEEN NOW()::date AND (NOW() + INTERVAL '7 days')::date
          AND status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА'))::int AS due_this_week,
        COUNT(*) FILTER (WHERE is_urgent = true AND status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА'))::int AS urgent_active
      FROM orders`),
    pool.query(`
      SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1 ORDER BY 1`),
    pool.query(`
      SELECT DATE_TRUNC('week', ${SOLD_AT})::date AS week, COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS revenue
      FROM orders o WHERE ${SOLD} AND ${SOLD_AT} >= NOW() - INTERVAL '12 weeks'
      GROUP BY 1 ORDER BY 1`),
    pool.query(`
      SELECT COUNT(*)::int AS orders,
             COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS revenue,
             COALESCE(SUM(o.sale_price / $1),0)::numeric(12,2) AS revenue_net,
             COALESCE(SUM(oc.total_cost),0)::numeric(12,2) AS cost,
             COALESCE(SUM(${M2}),0)::numeric(12,1) AS m2
      FROM orders o LEFT JOIN order_costs oc ON oc.order_id = o.id
      WHERE ${SOLD} AND ${SOLD_AT} >= DATE_TRUNC('year', NOW())`, [vat]),
    pool.query(`
      SELECT DATE_TRUNC('month', ${SOLD_AT})::date AS month, COUNT(*)::int AS orders,
             COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS revenue,
             COALESCE(SUM(o.sale_price / $1 - COALESCE(oc.total_cost,0)),0)::numeric(12,2) AS margin,
             COALESCE(SUM(${M2}),0)::numeric(12,1) AS m2
      FROM orders o LEFT JOIN order_costs oc ON oc.order_id = o.id
      WHERE ${SOLD} AND ${SOLD_AT} >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      GROUP BY 1 ORDER BY 1`, [vat]),
    pool.query(`
      SELECT COUNT(*)::int AS count,
             COALESCE(SUM(o.sale_price - COALESCE((SELECT SUM(amount) FROM payments p WHERE p.order_id = o.id),0)),0)::numeric(12,2) AS amount
      FROM orders o
      WHERE o.payment_status <> 'платена' AND o.status = 'ДОСТАВЕНА' AND o.order_category = 'нормална'
        AND COALESCE(o.sale_price,0) > 0`),
  ]);

  let quotationsPending = 0, deliveriesPending = 0;
  const [qRes, dRes] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS c FROM quotations WHERE status IN ('DRAFT','SENT')"),
    pool.query("SELECT COUNT(*)::int AS c FROM deliveries WHERE status IN ('PENDING','IN_TRANSIT')"),
  ]);
  quotationsPending = qRes.rows[0].c;
  deliveriesPending = dRes.rows[0].c;

  const y = ytd.rows[0];
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
    ytd: { ...y, margin: (+y.revenue_net - +y.cost).toFixed(2) },
    monthly: monthly.rows,
    receivables: receivables.rows[0],
    quotationsPending,
    deliveriesPending,
  });
});

// GET /api/reports/orders — detailed order report
router.get('/orders', async (req, res) => {
  const { from, to, status, client_id } = req.query;
  const vat = await vatDivisor();
  const { rows } = await pool.query(`
    SELECT o.id, o.order_number, o.external_ref, o.status, o.order_type, o.order_category, o.payment_status,
           o.deadline, o.created_at, o.delivered_at, o.sale_price,
           ROUND(o.sale_price / $5, 2) AS sale_price_net, oc.total_cost,
           CASE WHEN o.sale_price > 0 AND oc.total_cost > 0
                THEN ROUND((o.sale_price / $5 - oc.total_cost) / (o.sale_price / $5) * 100, 1)
                ELSE NULL END AS margin_pct,
           ${M2}::numeric(10,2) AS m2,
           c.name AS client_name, u.name AS created_by
    FROM orders o
    JOIN clients c ON c.id=o.client_id
    JOIN users u ON u.id=o.created_by
    LEFT JOIN order_costs oc ON oc.order_id=o.id
    WHERE ${range('o.created_at')}
      AND ($3::text IS NULL OR o.status=$3::order_status)
      AND ($4::uuid IS NULL OR o.client_id=$4)
    ORDER BY o.created_at DESC
    LIMIT 5000`,
    [from||null, to||null, status||null, client_id||null, vat]
  );
  res.json(rows);
});

// GET /api/reports/costs — cost vs revenue (sold orders, by hand-over date)
router.get('/costs', async (req, res) => {
  const { from, to } = req.query;
  const vat = await vatDivisor();
  const where = `${SOLD} AND ${range(SOLD_AT)}`;
  const [summary, monthly] = await Promise.all([
    pool.query(`
      SELECT
        COALESCE(SUM(oc.material_cost),0)::numeric(12,2) AS total_material,
        COALESCE(SUM(oc.labor_cost),0)::numeric(12,2) AS total_labor,
        COALESCE(SUM(oc.machine_cost),0)::numeric(12,2) AS total_machine,
        COALESCE(SUM(oc.overhead_cost),0)::numeric(12,2) AS total_overhead,
        COALESCE(SUM(oc.total_cost),0)::numeric(12,2) AS total_cost,
        COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS total_revenue,
        COALESCE(SUM(o.sale_price / $3),0)::numeric(12,2) AS total_revenue_net,
        COALESCE(SUM(o.sale_price / $3 - COALESCE(oc.total_cost,0)),0)::numeric(12,2) AS total_margin,
        COUNT(o.id)::int AS order_count,
        COALESCE(SUM(${M2}),0)::numeric(12,1) AS total_m2
      FROM orders o LEFT JOIN order_costs oc ON oc.order_id=o.id
      WHERE ${where}`, [from||null, to||null, vat]),
    pool.query(`
      SELECT DATE_TRUNC('month', ${SOLD_AT})::date AS month,
             COALESCE(SUM(o.sale_price),0)::numeric(12,2) AS revenue,
             COALESCE(SUM(o.sale_price / $3),0)::numeric(12,2) AS revenue_net,
             COALESCE(SUM(oc.total_cost),0)::numeric(12,2) AS cost,
             COALESCE(SUM(o.sale_price / $3 - COALESCE(oc.total_cost,0)),0)::numeric(12,2) AS margin,
             COUNT(*)::int AS orders,
             COALESCE(SUM(${M2}),0)::numeric(12,1) AS m2
      FROM orders o LEFT JOIN order_costs oc ON oc.order_id=o.id
      WHERE ${where}
      GROUP BY 1 ORDER BY 1`, [from||null, to||null, vat]),
  ]);
  res.json({ summary: summary.rows[0], monthly: monthly.rows });
});

// GET /api/reports/materials — material consumption
router.get('/materials', async (req, res) => {
  const { from, to } = req.query;
  const { rows } = await pool.query(`
    SELECT m.name, m.unit, m.category,
           SUM(ABS(sm.quantity))::numeric(12,4) AS total_consumed,
           SUM(ABS(sm.total_value))::numeric(12,2) AS total_value
    FROM stock_movements sm JOIN materials m ON m.id=sm.material_id
    WHERE sm.movement_type='ИЗПИСАНО' AND ${range('sm.created_at')}
    GROUP BY m.id, m.name, m.unit, m.category
    ORDER BY total_value DESC NULLS LAST`,
    [from||null, to||null]
  );
  res.json(rows);
});

// GET /api/reports/production — production per worker (labor and defects aggregated separately)
router.get('/production', async (req, res) => {
  const { from, to } = req.query;
  const { rows } = await pool.query(`
    SELECT u.name, u.role,
           COALESCE(l.orders_worked,0)::int AS orders_worked,
           COALESCE(l.total_minutes,0)::int AS total_minutes,
           COALESCE(l.labor_cost,0)::numeric(10,2) AS labor_cost,
           COALESCE(d.defects_caused,0)::int AS defects_caused
    FROM users u
    LEFT JOIN (
      SELECT worker_id, COUNT(DISTINCT order_id) AS orders_worked, SUM(minutes) AS total_minutes,
             SUM(minutes * hourly_rate / 60) AS labor_cost
      FROM labor_logs WHERE ${range('logged_at')} GROUP BY worker_id) l ON l.worker_id = u.id
    LEFT JOIN (
      SELECT worker_id, COUNT(*) AS defects_caused
      FROM defects WHERE ${range('created_at')} GROUP BY worker_id) d ON d.worker_id = u.id
    WHERE u.role='production'
    ORDER BY total_minutes DESC, u.name`,
    [from||null, to||null]
  );
  res.json(rows);
});

// GET /api/reports/clients — revenue by client
router.get('/clients', async (req, res) => {
  const { from, to } = req.query;
  const limit = Math.min(500, parseInt(req.query.limit) || 20);
  const { rows } = await pool.query(`
    SELECT c.id, c.name, c.phone,
      COUNT(o.id)::int AS total_orders,
      COUNT(o.id) FILTER (WHERE o.status <> 'ОТКАЗАНА')::int AS active_orders,
      COUNT(o.id) FILTER (WHERE o.status='ДОСТАВЕНА')::int AS delivered_orders,
      COUNT(o.id) FILTER (WHERE o.status='ОТКАЗАНА')::int AS cancelled_orders,
      COALESCE(SUM(o.sale_price) FILTER (WHERE ${SOLD}), 0)::numeric(12,2) AS total_revenue,
      COALESCE(AVG(o.sale_price) FILTER (WHERE ${SOLD}), 0)::numeric(12,2) AS avg_order_value,
      COALESCE(SUM(${M2}) FILTER (WHERE ${SOLD}), 0)::numeric(12,1) AS total_m2,
      MAX(o.created_at) AS last_order_at
    FROM clients c
    JOIN orders o ON o.client_id=c.id AND ${range('o.created_at')}
    GROUP BY c.id, c.name, c.phone
    ORDER BY total_revenue DESC
    LIMIT $3`,
    [from||null, to||null, limit]
  );
  res.json(rows);
});

// GET /api/reports/order-types — breakdown by type
router.get('/order-types', async (req, res) => {
  const { from, to } = req.query;
  const { rows } = await pool.query(`
    SELECT o.order_type,
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE o.status='ДОСТАВЕНА')::int AS delivered,
      COUNT(*) FILTER (WHERE o.status='ОТКАЗАНА')::int AS cancelled,
      COALESCE(SUM(o.sale_price) FILTER (WHERE ${SOLD}),0)::numeric(12,2) AS revenue,
      COALESCE(AVG(o.sale_price) FILTER (WHERE ${SOLD}),0)::numeric(12,2) AS avg_price,
      COALESCE(SUM(${M2}) FILTER (WHERE ${SOLD}),0)::numeric(12,1) AS m2
    FROM orders o
    WHERE ${range('o.created_at')}
    GROUP BY o.order_type ORDER BY total_orders DESC`,
    [from||null, to||null]
  );
  res.json(rows);
});

// GET /api/reports/products — what sells: by glass build-up / service
router.get('/products', async (req, res) => {
  const { from, to } = req.query;
  const { rows } = await pool.query(`
    SELECT oi.product_desc, oi.product_type,
           COUNT(*)::int AS lines, COUNT(DISTINCT o.id)::int AS orders,
           COALESCE(SUM(oi.qty),0)::numeric(12,1) AS pieces,
           COALESCE(SUM(COALESCE(oi.area_m2 * oi.qty, oi.width * oi.height / 1e6 * oi.qty)) FILTER (WHERE oi.uom='m2'),0)::numeric(12,1) AS m2,
           COALESCE(SUM(oi.line_total),0)::numeric(12,2) AS revenue
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE ${SOLD} AND ${range(SOLD_AT)}
    GROUP BY oi.product_desc, oi.product_type
    ORDER BY m2 DESC, revenue DESC
    LIMIT 50`,
    [from||null, to||null]
  );
  res.json(rows);
});

// GET /api/reports/receivables — unpaid / partially paid orders
router.get('/receivables', async (req, res) => {
  const { rows } = await pool.query(`
    SELECT o.id, o.order_number, o.external_ref, o.status, o.payment_status, o.created_at, o.delivered_at,
           o.sale_price, c.id AS client_id, c.name AS client_name, c.phone AS client_phone,
           COALESCE((SELECT SUM(amount) FROM payments p WHERE p.order_id = o.id),0)::numeric(12,2) AS paid,
           (o.sale_price - COALESCE((SELECT SUM(amount) FROM payments p WHERE p.order_id = o.id),0))::numeric(12,2) AS due
    FROM orders o JOIN clients c ON c.id = o.client_id
    WHERE o.payment_status <> 'платена' AND o.status <> 'ОТКАЗАНА' AND o.order_category = 'нормална'
      AND COALESCE(o.sale_price,0) > 0
    ORDER BY (o.status = 'ДОСТАВЕНА') DESC, o.delivered_at ASC NULLS LAST, o.created_at`);
  res.json(rows);
});

// GET /api/reports/defect-analysis — defect breakdown
router.get('/defect-analysis', async (req, res) => {
  const { from, to } = req.query;
  const [byCause, byWorker, monthly] = await Promise.all([
    pool.query(`
      SELECT cause_type, COUNT(*)::int AS count, COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
      FROM defects WHERE ${range('created_at')}
      GROUP BY cause_type ORDER BY count DESC`, [from||null, to||null]),
    pool.query(`
      SELECT u.name AS worker_name, COUNT(d.id)::int AS defect_count,
             COALESCE(SUM(d.total_cost),0)::numeric(10,2) AS total_cost
      FROM users u LEFT JOIN defects d ON d.worker_id=u.id AND ${range('d.created_at')}
      WHERE u.role='production' GROUP BY u.id, u.name ORDER BY defect_count DESC`, [from||null, to||null]),
    pool.query(`
      SELECT DATE_TRUNC('month', created_at)::date AS month, COUNT(*)::int AS count,
             COALESCE(SUM(total_cost),0)::numeric(10,2) AS total_cost
      FROM defects WHERE ${range('created_at')}
      GROUP BY 1 ORDER BY 1`, [from||null, to||null]),
  ]);
  res.json({ byCause: byCause.rows, byWorker: byWorker.rows, monthly: monthly.rows });
});

module.exports = router;
