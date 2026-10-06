// API tests. Run with: npm test
// Builds a throw-away database (espeho_test) from all migrations — including the full spreadsheet
// import — then exercises the API as each role through a real HTTP server.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const bcrypt = require('bcryptjs');

const TEST_DB = process.env.TEST_DB_NAME || 'espeho_test';
process.env.DB_NAME = TEST_DB;
delete process.env.DATABASE_URL;
process.env.JWT_SECRET = 'test-secret';
process.env.UPLOAD_DIR = require('node:path').join(require('node:os').tmpdir(), 'espeho-test-uploads');

const psqlUser = process.env.DB_USER ? `-U ${process.env.DB_USER}` : '';
execSync(`psql ${psqlUser} -d postgres -qc "DROP DATABASE IF EXISTS ${TEST_DB}" -c "CREATE DATABASE ${TEST_DB}"`, { stdio: 'pipe' });

const pool = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const app = require('../src/app');

let server, base;
const tokens = {};
const ids = {};

async function call(method, path, { role = 'admin', body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tokens[role] ? { Authorization: `Bearer ${tokens[role]}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

before(async () => {
  await migrate();
  const hash = await bcrypt.hash('test1234', 4);
  for (const role of ['office', 'production', 'warehouse']) {
    await pool.query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$1)`,
      [role, `${role}@test.bg`, hash]);
  }
  await new Promise(r => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}/api`;
  for (const [role, email, pw] of [['admin', 'admin@espeho.com', 'espeho2024'], ['office', 'office@test.bg', 'test1234'],
                                    ['production', 'production@test.bg', 'test1234'], ['warehouse', 'warehouse@test.bg', 'test1234']]) {
    const r = await call('POST', '/auth/login', { role: null, body: { email, password: pw } });
    assert.equal(r.status, 200, `login ${role}`);
    tokens[role] = r.data.token;
  }
});

after(async () => {
  server?.close();
  await pool.end();
});

test('spreadsheet import: all orders, totals and clients', async () => {
  const { rows: [r] } = await pool.query(
    `SELECT COUNT(*)::int AS orders, ROUND(SUM(sale_price))::int AS sales,
            COUNT(*) FILTER (WHERE created_at > NOW())::int AS future,
            (SELECT COUNT(*)::int FROM clients WHERE name IN ('М-Ж','ОФИС','Д-КА','д-ка')) AS channel_clients
     FROM orders WHERE external_ref IS NOT NULL`);
  assert.equal(r.orders, 3147);
  assert.equal(r.sales, 527827);
  assert.equal(r.future, 0);
  assert.equal(r.channel_clients, 0, 'channel words must not be clients');
});

test('health and public tracking do not leak internals', async () => {
  assert.equal((await call('GET', '/health', { role: null })).status, 200);
  const { rows: [o] } = await pool.query(`SELECT tracking_token FROM orders LIMIT 1`);
  const r = await call('GET', `/public/track/${o.tracking_token}`, { role: null });
  assert.equal(r.status, 200);
  assert.equal(r.data.notes, undefined);
  assert.equal(r.data.sale_price, undefined);
  assert.deepEqual(r.data.stages, []);
  assert.equal((await call('GET', '/public/track/not-a-uuid', { role: null })).status, 404);
});

test('bad input returns 4xx instead of crashing the server', async () => {
  assert.equal((await call('GET', '/comments/abc')).status, 400);
  assert.equal((await call('GET', '/files/abc')).status, 400);
  assert.equal((await call('GET', '/orders/not-a-uuid')).status, 400);
  assert.equal((await call('GET', '/health', { role: null })).status, 200, 'server still alive');
});

test('shop floor and warehouse never receive money fields', async () => {
  for (const role of ['production', 'warehouse']) {
    const list = await call('GET', '/orders?limit=5', { role });
    assert.equal(list.status, 200);
    for (const o of list.data.data) {
      assert.equal(o.sale_price, undefined, `${role} list sale_price`);
      assert.equal(o.total_cost, undefined, `${role} list total_cost`);
    }
    const d = await call('GET', `/orders/${list.data.data[0].id}`, { role });
    assert.equal(d.data.sale_price, undefined, `${role} detail sale_price`);
    for (const it of d.data.items) assert.equal(it.unit_price, undefined);
    if (d.data.costs) assert.equal(d.data.costs.total_cost, undefined);
    const p = await call('GET', '/products', { role });
    assert.equal(p.data[0].unit_price, undefined, `${role} catalog price`);
    assert.equal((await call('GET', '/reports/dashboard', { role })).status, 403);
  }
  const office = await call('GET', '/orders?limit=1', { role: 'office' });
  assert.notEqual(office.data.data[0].sale_price, undefined, 'office sees prices');
});

test('search finds orders by original spreadsheet number', async () => {
  const r = await call('GET', '/orders?search=326-00160');
  assert.equal(r.status, 200);
  assert.ok(r.data.data.some(o => o.external_ref === '326-00160'));
});

test('create order: m² pricing with minimum area, then items, payments and status rules', async () => {
  const c = await call('POST', '/clients', { role: 'office', body: { name: 'Тест Клиент ЕООД', phone: '0888' } });
  assert.equal(c.status, 201);
  ids.client = c.data.id;

  const o = await call('POST', '/orders', { role: 'office', body: {
    client_id: ids.client, order_type: 'стъклопакет',
    items: [
      { product_desc: 'БЯЛО 4/16/4', width: 1000, height: 1000, qty: 2, unit_price: 25 },  // 1 m² × 2 × 25 = 50
      { product_desc: 'Малък пакет', width: 300, height: 300, qty: 1, unit_price: 25 },     // 0.09 → min 0.4 m² = 10
      { product_desc: 'Кант', uom: 'lm', width: 500, height: 500, qty: 1, unit_price: 2 },   // 2 lm × 2 = 4
    ],
  } });
  assert.equal(o.status, 201);
  ids.order = o.data.id;
  assert.equal(+o.data.sale_price, 64);

  // Edit an item → price follows (it was automatic)
  let d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  const first = d.data.items[0];
  assert.equal((await call('PATCH', `/orders/${ids.order}/items/${first.id}`, { role: 'office', body: { qty: 3 } })).status, 200);
  d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(+d.data.sale_price, 89);

  // Manual price is kept when items change
  await call('PATCH', `/orders/${ids.order}`, { role: 'office', body: { sale_price: 100, deadline: '2030-01-01' } });
  await call('POST', `/orders/${ids.order}/items`, { role: 'office', body: { product_desc: 'Доп.', uom: 'fixed', unit_price: 5 } });
  d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(+d.data.sale_price, 100);
  assert.equal(d.data.items.length, 4);

  // PATCH can clear fields
  await call('PATCH', `/orders/${ids.order}`, { role: 'office', body: { deadline: null } });
  d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(d.data.deadline, null);

  // Payments drive payment_status
  let p = await call('POST', `/orders/${ids.order}/payments`, { role: 'office', body: { amount: 40, method: 'брой' } });
  assert.equal(p.data.status, 'частично');
  p = await call('POST', `/orders/${ids.order}/payments`, { role: 'office', body: { amount: 60, method: 'банка' } });
  assert.equal(p.data.status, 'платена');

  // Status permissions
  assert.equal((await call('PATCH', `/orders/${ids.order}/status`, { role: 'production', body: { status: 'ОТКАЗАНА' } })).status, 403);
  assert.equal((await call('PATCH', `/orders/${ids.order}/status`, { role: 'office', body: { status: 'ПРОИЗВОДСТВО', notes: 'старт' } })).status, 200);
  d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(d.data.notes, null, 'status note must not overwrite order notes');
});

test('production stages: only in ПРОИЗВОДСТВО, last stage makes order ГОТОВА', async () => {
  let d = await call('GET', `/orders/${ids.order}`, { role: 'production' });
  for (const st of d.data.stages) {
    assert.equal((await call('PATCH', `/production/stages/${st.id}`, { role: 'production', body: { status: 'В_ПРОЦЕС' } })).status, 200);
    assert.equal((await call('PATCH', `/production/stages/${st.id}`, { role: 'production', body: { status: 'ГОТОВ' } })).status, 200);
  }
  d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(d.data.status, 'ГОТОВА');
  const board = await call('GET', '/production/my-work', { role: 'production' });
  assert.equal(board.status, 200);
});

test('clone copies items once (no items × stages duplication)', async () => {
  const c = await call('POST', `/orders/${ids.order}/clone`, { role: 'office', body: {} });
  assert.equal(c.status, 201);
  const d = await call('GET', `/orders/${c.data.id}`, { role: 'office' });
  const src = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(d.data.items.length, 4);
  assert.equal(d.data.stages.length, src.data.stages.length);
});

test('defects: optional stage/machine, cause filter works', async () => {
  const r = await call('POST', '/defects', { role: 'production', body: { order_id: ids.order, cause_type: 'счупване', stage_id: '', machine_id: '' } });
  assert.equal(r.status, 201);
  const f = await call('GET', '/defects?cause_type=счупване', { role: 'office' });
  assert.equal(f.status, 200);
  assert.equal(f.data.total, 1);
});

test('delivery marked delivered hands the order over', async () => {
  const del = await call('POST', '/deliveries', { role: 'office', body: { order_id: ids.order, address: 'София' } });
  assert.equal(del.status, 201);
  assert.equal((await call('PATCH', `/deliveries/${del.data.id}`, { role: 'warehouse', body: { status: 'DELIVERED' } })).status, 200);
  const d = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.equal(d.data.status, 'ДОСТАВЕНА');
  assert.ok(d.data.delivered_at);
});

test('settings: admin edits, others cannot; values validated', async () => {
  assert.equal((await call('PATCH', '/settings', { role: 'office', body: { vat_pct: 20 } })).status, 403);
  assert.equal((await call('PATCH', '/settings', { body: { vat_pct: 999 } })).status, 400);
  const r = await call('PATCH', '/settings', { body: { commission_measurer_pct: '4,5' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.find(s => s.key === 'commission_measurer_pct').value, '4.5');
});

test('reports: revenue excludes warranty and is consistent', async () => {
  const r = await call('GET', '/reports/costs?from=2026-01-01&to=2026-06-30');
  assert.equal(r.status, 200);
  assert.ok(+r.data.summary.total_revenue > 500000);
  assert.ok(+r.data.summary.total_revenue_net < +r.data.summary.total_revenue);
  for (const path of ['/reports/dashboard', '/reports/orders?from=2026-03-01&to=2026-03-31', '/reports/production',
                      '/reports/clients', '/reports/order-types', '/reports/products', '/reports/receivables',
                      '/reports/defect-analysis', '/reports/materials']) {
    assert.equal((await call('GET', path)).status, 200, path);
  }
});

test('users: wrong current password is 400 (no logout); deactivation is immediate', async () => {
  assert.equal((await call('POST', '/auth/change-password', { role: 'office', body: { current_password: 'x', new_password: 'yyyyyy' } })).status, 400);
  assert.equal((await call('PATCH', '/auth/me', { role: 'office', body: { name: 'Офис Тест' } })).status, 200);
  const { rows: [u] } = await pool.query(`SELECT id FROM users WHERE email='warehouse@test.bg'`);
  assert.equal((await call('PATCH', `/auth/users/${u.id}`, { body: { active: false } })).status, 200);
  assert.equal((await call('GET', '/orders?limit=1', { role: 'warehouse' })).status, 401);
});

test('demo seeding is disabled', async () => {
  assert.equal((await call('POST', '/admin/seed-demo')).status, 410);
});

test('option lists: office adds a defect cause, admin renames/hides, stages drive new orders', async () => {
  const all = await call('GET', '/options', { role: 'production' });
  assert.ok(all.data.defect_cause.length >= 5);
  const add = await call('POST', '/options', { role: 'office', body: { list_key: 'defect_cause', label: 'Счупено от клиента' } });
  assert.equal(add.status, 201);
  assert.equal((await call('POST', '/options', { role: 'office', body: { list_key: 'stages:стъклопакет', label: 'X' } })).status, 403);
  assert.equal((await call('PATCH', `/options/${add.data.id}`, { role: 'office', body: { active: false } })).status, 403);
  assert.equal((await call('PATCH', `/options/${add.data.id}`, { body: { active: false } })).status, 200);
  const st = await call('POST', '/options', { body: { list_key: 'stages:стъклопакет', label: 'Контрол' } });
  assert.equal(st.status, 201);
  const o = await call('POST', '/orders', { role: 'office', body: { client_id: ids.client, order_type: 'стъклопакет',
    items: [{ product_desc: 'Тест', width: 500, height: 500, unit_price: 10 }] } });
  const d = await call('GET', `/orders/${o.data.id}`, { role: 'office' });
  assert.equal(d.data.stages.at(-1).stage_name, 'Контрол');
  const p = await call('POST', `/orders/${o.data.id}/payments`, { role: 'office', body: { amount: 1, method: 'Наложен платеж' } });
  assert.equal(p.status, 201, 'payment methods are not a fixed list any more');
});

test('catalog: selling price and unit; hidden from shop floor', async () => {
  const c = await call('POST', '/products', { role: 'office', body: { name: 'Кант праволинеен 4мм', uom: 'lm', unit_price: 1.2, sale_price: 2.5, category: 'Обработки' } });
  assert.equal(c.status, 201);
  assert.equal(c.data.uom, 'lm');
  const prod = await call('GET', '/products?q=Кант праволинеен', { role: 'production' });
  assert.ok(prod.data.length >= 1);
  assert.equal(prod.data[0].sale_price, undefined);
  const e = await call('PATCH', `/products/${c.data.id}`, { role: 'office', body: { sale_price: 2.8 } });
  assert.equal(+e.data.sale_price, 2.8);
});

test('order history records edits, lines and payments (office only)', async () => {
  await call('PATCH', `/orders/${ids.order}`, { role: 'office', body: { notes: 'проверка на историята' } });
  const h = await call('GET', `/orders/${ids.order}/history`, { role: 'office' });
  assert.equal(h.status, 200);
  const actions = h.data.map(x => x.action);
  assert.ok(actions.includes('order_edit') && actions.includes('item_edit') && actions.includes('payment_add'));
  assert.equal((await call('GET', `/orders/${ids.order}/history`, { role: 'production' })).status, 403);
});

test('company details are text settings; defects keep responsibility', async () => {
  const r = await call('PATCH', '/settings', { body: { company_phone: '0888 567 406' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.find(s => s.key === 'company_phone').value, '0888 567 406');
  const d = await call('POST', '/defects', { role: 'office', body: { order_id: ids.order, cause_type: 'драскотина', responsibility: 'доставчик' } });
  assert.equal(d.status, 201);
  assert.equal(d.data.responsibility, 'доставчик');
});

test('complaint order links to the original; both sides see the link', async () => {
  const c = await call('POST', '/orders', { role: 'office', body: { client_id: ids.client, order_type: 'стъклопакет',
    order_category: 'гаранция', related_order_id: ids.order, items: [{ product_desc: 'Преработка', width: 500, height: 500, unit_price: 0 }] } });
  assert.equal(c.status, 201);
  const claim = await call('GET', `/orders/${c.data.id}`, { role: 'office' });
  assert.equal(claim.data.related_original.id, ids.order);
  const orig = await call('GET', `/orders/${ids.order}`, { role: 'office' });
  assert.ok(orig.data.related_claims.some(x => x.id === c.data.id));
});

test('client merge remembers the old name; registry lookup validates ЕИК; demo warehouse gone', async () => {
  const a = await call('POST', '/clients', { role: 'office', body: { name: 'Алиас Тест ООД' } });
  const b = await call('POST', '/clients', { role: 'office', body: { name: 'АЛИАС ТЕСТ' } });
  assert.equal((await call('POST', `/clients/${a.data.id}/merge`, { role: 'office', body: { from_ids: [b.data.id] } })).status, 200);
  const { rows } = await pool.query(`SELECT client_id FROM client_aliases WHERE name_key='АЛИАС ТЕСТ'`);
  assert.equal(rows[0].client_id, a.data.id);
  assert.equal((await call('GET', '/clients/lookup/12ab', { role: 'office' })).status, 400);
  assert.equal((await call('GET', '/clients/lookup?q=x', { role: 'production' })).status, 403);
  const m = await call('GET', '/machines');
  assert.equal(m.data.length, 0);
});
