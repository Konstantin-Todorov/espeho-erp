const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seed() {
  console.log('🌱 Seeding database with ЕСПЕХО ООД test data...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── USERS ──────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('espeho2024', 10);
    const users = [
      { name: 'Иван Петров',    email: 'admin@espeho.com',       role: 'admin',      hourly_rate: 0 },
      { name: 'Мария Георгиева',email: 'office1@espeho.com',     role: 'office',     hourly_rate: 0 },
      { name: 'Петя Николова',  email: 'office2@espeho.com',     role: 'office',     hourly_rate: 0 },
      { name: 'Георги Димитров',email: 'prod1@espeho.com',       role: 'production', hourly_rate: 8.50 },
      { name: 'Стоян Иванов',   email: 'prod2@espeho.com',       role: 'production', hourly_rate: 9.00 },
      { name: 'Николай Стоянов',email: 'prod3@espeho.com',       role: 'production', hourly_rate: 8.50 },
      { name: 'Красимир Тодоров',email:'prod4@espeho.com',       role: 'production', hourly_rate: 10.00 },
      { name: 'Димитър Велчев', email: 'prod5@espeho.com',       role: 'production', hourly_rate: 8.00 },
      { name: 'Антон Маринов',  email: 'warehouse1@espeho.com',  role: 'warehouse',  hourly_rate: 8.00 },
      { name: 'Боряна Станева', email: 'warehouse2@espeho.com',  role: 'warehouse',  hourly_rate: 7.50 },
    ];

    const userIds = {};
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role, hourly_rate)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [u.name, u.email, passwordHash, u.role, u.hourly_rate]
      );
      userIds[u.email] = res.rows[0].id;
    }
    console.log('  ✅ Users seeded (password: espeho2024)');

    // ── LOCATIONS ──────────────────────────────────────────────────────────
    const locations = [
      'Склад А — флоат стъкло', 'Склад Б — темперирано стъкло',
      'Склад В — специални стъкла', 'Склад Г — ламинирано',
      'Рафт 1 — дистанционни рамки', 'Рафт 2 — бутил лента',
      'Рафт 3 — силикон и уплътнители', 'Рафт 4 — полисулфид',
      'Рафт 5 — молекулярно сито', 'Рафт 6 — консумативи',
      'Машинен цех — материали', 'Офис склад',
      'Карантина — проверка', 'Брак — изчакващ преработка',
      'Готова продукция', 'Рампа — входящо',
    ];
    const locationIds = {};
    for (const loc of locations) {
      const res = await client.query(
        `INSERT INTO locations (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
        [loc]
      );
      locationIds[loc] = res.rows[0].id;
    }
    console.log('  ✅ Storage locations seeded');

    // ── MACHINES ───────────────────────────────────────────────────────────
    const machines = [
      { name: 'CNC Резачка №1',      type: 'резачка',    model: 'Bottero 360',   cost_per_hour: 25.00, service_interval_days: 90 },
      { name: 'CNC Резачка №2',      type: 'резачка',    model: 'Intermac',      cost_per_hour: 22.00, service_interval_days: 90 },
      { name: 'Пералня стъкло',       type: 'миялна',     model: 'Lisec WM15',    cost_per_hour: 15.00, service_interval_days: 60 },
      { name: 'Сглобяване линия 1',   type: 'сглобяване', model: 'Custom Line',   cost_per_hour: 10.00, service_interval_days: 180 },
      { name: 'Заливачка полисулфид', type: 'заливачка',  model: 'Virag SL120',   cost_per_hour: 18.00, service_interval_days: 60 },
      { name: 'Заливачка силикон',    type: 'заливачка',  model: 'Virag SS200',   cost_per_hour: 18.00, service_interval_days: 60 },
      { name: 'Шлайф машина №1',      type: 'шлайф',      model: 'Bavelloni G45', cost_per_hour: 20.00, service_interval_days: 90 },
      { name: 'Шлайф машина №2',      type: 'шлайф',      model: 'Bavelloni G45', cost_per_hour: 20.00, service_interval_days: 90 },
      { name: 'Кантираща машина',     type: 'кантиране',  model: 'Forel Edge',    cost_per_hour: 15.00, service_interval_days: 120 },
      { name: 'Темпериращ агрегат',   type: 'темпериране', model: 'Glaston FC',   cost_per_hour: 45.00, service_interval_days: 180 },
      { name: 'Ламинираща преса',     type: 'ламиниране', model: 'Laminated Pro', cost_per_hour: 35.00, service_interval_days: 180 },
      { name: 'Мостов кран',          type: 'транспорт',  model: 'Generic 2T',    cost_per_hour: 5.00,  service_interval_days: 365 },
      { name: 'Вакуумна маса №1',     type: 'помощна',    model: 'Custom',        cost_per_hour: 3.00,  service_interval_days: 365 },
      { name: 'Вакуумна маса №2',     type: 'помощна',    model: 'Custom',        cost_per_hour: 3.00,  service_interval_days: 365 },
      { name: 'Пробивна машина',      type: 'пробивна',   model: 'Intermac Drill',cost_per_hour: 20.00, service_interval_days: 120 },
    ];

    const machineIds = {};
    for (const m of machines) {
      const res = await client.query(
        `INSERT INTO machines (name, type, model, cost_per_hour, service_interval_days, last_service)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE - INTERVAL '45 days')
         ON CONFLICT DO NOTHING RETURNING id`,
        [m.name, m.type, m.model, m.cost_per_hour, m.service_interval_days]
      );
      if (res.rows[0]) machineIds[m.name] = res.rows[0].id;
    }
    console.log('  ✅ Machines seeded');

    // ── MATERIALS ──────────────────────────────────────────────────────────
    const materials = [
      // Стъкло
      { name: 'Флоат стъкло 4мм',        code: 'GL-F04', category: 'стъкло',           unit: 'м²', price: 12.50 },
      { name: 'Флоат стъкло 6мм',        code: 'GL-F06', category: 'стъкло',           unit: 'м²', price: 16.80 },
      { name: 'Флоат стъкло 8мм',        code: 'GL-F08', category: 'стъкло',           unit: 'м²', price: 22.00 },
      { name: 'Флоат стъкло 10мм',       code: 'GL-F10', category: 'стъкло',           unit: 'м²', price: 28.50 },
      { name: 'Low-E стъкло 4мм',        code: 'GL-LE4', category: 'стъкло',           unit: 'м²', price: 45.00 },
      { name: 'Low-E стъкло 6мм',        code: 'GL-LE6', category: 'стъкло',           unit: 'м²', price: 58.00 },
      { name: 'Матирано стъкло 4мм',     code: 'GL-M04', category: 'стъкло',           unit: 'м²', price: 18.00 },
      { name: 'Закалено стъкло 8мм',     code: 'GL-T08', category: 'стъкло',           unit: 'м²', price: 42.00 },
      // Дистанционни рамки
      { name: 'Дист. рамка алум. 16мм',  code: 'SP-A16', category: 'дистанционна_рамка', unit: 'м',  price: 1.20 },
      { name: 'Дист. рамка алум. 20мм',  code: 'SP-A20', category: 'дистанционна_рамка', unit: 'м',  price: 1.45 },
      { name: 'Дист. рамка алум. 12мм',  code: 'SP-A12', category: 'дистанционна_рамка', unit: 'м',  price: 0.98 },
      { name: 'Термичен спесър 16мм',    code: 'SP-T16', category: 'дистанционна_рамка', unit: 'м',  price: 2.80 },
      // Уплътнители
      { name: 'Бутил лента 3мм',         code: 'SE-B3',  category: 'уплътнител',       unit: 'м',  price: 0.35 },
      { name: 'Полисулфид черен',        code: 'SE-PS',  category: 'уплътнител',       unit: 'кг', price: 8.50 },
      { name: 'Силикон структурен',      code: 'SE-SI',  category: 'уплътнител',       unit: 'кг', price: 12.00 },
      { name: 'Молекулярно сито',        code: 'MS-01',  category: 'уплътнител',       unit: 'кг', price: 3.20 },
      // Консумативи
      { name: 'Диамантен диск ф350',     code: 'CO-DD1', category: 'консуматив',       unit: 'бр', price: 180.00 },
      { name: 'Шлайф диск G80',          code: 'CO-SD1', category: 'консуматив',       unit: 'бр', price: 25.00 },
      { name: 'Защитно фолио',           code: 'CO-PF',  category: 'консуматив',       unit: 'м²', price: 0.85 },
      { name: 'Пяна за почистване',      code: 'CH-FC',  category: 'химия',            unit: 'л',  price: 4.50 },
      { name: 'Арнов газ',               code: 'CH-AR',  category: 'химия',            unit: 'л',  price: 0.15 },
    ];

    const materialIds = {};
    for (const m of materials) {
      const res = await client.query(
        `INSERT INTO materials (name, code, category, unit, price_per_unit)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE SET price_per_unit = EXCLUDED.price_per_unit
         RETURNING id`,
        [m.name, m.code, m.category, m.unit, m.price]
      );
      materialIds[m.code] = res.rows[0].id;
    }
    console.log('  ✅ Materials seeded');

    // ── STOCK ──────────────────────────────────────────────────────────────
    const primaryLocId = locationIds['Склад А — флоат стъкло'];
    const spacerLocId  = locationIds['Рафт 1 — дистанционни рамки'];
    const sealLocId    = locationIds['Рафт 3 — силикон и уплътнители'];
    const consLocId    = locationIds['Рафт 6 — консумативи'];

    const stockData = [
      { code: 'GL-F04', loc: primaryLocId, qty: 450,  min: 100 },
      { code: 'GL-F06', loc: primaryLocId, qty: 380,  min: 80  },
      { code: 'GL-F08', loc: primaryLocId, qty: 220,  min: 50  },
      { code: 'GL-F10', loc: primaryLocId, qty: 90,   min: 30  },
      { code: 'GL-LE4', loc: primaryLocId, qty: 120,  min: 40  },
      { code: 'GL-LE6', loc: primaryLocId, qty: 85,   min: 30  },
      { code: 'GL-M04', loc: primaryLocId, qty: 60,   min: 20  },
      { code: 'GL-T08', loc: primaryLocId, qty: 35,   min: 15  },
      { code: 'SP-A16', loc: spacerLocId,  qty: 2500, min: 500 },
      { code: 'SP-A20', loc: spacerLocId,  qty: 1800, min: 400 },
      { code: 'SP-A12', loc: spacerLocId,  qty: 1200, min: 300 },
      { code: 'SP-T16', loc: spacerLocId,  qty: 800,  min: 200 },
      { code: 'SE-B3',  loc: sealLocId,    qty: 5000, min: 1000},
      { code: 'SE-PS',  loc: sealLocId,    qty: 185,  min: 40  },
      { code: 'SE-SI',  loc: sealLocId,    qty: 12,   min: 20  },  // LOW STOCK!
      { code: 'MS-01',  loc: sealLocId,    qty: 220,  min: 50  },
      { code: 'CO-DD1', loc: consLocId,    qty: 3,    min: 5   },  // LOW STOCK!
      { code: 'CO-SD1', loc: consLocId,    qty: 12,   min: 10  },
      { code: 'CO-PF',  loc: consLocId,    qty: 850,  min: 200 },
      { code: 'CH-FC',  loc: consLocId,    qty: 48,   min: 10  },
      { code: 'CH-AR',  loc: consLocId,    qty: 2800, min: 500 },
    ];

    for (const s of stockData) {
      await client.query(
        `INSERT INTO stock (material_id, location_id, quantity, min_threshold)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (material_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
        [materialIds[s.code], s.loc, s.qty, s.min]
      );
    }
    console.log('  ✅ Stock seeded (2 items below threshold)');

    // ── CLIENTS ────────────────────────────────────────────────────────────
    const clients = [
      { name: 'Строй Инвест ЕООД',        phone: '0888 123 456', email: 'office@stroyinvest.bg', city: 'София',      source: 'phone',   eik: '123456789' },
      { name: 'Прозорци и Врати ООД',     phone: '0877 234 567', email: 'sales@pvood.bg',        city: 'Пловдив',    source: 'email',   eik: '234567890' },
      { name: 'Алуминиеви системи АД',    phone: '0899 345 678', email: 'info@alsys.bg',         city: 'Варна',      source: 'office',  eik: '345678901' },
      { name: 'Фасад Груп ЕООД',          phone: '0866 456 789', email: null,                    city: 'Бургас',     source: 'phone',   eik: '456789012' },
      { name: 'Пластмасови конструкции',  phone: '0855 567 890', email: 'order@plastkon.bg',     city: 'Стара Загора',source: 'website', eik: '567890123' },
      { name: 'Кристал Стъкло ООД',       phone: '0844 678 901', email: 'crystal@glass.bg',      city: 'Русе',       source: 'referral',eik: '678901234' },
      { name: 'Иванов Ремонти ЕТ',        phone: '0833 789 012', email: null,                    city: 'Велико Търново',source:'phone',  eik: null },
      { name: 'Архитект Студио ЕООД',     phone: '0822 890 123', email: 'arch@studio.bg',        city: 'София',      source: 'email',   eik: '890123456' },
      { name: 'Хотел Балкан АД',          phone: '0811 901 234', email: 'tech@balkhotel.bg',     city: 'Боровец',    source: 'phone',   eik: '901234567' },
      { name: 'Монтажи БГ ЕООД',         phone: '0800 012 345', email: 'montaji@bg.bg',         city: 'Плевен',     source: 'office',  eik: '012345678' },
    ];

    const clientIds = [];
    for (const c of clients) {
      const res = await client.query(
        `INSERT INTO clients (name, phone, email, city, source, eik)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING RETURNING id`,
        [c.name, c.phone, c.email, c.city, c.source, c.eik]
      );
      if (res.rows[0]) clientIds.push(res.rows[0].id);
    }
    console.log('  ✅ Clients seeded');

    // ── ORDERS ────────────────────────────────────────────────────────────
    const officeUserId = userIds['office1@espeho.com'];
    const adminUserId  = userIds['admin@espeho.com'];

    const ordersData = [
      { client: 0, status: 'ДОСТАВЕНА', type: 'стъклопакет',      days_ago: 20, deadline_offset: 3, sale_price: 1850.00, urgent: false },
      { client: 1, status: 'ГОТОВА',    type: 'стъклопакет',      days_ago: 5,  deadline_offset: 1, sale_price: 3200.00, urgent: false },
      { client: 2, status: 'ПРОИЗВОДСТВО', type: 'стъклопакет',   days_ago: 3,  deadline_offset: 2, sale_price: 2750.00, urgent: true  },
      { client: 3, status: 'ПРОИЗВОДСТВО', type: 'единично_стъкло',days_ago: 4, deadline_offset: -1, sale_price: 980.00,  urgent: true  }, // OVERDUE
      { client: 4, status: 'МАТЕРИАЛИ', type: 'стъклопакет',      days_ago: 2,  deadline_offset: 5, sale_price: 5600.00, urgent: false },
      { client: 5, status: 'НОВА',      type: 'единично_стъкло',  days_ago: 1,  deadline_offset: 7, sale_price: 450.00,  urgent: false },
      { client: 6, status: 'НОВА',      type: 'стъклопакет',      days_ago: 0,  deadline_offset: 10,sale_price: 1200.00, urgent: false },
      { client: 7, status: 'ПРОИЗВОДСТВО', type: 'смесена',        days_ago: 6,  deadline_offset: 0, sale_price: 4100.00, urgent: true  }, // OVERDUE
      { client: 8, status: 'ДОСТАВЕНА', type: 'стъклопакет',      days_ago: 30, deadline_offset: 5, sale_price: 8900.00, urgent: false },
      { client: 9, status: 'ГОТОВА',    type: 'единично_стъкло',  days_ago: 7,  deadline_offset: 2, sale_price: 720.00,  urgent: false },
    ];

    const orderIds = [];
    for (const o of ordersData) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + o.deadline_offset);
      const res = await client.query(
        `INSERT INTO orders (client_id, status, order_type, deadline, is_urgent, sale_price, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - $8::INTERVAL)
         RETURNING id`,
        [
          clientIds[o.client] || clientIds[0],
          o.status, o.type,
          deadline.toISOString().split('T')[0],
          o.urgent, o.sale_price,
          officeUserId,
          `${o.days_ago} days`
        ]
      );
      orderIds.push(res.rows[0].id);
    }
    console.log('  ✅ Orders seeded (10 orders, various statuses)');

    // ── ORDER ITEMS ────────────────────────────────────────────────────────
    const items = [
      { order: 0, desc: '4-16Ar-4 Low-E, 1200×800мм', width: 1200, height: 800,  qty: 6,  price: 185.00 },
      { order: 0, desc: '4-16Ar-4 Low-E, 900×600мм',  width: 900,  height: 600,  qty: 4,  price: 95.00  },
      { order: 1, desc: '4-20Ar-6 Low-E, 1600×1200мм',width: 1600, height: 1200, qty: 8,  place: 380.00 },
      { order: 2, desc: '4-16-4, 1000×700мм',          width: 1000, height: 700,  qty: 12, price: 145.00 },
      { order: 3, desc: 'Единично закалено 8мм, 800×600мм', width: 800, height: 600, qty: 5, price: 196.00 },
      { order: 4, desc: '6-16Ar-6 Low-E, 2000×1400мм',width: 2000, height: 1400, qty: 10, price: 520.00 },
      { order: 5, desc: 'Матирано 4мм, 600×400мм',    width: 600,  height: 400,  qty: 8,  price: 56.25 },
      { order: 6, desc: '4-16-4, 1200×900мм',          width: 1200, height: 900,  qty: 6,  price: 200.00 },
    ];

    for (const it of items) {
      if (!orderIds[it.order]) continue;
      await client.query(
        `INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, unit_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderIds[it.order], 'стъклопакет', it.desc, it.width, it.height, it.qty, it.price || it.place || 0]
      );
    }
    console.log('  ✅ Order items seeded');

    // ── PRODUCTION STAGES ──────────────────────────────────────────────────
    const stageTemplates = {
      'стъклопакет':      ['Рязане', 'Миене', 'Сглобяване', 'Заливане'],
      'единично_стъкло':  ['Рязане', 'Шлайфане', 'Кантиране'],
      'смесена':          ['Рязане', 'Миене', 'Сглобяване', 'Заливане'],
    };

    const prodWorker1 = userIds['prod1@espeho.com'];
    const prodWorker2 = userIds['prod2@espeho.com'];

    for (let i = 0; i < ordersData.length; i++) {
      const ord = ordersData[i];
      const stages = stageTemplates[ord.type] || stageTemplates['стъклопакет'];
      for (let si = 0; si < stages.length; si++) {
        let stageStatus = 'ЧАКАЩ';
        let startedAt = null;
        let completedAt = null;

        if (ord.status === 'ДОСТАВЕНА' || ord.status === 'ГОТОВА') {
          stageStatus = 'ГОТОВ';
          startedAt = `NOW() - '${ord.days_ago + 2} days'::INTERVAL`;
          completedAt = `NOW() - '${ord.days_ago} days'::INTERVAL`;
        } else if (ord.status === 'ПРОИЗВОДСТВО' && si === 0) {
          stageStatus = 'ГОТОВ';
          completedAt = `NOW() - '2 days'::INTERVAL`;
        } else if (ord.status === 'ПРОИЗВОДСТВО' && si === 1) {
          stageStatus = 'В_ПРОЦЕС';
          startedAt = `NOW() - '1 day'::INTERVAL`;
        }

        await client.query(
          `INSERT INTO production_stages (order_id, stage_name, stage_order, status, assigned_to, started_at, completed_at)
           VALUES ($1, $2, $3, $4, $5,
             ${startedAt ? startedAt : 'NULL'},
             ${completedAt ? completedAt : 'NULL'})`,
          [orderIds[i], stages[si], si + 1, stageStatus,
           si < 2 ? prodWorker1 : prodWorker2]
        );
      }
    }
    console.log('  ✅ Production stages seeded');

    // ── ORDER COSTS ────────────────────────────────────────────────────────
    for (let i = 0; i < orderIds.length; i++) {
      const ord = ordersData[i];
      const baseCost = ord.sale_price * (0.45 + Math.random() * 0.20);
      await client.query(
        `INSERT INTO order_costs (order_id, material_cost, labor_cost, machine_cost, overhead_pct)
         VALUES ($1, $2, $3, $4, 15)
         ON CONFLICT (order_id) DO NOTHING`,
        [orderIds[i],
         (baseCost * 0.60).toFixed(2),
         (baseCost * 0.28).toFixed(2),
         (baseCost * 0.12).toFixed(2)]
      );
    }
    console.log('  ✅ Order costs seeded');

    // ── SAMPLE DEFECTS ─────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO defects (order_id, worker_id, cause_type, cause_notes, material_cost, labor_cost, decision, resolved_at, resolved_by)
       VALUES ($1, $2, 'грешка_размер', 'Стъклото е нарязано с 5мм отклонение', 45.00, 25.50, 'преработка', NOW() - '3 days'::INTERVAL, $3)`,
      [orderIds[0], prodWorker1, adminUserId]
    );
    await client.query(
      `INSERT INTO defects (order_id, worker_id, cause_type, cause_notes, material_cost, labor_cost, decision)
       VALUES ($1, $2, 'машинна_грешка', 'Пукнатина при рязане — диск с дефект', 120.00, 38.00, 'отписване')`,
      [orderIds[2], prodWorker2]
    );
    console.log('  ✅ Sample defects seeded');

    // ── MAINTENANCE LOGS ───────────────────────────────────────────────────
    const machineArr = Object.values(machineIds);
    if (machineArr[0]) {
      await client.query(
        `INSERT INTO maintenance_logs (machine_id, maintenance_type, performed_by, notes, performed_at, next_service)
         VALUES ($1, 'профилактика', 'Техник Петров', 'Рутинна смазка и почистване. Диска сменен.', CURRENT_DATE - 45, CURRENT_DATE + 45)`,
        [machineArr[0]]
      );
    }
    console.log('  ✅ Maintenance logs seeded');

    await client.query('COMMIT');
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   admin@espeho.com     → espeho2024 (Администратор)');
    console.log('   office1@espeho.com   → espeho2024 (Офис)');
    console.log('   prod1@espeho.com     → espeho2024 (Производство)');
    console.log('   warehouse1@espeho.com→ espeho2024 (Склад)');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
