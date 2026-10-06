const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const notify = require('../utils/notify');
const { sendEmail, orderReadyEmail } = require('../utils/email');
const { canSeeMoney, stripMoney, ORDER_FIELDS, ITEM_FIELDS, COST_FIELDS, DEFECT_FIELDS, LABOR_FIELDS } = require('../utils/financial');
const { getSettings, priceLine, sumLines, n } = require('../utils/pricing');
const { stageTemplate } = require('./options');
const { audit, diff } = require('../utils/audit');

const router = express.Router();
router.use(auth);

const STAGE_TEMPLATES = {
  'стъклопакет':      [{ name: 'Рязане', order: 1 }, { name: 'Миене', order: 2 }, { name: 'Сглобяване', order: 3 }, { name: 'Заливане', order: 4 }],
  'единично_стъкло':  [{ name: 'Рязане', order: 1 }, { name: 'Шлайфане', order: 2 }, { name: 'Кантиране', order: 3 }],
  'смесена':          [{ name: 'Рязане', order: 1 }, { name: 'Миене', order: 2 }, { name: 'Сглобяване', order: 3 }, { name: 'Заливане', order: 4 }],
};

const ACTIVE = `o.status NOT IN ('ДОСТАВЕНА','ОТКАЗАНА')`;
const CATEGORIES   = ['нормална', 'гаранция', 'вътрешна', 'мострена'];
const PAYMENTS     = ['неплатена', 'частично', 'платена'];
const INSTALLS     = ['ЗА_МОНТАЖ', 'МОНТИРАНА'];
const FULFILLMENTS = ['вземане', 'доставка', 'монтаж'];

// Who may move an order between which statuses. Admin may do anything.
const TRANSITIONS = {
  office: {
    'НОВА':         ['МАТЕРИАЛИ', 'ПРОИЗВОДСТВО', 'ОТКАЗАНА'],
    'МАТЕРИАЛИ':    ['ПРОИЗВОДСТВО', 'НОВА', 'ОТКАЗАНА'],
    'ПРОИЗВОДСТВО': ['ГОТОВА', 'ОТКАЗАНА'],
    'ГОТОВА':       ['ДОСТАВЕНА', 'ПРОИЗВОДСТВО'],
  },
  production: {
    'МАТЕРИАЛИ':    ['ПРОИЗВОДСТВО'],
    'ПРОИЗВОДСТВО': ['ГОТОВА'],
  },
  warehouse: {
    'ГОТОВА':       ['ДОСТАВЕНА'],
  },
};
const ALL_STATUSES = ['НОВА', 'МАТЕРИАЛИ', 'ПРОИЗВОДСТВО', 'ГОТОВА', 'ДОСТАВЕНА', 'ОТКАЗАНА'];

const allowedNext = (role, from) =>
  role === 'admin' ? ALL_STATUSES.filter(s => s !== from) : (TRANSITIONS[role]?.[from] || []);

// Runs fn inside a transaction on a dedicated client; always releases, rolls back on any throw.
async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const send = (res, err) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  throw err;
};

async function insertItems(client, orderId, items, orderType, settings) {
  const priced = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it.product_desc?.trim()) continue;
    const productType = it.product_type || orderType;
    const p = priceLine({ ...it, product_type: productType }, settings);
    const { rows } = await client.query(
      `INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price,
                                uom, area_m2, billed_qty, line_total, notes, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [orderId, productType, it.product_desc.trim(), n(it.width), n(it.height), p.qty, n(it.unit_price),
       p.uom, p.area_m2, p.billed_qty, p.line_total, it.notes || null, i]
    );
    priced.push(rows[0]);
  }
  return priced;
}

async function createStages(client, orderId, orderType) {
  // Stages are configured in Настройки → Етапи; the built-in template is only a fallback
  const configured = await stageTemplate(orderType, client);
  const stages = configured.length
    ? configured.map((name, i) => ({ name, order: i + 1 }))
    : STAGE_TEMPLATES[orderType] || STAGE_TEMPLATES['стъклопакет'];
  for (const s of stages) {
    await client.query('INSERT INTO production_stages (order_id, stage_name, stage_order) VALUES ($1,$2,$3)',
      [orderId, s.name, s.order]);
  }
}

async function initCosts(client, orderId) {
  const s = await getSettings();
  await client.query(
    `INSERT INTO order_costs (order_id, overhead_pct) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [orderId, n(s.default_overhead_pct) ?? 15]);
}

// Recompute the order's sale price from its items — but only if the price was not set manually,
// i.e. it still equals the previous items total (or is empty).
async function syncSalePrice(client, orderId, previousItemsTotal) {
  const { rows: [o] } = await client.query('SELECT sale_price FROM orders WHERE id=$1', [orderId]);
  const { rows: items } = await client.query('SELECT line_total FROM order_items WHERE order_id=$1', [orderId]);
  const total = sumLines(items);
  const current = n(o.sale_price);
  if (current === null || current === 0 || Math.abs(current - previousItemsTotal) < 0.01) {
    await client.query('UPDATE orders SET sale_price=$1, updated_at=NOW() WHERE id=$2', [total, orderId]);
  }
  return total;
}

// ─── GET /api/orders ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { status, client_id, urgent, from, to, deadline_from, deadline_to, search,
          payment_status, order_category, fulfillment, installation_status, active } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 50));
  const params = [];
  const conds = [];
  const add = (sql, v) => { params.push(v); conds.push(sql.replace('$?', `$${params.length}`)); };

  if (status)              add(`o.status = $?::order_status`, status);
  if (client_id)           add(`o.client_id = $?`, client_id);
  if (urgent === 'true')   conds.push(`o.is_urgent = true`);
  if (active === 'true')   conds.push(ACTIVE);
  if (from)                add(`o.created_at >= $?::date`, from);
  if (to)                  add(`o.created_at < $?::date + 1`, to);
  if (deadline_from)       add(`o.deadline >= $?::date`, deadline_from);
  if (deadline_to)         add(`o.deadline <= $?::date`, deadline_to);
  if (payment_status)      add(`o.payment_status = $?`, payment_status);
  if (order_category)      add(`o.order_category = $?`, order_category);
  if (fulfillment)         add(`o.fulfillment = $?`, fulfillment);
  if (installation_status) add(`o.installation_status = $?`, installation_status);
  if (search) {
    params.push(`%${search.trim()}%`);
    const p = `$${params.length}`;
    conds.push(`(c.name ILIKE ${p} OR o.order_number::text ILIKE ${p} OR o.external_ref ILIKE ${p} OR c.phone ILIKE ${p} OR o.client_ref ILIKE ${p})`);
  }

  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

  const query = `
    SELECT o.id, o.order_number, o.external_ref, o.client_ref, o.status, o.order_type, o.order_category,
           o.payment_status, o.installation_status, o.fulfillment, o.deadline, o.is_urgent,
           o.created_at, o.updated_at, o.delivered_at, o.sale_price,
           c.id AS client_id, c.name AS client_name, c.phone AS client_phone,
           u.name AS created_by_name, oc.total_cost,
           (SELECT COALESCE(SUM(amount),0) FROM payments p WHERE p.order_id = o.id) AS paid_amount,
           (SELECT COALESCE(SUM(COALESCE(oi.area_m2 * oi.qty, oi.width * oi.height / 1e6 * oi.qty)),0)::numeric(10,2)
              FROM order_items oi WHERE oi.order_id = o.id AND oi.uom = 'm2') AS total_m2,
           (SELECT COUNT(*)::int FROM defects d WHERE d.order_id = o.id AND d.decision IS NULL) AS open_defects,
           (SELECT COUNT(*)::int FROM production_stages ps WHERE ps.order_id = o.id) AS total_stages,
           (SELECT COUNT(*)::int FROM production_stages ps WHERE ps.order_id = o.id AND ps.status = 'ГОТОВ') AS done_stages
    FROM orders o
    JOIN clients c ON c.id = o.client_id
    JOIN users u ON u.id = o.created_by
    LEFT JOIN order_costs oc ON oc.order_id = o.id
    ${where}
    ORDER BY (${ACTIVE}) DESC,
             CASE WHEN ${ACTIVE} THEN o.is_urgent END DESC NULLS LAST,
             CASE WHEN ${ACTIVE} THEN o.deadline END ASC NULLS LAST,
             o.created_at DESC, o.order_number DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  const [data, count] = await Promise.all([
    pool.query(query, [...params, limit, (page - 1) * limit]),
    pool.query(`SELECT COUNT(*)::int FROM orders o JOIN clients c ON c.id = o.client_id ${where}`, params),
  ]);
  res.json({ data: stripMoney(req.user, data.rows), total: count.rows[0].count, page, limit });
});

// ─── GET /api/orders/price-hints?desc=…&client_id=… ─────────────────────────────
// Selling prices aren't written down anywhere — they live in past orders. For a product description
// this returns the usual €/unit across all clients (last 12 months) and the last price for this client.
router.get('/price-hints', roleCheck('admin', 'office'), async (req, res) => {
  const desc = String(req.query.desc || '').trim();
  const uom = ['m2', 'lm', 'pcs', 'fixed'].includes(req.query.uom) ? req.query.uom : 'm2';
  if (desc.length < 3) return res.json({ usual: null, client_last: null });
  const [usual, last] = await Promise.all([
    pool.query(
      `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY oi.unit_price)::numeric(10,2) AS median,
              MIN(oi.unit_price)::numeric(10,2) AS min, MAX(oi.unit_price)::numeric(10,2) AS max, COUNT(*)::int AS n
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE UPPER(oi.product_desc) = UPPER($1) AND oi.unit_price > 0
         AND o.order_category = 'нормална' AND o.created_at > NOW() - INTERVAL '12 months'`, [desc]),
    req.query.client_id
      ? pool.query(
          `SELECT oi.unit_price, o.created_at, o.external_ref, o.order_number
           FROM order_items oi JOIN orders o ON o.id = oi.order_id
           WHERE o.client_id = $1 AND UPPER(oi.product_desc) = UPPER($2) AND oi.unit_price > 0
           ORDER BY o.created_at DESC LIMIT 1`, [req.query.client_id, desc])
      : { rows: [] },
  ]);
  res.json({ usual: usual.rows[0].n ? usual.rows[0] : null, client_last: last.rows[0] || null });
});

// ─── GET /api/orders/:id/history — edits, line and payment changes (office/admin) ─
router.get('/:id/history', roleCheck('admin', 'office'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.action, a.old_data, a.new_data, a.created_at, u.name AS user_name
     FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.table_name = 'orders' AND a.record_id = $1 ORDER BY a.created_at`, [req.params.id]);
  res.json(rows);
});

// ─── GET /api/orders/:id — full detail ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const orderQ = await pool.query(
    `SELECT o.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email,
            c.address AS client_address, u.name AS created_by_name, ub.name AS updated_by_name
     FROM orders o
     JOIN clients c ON c.id = o.client_id
     JOIN users u ON u.id = o.created_by
     LEFT JOIN users ub ON ub.id = o.updated_by
     WHERE o.id=$1`, [req.params.id]
  );
  if (!orderQ.rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });

  const id = req.params.id;
  const [items, stages, costs, defects, files, labor, payments, related] = await Promise.all([
    pool.query('SELECT * FROM order_items WHERE order_id=$1 ORDER BY sort_order, created_at', [id]),
    pool.query(`SELECT ps.*, u.name AS worker_name, m.name AS machine_name
                FROM production_stages ps
                LEFT JOIN users u ON u.id = ps.assigned_to
                LEFT JOIN machines m ON m.id = ps.machine_id
                WHERE ps.order_id=$1 ORDER BY ps.stage_order`, [id]),
    pool.query('SELECT * FROM order_costs WHERE order_id=$1', [id]),
    pool.query(`SELECT d.*, u.name AS worker_name, m.name AS machine_name
                FROM defects d
                LEFT JOIN users u ON u.id = d.worker_id
                LEFT JOIN machines m ON m.id = d.machine_id
                WHERE d.order_id=$1 ORDER BY d.created_at DESC`, [id]),
    pool.query(`SELECT f.id, f.order_id, f.original_name, f.mime_type, f.file_size, f.created_at,
                       f.uploaded_by, u.name AS uploaded_by_name
                FROM order_files f JOIN users u ON u.id = f.uploaded_by
                WHERE f.order_id=$1 ORDER BY f.created_at DESC`, [id]),
    pool.query(`SELECT ll.*, u.name AS worker_name, ps.stage_name
                FROM labor_logs ll JOIN users u ON u.id = ll.worker_id
                LEFT JOIN production_stages ps ON ps.id = ll.stage_id
                WHERE ll.order_id=$1 ORDER BY ll.logged_at DESC`, [id]),
    canSeeMoney(req.user)
      ? pool.query(`SELECT p.*, u.name AS created_by_name FROM payments p
                    LEFT JOIN users u ON u.id = p.created_by
                    WHERE p.order_id=$1 ORDER BY p.paid_at, p.created_at`, [id])
      : { rows: [] },
    // The original order (if this is a complaint/rework) and the complaints raised against this order
    pool.query(`SELECT o.id, o.order_number, o.external_ref, o.status, o.order_category, o.created_at,
                       (o.id = (SELECT related_order_id FROM orders WHERE id=$1)) AS is_original
                FROM orders o WHERE o.id = (SELECT related_order_id FROM orders WHERE id=$1) OR o.related_order_id = $1
                ORDER BY o.created_at`, [id]),
  ]);

  const order = orderQ.rows[0];
  const paid = payments.rows.reduce((s, p) => s + +p.amount, 0);
  res.json({
    ...stripMoney(req.user, order),
    ...(canSeeMoney(req.user) ? { paid_amount: paid } : {}),
    allowed_statuses: allowedNext(req.user.role, order.status),
    items: stripMoney(req.user, items.rows, ITEM_FIELDS.concat(['line_cost'])),
    stages: stages.rows,
    costs: costs.rows[0] ? stripMoney(req.user, costs.rows[0], COST_FIELDS) : null,
    defects: stripMoney(req.user, defects.rows, DEFECT_FIELDS),
    files: files.rows,
    labor: stripMoney(req.user, labor.rows, LABOR_FIELDS),
    payments: payments.rows,
    related_original: related.rows.find(r => r.is_original) || null,
    related_claims: related.rows.filter(r => !r.is_original),
  });
});

// ─── POST /api/orders ───────────────────────────────────────────────────────────
router.post('/', roleCheck('admin', 'office'), async (req, res) => {
  const { client_id, order_type, order_category, deadline, is_urgent, sale_price, notes,
          delivery_address, source, items, fulfillment, external_ref, initial_status, related_order_id, client_ref } = req.body;
  if (!client_id || !order_type) {
    return res.status(400).json({ error: 'Клиентът и типът са задължителни' });
  }
  if (order_category && !CATEGORIES.includes(order_category)) return res.status(400).json({ error: 'Невалидна категория' });
  if (fulfillment && !FULFILLMENTS.includes(fulfillment)) return res.status(400).json({ error: 'Невалиден начин на предаване' });
  const settings = await getSettings();

  const order = await tx(async client => {
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (client_id, order_type, order_category, deadline, is_urgent, sale_price, notes,
                           delivery_address, source, created_by, fulfillment, external_ref, status,
                           installation_status, related_order_id, client_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::order_status,$14,$15,$16) RETURNING *`,
      [client_id, order_type, order_category || 'нормална', deadline || null, !!is_urgent,
       n(sale_price), notes || null, delivery_address || null, source || 'office', req.user.id,
       fulfillment || 'вземане', external_ref?.trim() || null,
       ['НОВА', 'МАТЕРИАЛИ', 'ПРОИЗВОДСТВО'].includes(initial_status) ? initial_status : 'НОВА',
       fulfillment === 'монтаж' ? 'ЗА_МОНТАЖ' : null, related_order_id || null, client_ref?.trim() || null]
    );
    const priced = await insertItems(client, order.id, Array.isArray(items) ? items : [], order_type, settings);
    // No manual price given → the order price is the sum of its lines
    if (n(sale_price) === null && priced.length) {
      order.sale_price = sumLines(priced);
      await client.query('UPDATE orders SET sale_price=$1 WHERE id=$2', [order.sale_price, order.id]);
    }
    await createStages(client, order.id, order_type);
    await initCosts(client, order.id);
    return order;
  });
  res.status(201).json(order);
});

// ─── PATCH /api/orders/:id/status ──────────────────────────────────────────────
router.patch('/:id/status', roleCheck('admin', 'office', 'production', 'warehouse'), async (req, res) => {
  const { status, notes } = req.body;
  if (!ALL_STATUSES.includes(status)) return res.status(400).json({ error: 'Невалиден статус' });

  const { rows } = await pool.query('SELECT status FROM orders WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });
  const current = rows[0].status;
  if (!allowedNext(req.user.role, current).includes(status)) {
    return res.status(403).json({ error: `Нямате право да преместите поръчката от „${current}“ в „${status}“` });
  }

  const order = await tx(async client => {
    const { rows: [order] } = await client.query(
      `UPDATE orders SET status=$1::order_status, updated_by=$2, updated_at=NOW(),
         delivered_at = CASE WHEN $1 = 'ДОСТАВЕНА' THEN COALESCE(delivered_at, NOW())
                             WHEN $1 <> 'ДОСТАВЕНА' THEN NULL ELSE delivered_at END,
         installation_status = CASE WHEN $1 = 'ДОСТАВЕНА' AND fulfillment = 'монтаж' AND installation_status IS NULL
                                    THEN 'ЗА_МОНТАЖ' ELSE installation_status END
       WHERE id=$3
       RETURNING *,
         (SELECT name FROM clients WHERE id=orders.client_id) AS client_name,
         (SELECT email FROM clients WHERE id=orders.client_id) AS client_email`,
      [status, req.user.id, req.params.id]
    );
    // A status note goes to the order's conversation — it must never overwrite the order notes
    await client.query(
      `INSERT INTO order_comments (order_id, user_id, message) VALUES ($1,$2,$3)`,
      [order.id, req.user.id, `Статус: ${current} → ${status}${notes?.trim() ? ` — ${notes.trim()}` : ''}`]
    );
    if (status === 'ДОСТАВЕНА') {
      await client.query(
        `UPDATE deliveries SET status='DELIVERED', delivered_at=COALESCE(delivered_at, NOW()), updated_at=NOW()
         WHERE order_id=$1 AND status IN ('PENDING','IN_TRANSIT')`, [order.id]);
    }
    return order;
  });

  const link = `/orders/${order.id}`;
  const num = order.external_ref || `#${order.order_number}`;
  if (status === 'ГОТОВА') {
    await notify({ roles: ['admin', 'office'], type: 'order_ready',
      title: `Поръчка ${num} е готова`, body: `Клиент: ${order.client_name} — готова за предаване`, link, orderId: order.id });
    if (order.client_email) {
      const trackUrl = order.tracking_token && process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/track/${order.tracking_token}` : null;
      sendEmail({ to: order.client_email, ...orderReadyEmail(num, order.client_name, trackUrl) });
    }
  } else if (status === 'ПРОИЗВОДСТВО') {
    await notify({ roles: ['production'], type: 'order_production',
      title: `Нова поръчка в производство: ${num}`, body: `Клиент: ${order.client_name}`, link, orderId: order.id });
  } else if (status === 'ОТКАЗАНА') {
    await notify({ roles: ['admin', 'office'], type: 'order_cancelled',
      title: `Поръчка ${num} е отказана`, body: `Отказана от ${req.user.name}`, link, orderId: order.id });
  } else if (status === 'ДОСТАВЕНА') {
    await notify({ roles: ['admin', 'office'], type: 'order_delivered',
      title: `Поръчка ${num} е предадена`, body: `Клиент: ${order.client_name}`, link, orderId: order.id });
  }
  res.json(stripMoney(req.user, order));
});

// ─── POST /api/orders/:id/clone ─────────────────────────────────────────────────
router.post('/:id/clone', roleCheck('admin', 'office'), async (req, res) => {
  try {
    const clone = await tx(async client => {
      const { rows: [s] } = await client.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
      if (!s) throw new HttpError(404, 'Поръчката не е намерена');
      const { rows: items } = await client.query(
        'SELECT * FROM order_items WHERE order_id=$1 ORDER BY sort_order', [s.id]);
      const { rows: stages } = await client.query(
        'SELECT stage_name, stage_order FROM production_stages WHERE order_id=$1 ORDER BY stage_order', [s.id]);

      const { rows: [c] } = await client.query(
        `INSERT INTO orders (client_id, order_type, order_category, deadline, is_urgent, sale_price, notes,
                             delivery_address, source, created_by, fulfillment, installation_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [s.client_id, s.order_type, s.order_category, req.body.deadline || null,
         req.body.is_urgent ?? s.is_urgent, s.sale_price, s.notes, s.delivery_address, s.source,
         req.user.id, s.fulfillment, s.fulfillment === 'монтаж' ? 'ЗА_МОНТАЖ' : null]
      );
      for (const it of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price, uom,
                                    area_m2, billed_qty, line_total, line_cost, thickness_mm, notes, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [c.id, it.product_type, it.product_desc, it.width, it.height, it.qty, it.unit_price, it.uom,
           it.area_m2, it.billed_qty, it.line_total, it.line_cost, it.thickness_mm, it.notes, it.sort_order]
        );
      }
      if (stages.length) {
        for (const st of stages) {
          await client.query('INSERT INTO production_stages (order_id, stage_name, stage_order) VALUES ($1,$2,$3)',
            [c.id, st.stage_name, st.stage_order]);
        }
      } else {
        await createStages(client, c.id, s.order_type);
      }
      await initCosts(client, c.id);
      return c;
    });
    res.status(201).json(clone);
  } catch (err) { send(res, err); }
});

// ─── PATCH /api/orders/:id — edit order header ─────────────────────────────────
// Only keys present in the body are changed; an explicit null/'' clears a nullable field.
const EDITABLE = {
  client_id:           v => v || undefined,
  order_type:          v => v || undefined,
  order_category:      v => { if (!CATEGORIES.includes(v)) throw new HttpError(400, 'Невалидна категория'); return v; },
  payment_status:      v => { if (!PAYMENTS.includes(v)) throw new HttpError(400, 'Невалиден статус на плащане'); return v; },
  installation_status: v => { if (v && !INSTALLS.includes(v)) throw new HttpError(400, 'Невалиден статус на монтаж'); return v || null; },
  fulfillment:         v => { if (!FULFILLMENTS.includes(v)) throw new HttpError(400, 'Невалиден начин на предаване'); return v; },
  deadline:            v => v || null,
  is_urgent:           v => !!v,
  sale_price:          v => n(v),
  notes:               v => (v?.trim?.() ? v.trim() : null),
  delivery_address:    v => (v?.trim?.() ? v.trim() : null),
  source:              v => v || 'office',
  external_ref:        v => (v?.trim?.() ? v.trim() : null),
  related_order_id:    v => v || null,
  client_ref:          v => (v?.trim?.() ? v.trim().slice(0, 80) : null),
};

router.patch('/:id', roleCheck('admin', 'office'), async (req, res) => {
  try {
    const sets = [], params = [];
    for (const [key, conv] of Object.entries(EDITABLE)) {
      if (!(key in req.body)) continue;
      const v = conv(req.body[key]);
      if (v === undefined) continue;
      params.push(v);
      sets.push(`${key}=$${params.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
    params.push(req.user.id, req.params.id);
    const { rows: [before] } = await pool.query('SELECT * FROM orders WHERE id=$1', [req.params.id]);
    const { rows } = await pool.query(
      `UPDATE orders SET ${sets.join(', ')}, updated_by=$${params.length - 1}, updated_at=NOW()
       WHERE id=$${params.length} RETURNING *`, params);
    if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });
    const changes = diff(before, rows[0], Object.keys(EDITABLE));
    if (Object.keys(changes).length) {
      await audit({ user: req.user, action: 'order_edit', table: 'orders', id: rows[0].id, after: changes });
    }
    res.json(rows[0]);
  } catch (err) { send(res, err); }
});

// ─── Order items (add / edit / delete) — admin & office ────────────────────────
const ITEM_KEYS = ['product_type', 'product_desc', 'width', 'height', 'qty', 'unit_price', 'uom', 'notes'];

router.post('/:id/items', roleCheck('admin', 'office'), async (req, res) => {
  if (!req.body.product_desc?.trim()) return res.status(400).json({ error: 'Описанието е задължително' });
  const settings = await getSettings();
  const item = await tx(async client => {
    const { rows: [o] } = await client.query('SELECT id, order_type FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!o) throw new HttpError(404, 'Поръчката не е намерена');
    const { rows: before } = await client.query('SELECT line_total FROM order_items WHERE order_id=$1', [o.id]);
    const { rows: [{ max }] } = await client.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max FROM order_items WHERE order_id=$1', [o.id]);
    const [it] = await insertItems(client, o.id, [req.body], o.order_type, settings);
    await client.query('UPDATE order_items SET sort_order=$1 WHERE id=$2', [max + 1, it.id]);
    await syncSalePrice(client, o.id, sumLines(before));
    return it;
  }).catch(err => send(res, err));
  if (item) {
    await audit({ user: req.user, action: 'item_add', table: 'orders', id: req.params.id,
      after: { desc: item.product_desc, size: [item.width, item.height], qty: item.qty, line_total: item.line_total } });
    res.status(201).json(item);
  }
});

router.patch('/:id/items/:itemId', roleCheck('admin', 'office'), async (req, res) => {
  const settings = await getSettings();
  const item = await tx(async client => {
    const { rows: [cur] } = await client.query(
      'SELECT * FROM order_items WHERE id=$1 AND order_id=$2', [req.params.itemId, req.params.id]);
    if (!cur) throw new HttpError(404, 'Артикулът не е намерен');
    const { rows: before } = await client.query('SELECT line_total FROM order_items WHERE order_id=$1', [req.params.id]);
    const next = { ...cur };
    for (const k of ITEM_KEYS) if (k in req.body) next[k] = req.body[k];
    if (!String(next.product_desc || '').trim()) throw new HttpError(400, 'Описанието е задължително');
    const p = priceLine(next, settings);
    const { rows: [it] } = await client.query(
      `UPDATE order_items SET product_type=$1, product_desc=$2, width=$3, height=$4, qty=$5, unit_price=$6,
         uom=$7, area_m2=$8, billed_qty=$9, line_total=$10, notes=$11
       WHERE id=$12 RETURNING *`,
      [next.product_type, String(next.product_desc).trim(), n(next.width), n(next.height), p.qty,
       n(next.unit_price), p.uom, p.area_m2, p.billed_qty, p.line_total, next.notes || null, cur.id]);
    await syncSalePrice(client, req.params.id, sumLines(before));
    const changes = diff(cur, it, ['product_desc', 'width', 'height', 'qty', 'unit_price', 'uom', 'line_total']);
    if (Object.keys(changes).length) {
      await audit({ db: client, user: req.user, action: 'item_edit', table: 'orders', id: req.params.id,
        after: { desc: it.product_desc, ...changes } });
    }
    return it;
  }).catch(err => send(res, err));
  if (item) res.json(item);
});

router.delete('/:id/items/:itemId', roleCheck('admin', 'office'), async (req, res) => {
  const ok = await tx(async client => {
    const { rows: before } = await client.query('SELECT line_total FROM order_items WHERE order_id=$1', [req.params.id]);
    const { rows: gone } = await client.query(
      'DELETE FROM order_items WHERE id=$1 AND order_id=$2 RETURNING product_desc, line_total', [req.params.itemId, req.params.id]);
    if (!gone.length) throw new HttpError(404, 'Артикулът не е намерен');
    await audit({ db: client, user: req.user, action: 'item_delete', table: 'orders', id: req.params.id,
      before: { desc: gone[0].product_desc, line_total: gone[0].line_total } });
    await syncSalePrice(client, req.params.id, sumLines(before));
    return true;
  }).catch(err => send(res, err));
  if (ok) res.json({ ok: true });
});

// ─── Payments — admin & office ──────────────────────────────────────────────────
async function refreshPaymentStatus(client, orderId) {
  const { rows: [r] } = await client.query(
    `SELECT o.sale_price, COALESCE(SUM(p.amount),0) AS paid
     FROM orders o LEFT JOIN payments p ON p.order_id = o.id WHERE o.id=$1 GROUP BY o.id`, [orderId]);
  const paid = +r.paid, price = +r.sale_price || 0;
  const status = paid <= 0 ? 'неплатена' : (price > 0 && paid + 0.01 < price ? 'частично' : 'платена');
  await client.query('UPDATE orders SET payment_status=$1, updated_at=NOW() WHERE id=$2', [status, orderId]);
  return { paid, status };
}

router.post('/:id/payments', roleCheck('admin', 'office'), async (req, res) => {
  const amount = n(req.body.amount);
  if (!amount) return res.status(400).json({ error: 'Въведете сума' });
  const result = await tx(async client => {
    const { rows: [o] } = await client.query('SELECT id FROM orders WHERE id=$1', [req.params.id]);
    if (!o) throw new HttpError(404, 'Поръчката не е намерена');
    const { rows: [p] } = await client.query(
      `INSERT INTO payments (order_id, amount, method, paid_at, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [o.id, amount, req.body.method || 'брой', req.body.paid_at || new Date().toISOString().slice(0, 10),
       req.body.notes || null, req.user.id]);
    await audit({ db: client, user: req.user, action: 'payment_add', table: 'orders', id: o.id,
      after: { amount: p.amount, method: p.method } });
    return { payment: p, ...(await refreshPaymentStatus(client, o.id)) };
  }).catch(err => send(res, err));
  if (result) res.status(201).json(result);
});

router.delete('/:id/payments/:paymentId', roleCheck('admin', 'office'), async (req, res) => {
  const result = await tx(async client => {
    const { rows: gone } = await client.query('DELETE FROM payments WHERE id=$1 AND order_id=$2 RETURNING amount, method',
      [req.params.paymentId, req.params.id]);
    if (!gone.length) throw new HttpError(404, 'Плащането не е намерено');
    await audit({ db: client, user: req.user, action: 'payment_delete', table: 'orders', id: req.params.id,
      before: { amount: gone[0].amount, method: gone[0].method } });
    return refreshPaymentStatus(client, req.params.id);
  }).catch(err => send(res, err));
  if (result) res.json(result);
});

module.exports = router;
module.exports.allowedNext = allowedNext;
