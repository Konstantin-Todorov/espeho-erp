const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth);

const DEFAULT_CHECKS = [
  'Размери — проверени',
  'Повърхност — без дефекти',
  'Запечатване — проверено',
  'Кантиране — проверено',
  'Почистено и опаковано',
  'Документация — готова',
];

// GET /api/quality/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT qc.*, u.name AS checked_by_name
       FROM quality_checks qc LEFT JOIN users u ON u.id=qc.checked_by
       WHERE qc.order_id=$1 ORDER BY qc.sort_order`,
      [req.params.orderId]
    );

    // If no checks exist yet, return the defaults (unsaved)
    if (rows.length === 0) {
      return res.json(DEFAULT_CHECKS.map((item, i) => ({
        id: null, order_id: req.params.orderId, item, checked: false,
        checked_by: null, checked_by_name: null, checked_at: null, sort_order: i,
      })));
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/quality/:orderId/init — initialize default checklist
router.post('/:orderId/init', roleCheck('admin','office','production'), async (req, res) => {
  const { items } = req.body;
  const checkItems = items || DEFAULT_CHECKS;
  try {
    await pool.query('DELETE FROM quality_checks WHERE order_id=$1', [req.params.orderId]);
    for (let i = 0; i < checkItems.length; i++) {
      await pool.query(
        'INSERT INTO quality_checks (order_id, item, sort_order) VALUES ($1,$2,$3)',
        [req.params.orderId, checkItems[i], i]
      );
    }
    const { rows } = await pool.query(
      'SELECT * FROM quality_checks WHERE order_id=$1 ORDER BY sort_order', [req.params.orderId]
    );
    res.status(201).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка при инициализация' });
  }
});

// PATCH /api/quality/:id/toggle — check/uncheck item
router.patch('/:id/toggle', roleCheck('admin','office','production'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE quality_checks SET
         checked = NOT checked,
         checked_by = CASE WHEN NOT checked THEN $1 ELSE NULL END,
         checked_at = CASE WHEN NOT checked THEN NOW() ELSE NULL END
       WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// DELETE /api/quality/:id
router.delete('/:id', roleCheck('admin','office'), async (req, res) => {
  try {
    await pool.query('DELETE FROM quality_checks WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Грешка' });
  }
});

module.exports = router;
