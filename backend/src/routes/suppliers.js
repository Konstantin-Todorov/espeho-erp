const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth, roleCheck('admin', 'office', 'warehouse'));

// ── Suppliers ────────────────────────────────────────────────────────────────

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
         COUNT(po.id)::int AS po_count,
         COALESCE(SUM(po.total_amount) FILTER (WHERE po.status='RECEIVED'), 0)::numeric(12,2) AS total_spent
       FROM suppliers s
       LEFT JOIN purchase_orders po ON po.supplier_id=s.id
       WHERE s.active=true
       GROUP BY s.id ORDER BY s.name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/suppliers
router.post('/', roleCheck('admin','office'), async (req, res) => {
  const { name, contact, phone, email, address, vat_number, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Името е задължително' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO suppliers (name, contact, phone, email, address, vat_number, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, contact||null, phone||null, email||null, address||null, vat_number||null, notes||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при създаване' });
  }
});

// PATCH /api/suppliers/:id
router.patch('/:id', roleCheck('admin','office'), async (req, res) => {
  const { name, contact, phone, email, address, vat_number, notes, active } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE suppliers SET name=COALESCE($1,name), contact=COALESCE($2,contact),
       phone=COALESCE($3,phone), email=COALESCE($4,email), address=COALESCE($5,address),
       vat_number=COALESCE($6,vat_number), notes=COALESCE($7,notes),
       active=COALESCE($8,active), updated_at=NOW() WHERE id=$9 RETURNING *`,
      [name||null, contact||null, phone||null, email||null, address||null, vat_number||null, notes||null, active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерен' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// ── Purchase Orders ──────────────────────────────────────────────────────────

// GET /api/suppliers/purchase-orders
router.get('/purchase-orders', async (req, res) => {
  const { supplier_id, status } = req.query;
  const params = [];
  const conds = [];
  if (supplier_id) { params.push(supplier_id); conds.push(`po.supplier_id=$${params.length}`); }
  if (status)      { params.push(status);       conds.push(`po.status=$${params.length}`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  try {
    const { rows } = await pool.query(`
      SELECT po.*, s.name AS supplier_name, u.name AS created_by_name,
             (SELECT COUNT(*)::int FROM purchase_order_items poi WHERE poi.po_id=po.id) AS item_count
      FROM purchase_orders po
      JOIN suppliers s ON s.id=po.supplier_id
      JOIN users u ON u.id=po.created_by
      ${where}
      ORDER BY po.created_at DESC`, params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// GET /api/suppliers/purchase-orders/:id
router.get('/purchase-orders/:id', async (req, res) => {
  try {
    const po = await pool.query(
      `SELECT po.*, s.name AS supplier_name, s.phone AS supplier_phone,
              s.email AS supplier_email, u.name AS created_by_name
       FROM purchase_orders po JOIN suppliers s ON s.id=po.supplier_id
       JOIN users u ON u.id=po.created_by WHERE po.id=$1`, [req.params.id]
    );
    if (!po.rows[0]) return res.status(404).json({ error: 'Не е намерена' });
    const items = await pool.query(
      `SELECT poi.*, m.name AS material_name, m.unit AS material_unit
       FROM purchase_order_items poi LEFT JOIN materials m ON m.id=poi.material_id
       WHERE poi.po_id=$1 ORDER BY poi.sort_order`, [req.params.id]
    );
    res.json({ ...po.rows[0], items: items.rows });
  } catch (err) {
    res.status(500).json({ error: 'Грешка на сървъра' });
  }
});

// POST /api/suppliers/purchase-orders
router.post('/purchase-orders', roleCheck('admin','office','warehouse'), async (req, res) => {
  const { supplier_id, expected_date, notes, items } = req.body;
  if (!supplier_id) return res.status(400).json({ error: 'Доставчикът е задължителен' });

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');
    const numRes = await dbClient.query(`SELECT NEXTVAL('po_seq') AS n`);
    const poNumber = `PO-${String(numRes.rows[0].n).padStart(4, '0')}`;

    const total = (items || []).reduce((s, it) => s + (Number(it.quantity||0) * Number(it.unit_price||0)), 0);

    const { rows } = await dbClient.query(
      `INSERT INTO purchase_orders (po_number, supplier_id, created_by, expected_date, notes, total_amount)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [poNumber, supplier_id, req.user.id, expected_date||null, notes||null, total.toFixed(2)]
    );
    const po = rows[0];

    for (let i = 0; i < (items||[]).length; i++) {
      const it = items[i];
      await dbClient.query(
        `INSERT INTO purchase_order_items (po_id, material_id, description, quantity, unit, unit_price, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [po.id, it.material_id||null, it.description, Number(it.quantity), it.unit||null, Number(it.unit_price||0), i]
      );
    }

    await dbClient.query('COMMIT');
    res.status(201).json(po);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при създаване' });
  } finally {
    dbClient.release();
  }
});

// PATCH /api/suppliers/purchase-orders/:id
router.patch('/purchase-orders/:id', roleCheck('admin','office','warehouse'), async (req, res) => {
  const { status, expected_date, received_date, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE purchase_orders SET status=COALESCE($1,status),
       expected_date=COALESCE($2,expected_date), received_date=COALESCE($3,received_date),
       notes=COALESCE($4,notes), updated_at=NOW() WHERE id=$5 RETURNING *`,
      [status||null, expected_date||null, received_date||null, notes||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Не е намерена' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при обновяване' });
  }
});

// POST /api/suppliers/purchase-orders/:id/receive — receive goods and add to stock
router.post('/purchase-orders/:id/receive', roleCheck('admin','warehouse'), async (req, res) => {
  const { location_id, items } = req.body;
  if (!location_id) return res.status(400).json({ error: 'Локацията е задължителна' });

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    for (const item of items || []) {
      if (!item.material_id || !item.received_qty || item.received_qty <= 0) continue;

      await dbClient.query(
        `INSERT INTO stock (material_id, location_id, quantity, min_threshold)
         VALUES ($1,$2,$3,0)
         ON CONFLICT (material_id,location_id) DO UPDATE
         SET quantity=stock.quantity+EXCLUDED.quantity, updated_at=NOW()`,
        [item.material_id, location_id, item.received_qty]
      );

      await dbClient.query(
        `INSERT INTO stock_movements (material_id, location_id, movement_type, quantity, unit_price, worker_id, notes)
         VALUES ($1,$2,'ПОЛУЧЕНО',$3,$4,$5,$6)`,
        [item.material_id, location_id, item.received_qty, item.unit_price||0, req.user.id, `PO приемане`]
      );

      await dbClient.query(
        `UPDATE purchase_order_items SET received_qty=received_qty+$1 WHERE id=$2`,
        [item.received_qty, item.poi_id]
      );

      if (item.unit_price) {
        await dbClient.query(
          'UPDATE materials SET price_per_unit=$1, updated_at=NOW() WHERE id=$2',
          [item.unit_price, item.material_id]
        );
      }
    }

    await dbClient.query(
      `UPDATE purchase_orders SET status='RECEIVED', received_date=NOW()::date, updated_at=NOW() WHERE id=$1`,
      [req.params.id]
    );

    await dbClient.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Грешка при приемане' });
  } finally {
    dbClient.release();
  }
});

module.exports = router;
