const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { canSeeCost } = require('../utils/financial');
const { invalidateGlass } = require('../utils/glassCost');
const { audit } = require('../utils/audit');

const router = express.Router();
router.use(auth);

// Base glasses for the cost formula (Каталог → Стъкла). Prices are cost without VAT → owner only;
// the office gets names, groups and default waste so it can build „БЯЛО 4ММ/МФ 4ММ“ from a list.
const PRICE_FIELDS = ['supply_price', 'labor_price', 'igu_price'];

router.get('/', roleCheck('admin', 'office'), async (req, res) => {
  const all = req.query.all === '1' && req.user.role === 'admin';
  const { rows } = await pool.query(
    `SELECT * FROM glass_types ${all ? '' : 'WHERE active'} ORDER BY sort_order, uses DESC, name`);
  res.json(canSeeCost(req.user) ? rows : rows.map(r => Object.fromEntries(Object.entries(r).filter(([k]) => !PRICE_FIELDS.includes(k)))));
});

const num = (v, min, max) => {
  if (v === '' || v === null || v === undefined) return null;
  const x = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(x) || x < min || x > max) throw Object.assign(new Error(`Стойност извън граници (${min}–${max})`), { status: 400 });
  return x;
};
const FIELDS = {
  name:         v => String(v || '').trim().toUpperCase().replace(/\s+/g, ' ').slice(0, 120) || undefined,
  category:     v => String(v || '').trim().slice(0, 60) || null,
  supply_price: v => num(v, 0, 10000),
  labor_price:  v => num(v, 0, 10000),
  igu_price:    v => num(v, 0, 10000),
  waste_pct:    v => num(v, 0, 100) ?? 0,
  active:       v => !!v,
  sort_order:   v => Math.trunc(num(v, -1e6, 1e6) ?? 0),
};
const pick = body => {
  const out = {};
  for (const [k, f] of Object.entries(FIELDS)) if (k in (body || {})) { const v = f(body[k]); if (v !== undefined) out[k] = v; }
  return out;
};
const fail = (res, err) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Стъкло с това име вече съществува' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  throw err;
};

router.post('/', roleCheck('admin'), async (req, res) => {
  try {
    const f = pick(req.body);
    if (!f.name) return res.status(400).json({ error: 'Името е задължително' });
    const keys = Object.keys(f);
    const { rows: [g] } = await pool.query(
      `INSERT INTO glass_types (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
      keys.map(k => f[k]));
    invalidateGlass();
    await audit({ user: req.user, action: 'glass_add', table: 'glass_types', id: null, after: g });
    res.status(201).json(g);
  } catch (err) { fail(res, err); }
});

router.patch('/:id', roleCheck('admin'), async (req, res) => {
  try {
    const f = pick(req.body);
    const keys = Object.keys(f);
    if (!keys.length) return res.status(400).json({ error: 'Няма промени' });
    const { rows: [before] } = await pool.query('SELECT * FROM glass_types WHERE id=$1', [+req.params.id]);
    if (!before) return res.status(404).json({ error: 'Не е намерено' });
    const { rows: [g] } = await pool.query(
      `UPDATE glass_types SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(', ')}, updated_at=NOW()
       WHERE id=$${keys.length + 1} RETURNING *`, [...keys.map(k => f[k]), before.id]);
    invalidateGlass();
    await audit({ user: req.user, action: 'glass_edit', table: 'glass_types', id: null,
      before: Object.fromEntries(keys.map(k => [k, before[k]])), after: { name: g.name, ...f } });
    res.json(g);
  } catch (err) { fail(res, err); }
});

module.exports = router;
