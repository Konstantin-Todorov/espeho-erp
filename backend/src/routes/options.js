const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Editable dropdown lists. Office may add new options on the fly ("+ Добави"); admin manages them
// (rename, reorder, hide) in Настройки. Records store `value`, the UI shows `label`.
const router = express.Router();
router.use(auth);

const KEY_RE = /^(defect_cause|payment_method|source|stage_extra|stages:(стъклопакет|единично_стъкло|смесена))$/;

// GET /api/options — { list_key: [{id, value, label, sort_order, active}] } (active only unless ?all=1)
router.get('/', async (req, res) => {
  const all = req.query.all === '1' && req.user.role === 'admin';
  const { rows } = await pool.query(
    `SELECT id, list_key, value, label, sort_order, active FROM option_lists
     ${all ? '' : 'WHERE active = true'} ORDER BY list_key, sort_order, label`);
  const out = {};
  for (const r of rows) (out[r.list_key] ||= []).push(r);
  res.json(out);
});

// POST /api/options { list_key, label } — add an option (admin/office; stages admin only)
router.post('/', roleCheck('admin', 'office'), async (req, res) => {
  const key = String(req.body.list_key || '');
  const label = String(req.body.label || '').trim().replace(/\s+/g, ' ');
  if (!KEY_RE.test(key)) return res.status(400).json({ error: 'Непознат списък' });
  if (key.startsWith('stages:') && req.user.role !== 'admin') return res.status(403).json({ error: 'Само администратор променя етапите' });
  if (!label || label.length > 120) return res.status(400).json({ error: 'Въведете име (до 120 символа)' });
  const { rows: [{ max }] } = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM option_lists WHERE list_key=$1 AND sort_order < 99`, [key]);
  const { rows } = await pool.query(
    `INSERT INTO option_lists (list_key, value, label, sort_order, created_by) VALUES ($1,$2,$2,$3,$4)
     ON CONFLICT (list_key, value) DO UPDATE SET active = true
     RETURNING id, list_key, value, label, sort_order, active`,
    [key, label, max + 1, req.user.id]);
  res.status(201).json(rows[0]);
});

// PATCH /api/options/:id { label?, sort_order?, active? } — admin
router.patch('/:id', roleCheck('admin'), async (req, res) => {
  const sets = [], params = [];
  if ('label' in req.body) {
    const l = String(req.body.label || '').trim();
    if (!l) return res.status(400).json({ error: 'Името не може да е празно' });
    params.push(l); sets.push(`label=$${params.length}`);
  }
  if ('sort_order' in req.body) { params.push(parseInt(req.body.sort_order) || 0); sets.push(`sort_order=$${params.length}`); }
  if ('active' in req.body) { params.push(!!req.body.active); sets.push(`active=$${params.length}`); }
  if (!sets.length) return res.status(400).json({ error: 'Няма промени' });
  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE option_lists SET ${sets.join(', ')} WHERE id=$${params.length}
     RETURNING id, list_key, value, label, sort_order, active`, params);
  if (!rows[0]) return res.status(404).json({ error: 'Не е намерено' });
  res.json(rows[0]);
});

// PUT /api/options/order { ids: [...] } — save a new order for one list (admin)
router.put('/order', roleCheck('admin'), async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  for (let i = 0; i < ids.length; i++) {
    await pool.query('UPDATE option_lists SET sort_order=$1 WHERE id=$2 AND sort_order < 99', [i + 1, ids[i]]);
  }
  res.json({ ok: true });
});

// Stage names for an order type, in shop order (used when an order is created)
async function stageTemplate(orderType, db = pool) {
  const { rows } = await db.query(
    `SELECT label FROM option_lists WHERE list_key=$1 AND active ORDER BY sort_order, label`,
    [`stages:${orderType}`]);
  return rows.map(r => r.label);
}

module.exports = router;
module.exports.stageTemplate = stageTemplate;
