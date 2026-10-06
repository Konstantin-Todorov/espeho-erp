const express = require('express');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth, roleCheck('admin'));

// POST /api/admin/seed-demo — removed: the system now holds real data, and demo records would be
// attached to real clients and orders.
router.post('/seed-demo', (req, res) => {
  res.status(410).json({ error: 'Демо данните са изключени — системата работи с реални данни.' });
});

module.exports = router;
