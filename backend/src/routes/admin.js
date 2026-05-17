const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();
router.use(auth, roleCheck('admin'));

// POST /api/admin/seed-demo — insert demo content for new modules
router.post('/seed-demo', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if demo already seeded
    const { rows: existing } = await client.query(
      "SELECT id FROM suppliers WHERE name='ГласИмпорт ЕООД' LIMIT 1"
    );
    if (existing.length > 0) {
      await client.query('ROLLBACK');
      return res.json({ ok: true, message: 'Демо данните вече съществуват' });
    }

    // ── Suppliers ──
    const s1 = await client.query(`
      INSERT INTO suppliers (name, contact, phone, email, address, notes)
      VALUES ('ГласИмпорт ЕООД','Иван Петров','+359 32 123 456','ivan@glasimport.bg','бул. Марица 14, Пловдив','Основен доставчик на флоат стъкло')
      RETURNING id`);
    const s2 = await client.query(`
      INSERT INTO suppliers (name, contact, phone, email, address, notes)
      VALUES ('СтъклоПлюс АД','Мария Иванова','+359 2 987 6543','m.ivanova@stekloplus.bg','ул. Индустриална 7, София','Доставчик на специализирани стъкла')
      RETURNING id`);
    const s3 = await client.query(`
      INSERT INTO suppliers (name, contact, phone, email, address)
      VALUES ('EuroGlass SRL','Andrei Popescu','+40 72 345 6789','a.popescu@euroglass.ro','Str. Industriei 22, București')
      RETURNING id`);

    const sup1 = s1.rows[0].id;
    const sup2 = s2.rows[0].id;
    const sup3 = s3.rows[0].id;

    // ── Link some materials to suppliers ──
    await client.query(`
      UPDATE materials SET supplier_id=$1
      WHERE name ILIKE '%стъкло%' OR name ILIKE '%glass%'
      LIMIT 3`, [sup1]);

    // ── Purchase Orders ──
    const po1Num = `PO-${String((await client.query("SELECT NEXTVAL('po_seq') AS n")).rows[0].n).padStart(4,'0')}`;
    const po1 = await client.query(`
      INSERT INTO purchase_orders (po_number, supplier_id, expected_date, notes, created_by)
      SELECT $1,$2,NOW()::date+14,'Месечна доставка флоат стъкло',u.id
      FROM users u WHERE u.role='admin' LIMIT 1
      RETURNING id`, [po1Num, sup1]);
    if (po1.rows[0]) {
      await client.query(`
        INSERT INTO purchase_order_items (po_id, description, unit, quantity, unit_price)
        VALUES ($1,'Флоат стъкло 4мм','м²',200,8.50),
               ($1,'Флоат стъкло 6мм','м²',150,12.00)`, [po1.rows[0].id]);
    }

    const po2Num = `PO-${String((await client.query("SELECT NEXTVAL('po_seq') AS n")).rows[0].n).padStart(4,'0')}`;
    const po2 = await client.query(`
      INSERT INTO purchase_orders (po_number, supplier_id, status, expected_date, notes, created_by)
      SELECT $1,$2,'SENT',NOW()::date+7,'Дистанционни и бутил','u.id'
      FROM users u WHERE u.role='admin' LIMIT 1
      RETURNING id`, [po2Num, sup2]);
    if (po2.rows[0]) {
      await client.query(`
        INSERT INTO purchase_order_items (po_id, description, unit, quantity, unit_price)
        VALUES ($1,'Дистанционна рамка 16мм','м',500,1.20),
               ($1,'Бутил лента','кг',30,15.00),
               ($1,'Полиуретанов уплътнител','кг',20,18.50)`, [po2.rows[0].id]);
    }

    // ── Quotations (using first 3 clients) ──
    const { rows: clients } = await client.query(
      'SELECT id, name FROM clients ORDER BY created_at LIMIT 3'
    );
    const { rows: adminUser } = await client.query(
      "SELECT id FROM users WHERE role='admin' LIMIT 1"
    );
    if (clients.length > 0 && adminUser.length > 0) {
      const uid = adminUser[0].id;

      const q1n = `OFF-${String((await client.query("SELECT NEXTVAL('quotation_seq') AS n")).rows[0].n).padStart(4,'0')}`;
      await client.query(`
        INSERT INTO quotations (quote_number, client_id, created_by, status, valid_until, notes, items, total_price)
        VALUES ($1,$2,$3,'DRAFT',NOW()::date+30,'Проект за нов обект — изчакваме финален размер',
          $4::jsonb, 2340.00)`,
        [q1n, clients[0].id, uid, JSON.stringify([
          { product_type:'стъклопакет', product_desc:'Стъклопакет 4/16/4мм Low-E', width:120, height:150, qty:6, unit_price:180 },
          { product_type:'стъклопакет', product_desc:'Стъклопакет 4/16/4мм прозрачен', width:90, height:120, qty:8, unit_price:142.50 },
        ])]
      );

      if (clients.length > 1) {
        const q2n = `OFF-${String((await client.query("SELECT NEXTVAL('quotation_seq') AS n")).rows[0].n).padStart(4,'0')}`;
        await client.query(`
          INSERT INTO quotations (quote_number, client_id, created_by, status, valid_until, notes, items, total_price)
          VALUES ($1,$2,$3,'SENT',NOW()::date+7,'Жилищен комплекс — 3 апартамента',
            $4::jsonb, 5670.00)`,
          [q2n, clients[1].id, uid, JSON.stringify([
            { product_type:'стъклопакет', product_desc:'Стъклопакет 4/20/4мм Low-E Argon', width:140, height:200, qty:12, unit_price:285 },
            { product_type:'единично_стъкло', product_desc:'Закалено стъкло 8мм', width:80, height:200, qty:6, unit_price:195 },
          ])]
        );
      }

      if (clients.length > 2) {
        const q3n = `OFF-${String((await client.query("SELECT NEXTVAL('quotation_seq') AS n")).rows[0].n).padStart(4,'0')}`;
        await client.query(`
          INSERT INTO quotations (quote_number, client_id, created_by, status, valid_until, notes, items, total_price)
          VALUES ($1,$2,$3,'REJECTED',NOW()::date-5,'Клиентът намери по-евтин доставчик',
            $4::jsonb, 890.00)`,
          [q3n, clients[2].id, uid, JSON.stringify([
            { product_type:'стъклопакет', product_desc:'Стъклопакет 4/12/4мм', width:100, height:130, qty:4, unit_price:222.50 },
          ])]
        );
      }
    }

    // ── Deliveries (using first 3 orders with appropriate statuses) ──
    const { rows: orders } = await client.query(
      `SELECT o.id, o.order_number, o.client_id, c.name AS client_name
       FROM orders o JOIN clients c ON c.id=o.client_id
       WHERE o.status IN ('ГОТОВА','ДОСТАВЕНА')
       ORDER BY o.created_at DESC LIMIT 4`
    );
    if (orders.length > 0) {
      const { rows: drivers } = await client.query(
        "SELECT id, name FROM users WHERE role IN ('office','admin') ORDER BY name LIMIT 2"
      );
      const driverId = drivers[0]?.id || null;

      if (orders[0]) {
        await client.query(`
          INSERT INTO deliveries (order_id, driver_name, driver_phone, address, scheduled_at, notes, status)
          VALUES ($1,'Георги Димитров','+359 88 123 4567',$2,NOW()+INTERVAL '2 hours','Клиентът ще изчака до 14:00 ч.','IN_TRANSIT')`,
          [orders[0].id, `гр. ${['София','Пловдив','Варна','Бургас'][Math.floor(Math.random()*4)]}, ул. Пролет 5`]
        );
      }
      if (orders[1]) {
        await client.query(`
          INSERT INTO deliveries (order_id, driver_name, driver_phone, address, scheduled_at, notes, status)
          VALUES ($1,'Стефан Колев','+359 87 987 6543',$2,NOW()+INTERVAL '1 day','Обадете се 30 мин. преди пристигане','PENDING')`,
          [orders[1].id, `гр. ${['София','Пловдив','Стара Загора'][Math.floor(Math.random()*3)]}, бул. България 22`]
        );
      }
      if (orders[2]) {
        await client.query(`
          INSERT INTO deliveries (order_id, driver_name, driver_phone, address, scheduled_at, delivered_at, notes, status)
          VALUES ($1,'Георги Димитров','+359 88 123 4567',$2,NOW()-INTERVAL '2 days',NOW()-INTERVAL '2 hours','Доставено без забележки','DELIVERED')`,
          [orders[2].id, 'гр. Пловдив, кв. Тракия, бл. 25']
        );
      }
    }

    // ── Notifications ──
    const { rows: allAdmins } = await client.query(
      "SELECT id FROM users WHERE role IN ('admin','office') AND active=true LIMIT 5"
    );
    for (const u of allAdmins) {
      await client.query(`
        INSERT INTO notifications (user_id, type, title, body, link)
        VALUES ($1,'low_stock','Ниска наличност: Дистанционна рамка 16мм','Налично: 8 м / Минимум: 50 м','/warehouse'),
               ($1,'overdue','Просрочена поръчка: #0005','Клиент: Стройком ООД — 3 дни закъснение','/orders'),
               ($1,'order_ready','Поръчка #0012 е готова','Клиент: Алфа Груп — готова за доставка','/orders')`,
        [u.id]
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true, message: 'Демо данните са добавени успешно' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
