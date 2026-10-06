const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { invalidateSettings } = require('../utils/pricing');

const router = express.Router();
router.use(auth);

// Numeric settings and their allowed ranges
const LIMITS = {
  vat_pct: [0, 30], min_area_igu_m2: [0, 2], min_area_single_m2: [0, 2], default_overhead_pct: [0, 100],
  commission_measurer_pct: [0, 50], commission_office_pct: [0, 50], commission_pool_pct: [0, 50],
  price_markup_pct: [0, 500],
};

// GET /api/settings — admin & office (office needs VAT / minimum areas to price orders)
router.get('/', roleCheck('admin', 'office'), async (req, res) => {
  const { rows } = await pool.query('SELECT key, value, label, hint, updated_at FROM app_settings ORDER BY key');
  res.json(rows);
});

// PATCH /api/settings — admin only. Body: { key: value, ... }
router.patch('/', roleCheck('admin'), async (req, res) => {
  const entries = Object.entries(req.body || {});
  if (!entries.length) return res.status(400).json({ error: 'Няма промени' });
  for (const [key, value] of entries) {
    const lim = LIMITS[key];
    if (!lim) return res.status(400).json({ error: `Непозната настройка: ${key}` });
    const v = Number(String(value).replace(',', '.'));
    if (!Number.isFinite(v) || v < lim[0] || v > lim[1]) {
      return res.status(400).json({ error: `Стойността за „${key}“ трябва да е между ${lim[0]} и ${lim[1]}` });
    }
  }
  for (const [key, value] of entries) {
    await pool.query('UPDATE app_settings SET value=$1, updated_at=NOW() WHERE key=$2',
      [String(Number(String(value).replace(',', '.'))), key]);
  }
  invalidateSettings();
  const { rows } = await pool.query('SELECT key, value, label, hint, updated_at FROM app_settings ORDER BY key');
  res.json(rows);
});

module.exports = router;
