const pool = require('../db/pool');

// Who changed what, for the order's "История" tab (office/admin only — it can contain prices).
async function audit({ db = pool, user, action, table, id, before = null, after = null }) {
  try {
    await db.query(
      `INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data) VALUES ($1,$2,$3,$4,$5,$6)`,
      [user?.id || null, action, table, id, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null]);
  } catch (err) {
    console.error('audit error:', err.message); // history must never break the actual change
  }
}

// Only the fields that actually changed: { field: [old, new] }
function diff(before, after, fields) {
  const out = {};
  for (const f of fields) {
    const a = before?.[f] ?? null, b = after?.[f] ?? null;
    if (String(a) !== String(b)) out[f] = [a, b];
  }
  return out;
}

module.exports = { audit, diff };
