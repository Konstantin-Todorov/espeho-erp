const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { stripMoney, stripCost } = require('../utils/financial');

const router = express.Router();
router.use(auth);

// Catalog of products and services. unit_price = cost without VAT, sale_price = selling price with VAT,
// both per unit of measure (uom: m2 | lm | pcs | fixed).
const UOMS = ['m2', 'lm', 'pcs', 'fixed'];

// GET /api/products — active items (?all=1 also inactive, office/admin), optional ?order_type=&q=
router.get('/', async (req, res) => {
  const params = [];
  const conds = [];
  if (!(req.query.all === '1' && ['admin', 'office'].includes(req.user.role))) conds.push('active = true');
  if (req.query.order_type) { params.push(req.query.order_type); conds.push(`order_type = $${params.length}`); }
  if (req.query.q?.trim()) {
    params.push(`%${req.query.q.trim()}%`);
    conds.push(`(name ILIKE $${params.length} OR default_description ILIKE $${params.length} OR category ILIKE $${params.length})`);
  }
  const { rows } = await pool.query(
    `SELECT * FROM product_templates ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
     ORDER BY category NULLS LAST, sort_order, name`, params);
  // Prices are for office/admin only
  // Selling prices for admin/office; cost price (unit_price) for admin only
  res.json(stripCost(req.user, stripMoney(req.user, rows, ['unit_price', 'sale_price']), ['unit_price']));
});

const FIELDS = {
  name:                v => String(v || '').trim() || undefined,
  order_type:          v => v || 'стъклопакет',
  category:            v => (String(v || '').trim() || null),
  default_description: v => (String(v || '').trim() || null),
  default_width:       v => (v === '' || v == null ? null : +v),
  default_height:      v => (v === '' || v == null ? null : +v),
  unit_price:          v => (v === '' || v == null ? null : +String(v).replace(',', '.')),
  sale_price:          v => (v === '' || v == null ? null : +String(v).replace(',', '.')),
  uom:                 v => (UOMS.includes(v) ? v : 'm2'),
  notes:               v => (String(v || '').trim() || null),
  sort_order:          v => parseInt(v) || 0,
  active:              v => !!v,
};

// POST /api/products — admin/office
router.post('/', roleCheck('admin', 'office'), async (req, res) => {
  if (!String(req.body.name || '').trim()) return res.status(400).json({ error: 'Наименованието е задължително' });
  const cols = [], vals = [];
  for (const [k, conv] of Object.entries(FIELDS)) {
    if (!(k in req.body)) continue;
    const v = conv(req.body[k]);
    if (v === undefined) continue;
    cols.push(k); vals.push(v);
  }
  const { rows } = await pool.query(
    `INSERT INTO product_templates (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, vals);
  res.status(201).json(rows[0]);
});

// PATCH /api/products/:id — admin/office; only keys present change, '' clears a nullable field
router.patch('/:id', roleCheck('admin', 'office'), async (req, res) => {
  const sets = [], vals = [];
  for (const [k, conv] of Object.entries(FIELDS)) {
    if (!(k in req.body)) continue;
    const v = conv(req.body[k]);
    if (v === undefined) return res.status(400).json({ error: 'Наименованието не може да е празно' });
    vals.push(v); sets.push(`${k}=$${vals.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
  vals.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE product_templates SET ${sets.join(', ')}, updated_at=NOW() WHERE id=$${vals.length} RETURNING *`, vals);
  if (!rows[0]) return res.status(404).json({ error: 'Артикулът не е намерен' });
  res.json(rows[0]);
});

// DELETE /api/products/:id — hide (admin)
router.delete('/:id', roleCheck('admin'), async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE product_templates SET active = false, updated_at=NOW() WHERE id = $1 RETURNING id`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Артикулът не е намерен' });
  res.json({ message: 'Скрит от каталога' });
});

module.exports = router;
