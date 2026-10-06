-- 011: original order number, payments, delivery date, item units & line totals, settings
-- Additive only — no data is deleted.

-- ── Orders ─────────────────────────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS external_ref  VARCHAR(50),           -- номер от таблицата / офиса (напр. 326-00160)
  ADD COLUMN IF NOT EXISTS delivered_at  TIMESTAMPTZ,           -- кога е доставена/предадена
  ADD COLUMN IF NOT EXISTS fulfillment   VARCHAR(20) NOT NULL DEFAULT 'вземане'
    CHECK (fulfillment IN ('вземане','доставка','монтаж'));     -- клиентът взема / доставка / монтаж

CREATE INDEX IF NOT EXISTS idx_orders_external_ref ON orders (external_ref);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders (payment_status);

-- Move "Оригинален №: X" out of the notes into its own searchable field
UPDATE orders
   SET external_ref = TRIM(SUBSTRING(notes FROM 'Оригинален №:\s*(\S+)')),
       notes = NULLIF(TRIM(REGEXP_REPLACE(notes, 'Оригинален №:\s*\S+', '')), '')
 WHERE external_ref IS NULL AND notes LIKE 'Оригинален №:%';

-- One imported order was typed with the wrong year (16.12.2026, number prefix 625 = 2025)
UPDATE orders SET created_at = created_at - INTERVAL '1 year', updated_at = updated_at - INTERVAL '1 year'
 WHERE external_ref IS NOT NULL AND created_at > NOW() + INTERVAL '1 day';

-- Imported costs come straight from the spreadsheet — do not add the default 15% overhead on top
UPDATE order_costs oc SET overhead_pct = 0
  FROM orders o WHERE o.id = oc.order_id AND o.external_ref IS NOT NULL;

-- Historical (imported) orders: delivered on their creation date and paid
UPDATE orders SET delivered_at = created_at
 WHERE status = 'ДОСТАВЕНА' AND delivered_at IS NULL AND external_ref IS NOT NULL;
UPDATE orders SET delivered_at = updated_at
 WHERE status = 'ДОСТАВЕНА' AND delivered_at IS NULL;
UPDATE orders SET payment_status = 'платена'
 WHERE external_ref IS NOT NULL AND status = 'ДОСТАВЕНА' AND payment_status = 'неплатена';

-- ── Payments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount <> 0),
  method      VARCHAR(20) NOT NULL DEFAULT 'брой' CHECK (method IN ('брой','банка','карта','друго')),
  paid_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);

-- ── Order items: units, billable quantity, stored line totals ──────────────────
ALTER TABLE order_items ALTER COLUMN qty TYPE NUMERIC(10,2);
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS uom         VARCHAR(10) NOT NULL DEFAULT 'm2'
    CHECK (uom IN ('m2','lm','pcs','fixed')),                  -- м² / линеен метър / брой / сума
  ADD COLUMN IF NOT EXISTS area_m2     NUMERIC(10,4),           -- таксувана площ (с минимум)
  ADD COLUMN IF NOT EXISTS billed_qty  NUMERIC(10,4),           -- количество, по което се смята цената
  ADD COLUMN IF NOT EXISTS line_total  NUMERIC(10,2),           -- сума по реда (с ДДС)
  ADD COLUMN IF NOT EXISTS line_cost   NUMERIC(10,2),           -- себестойност по реда (без ДДС)
  ADD COLUMN IF NOT EXISTS thickness_mm NUMERIC(5,1);

-- ── Defects: who recorded it vs who is responsible ──────────────────────────────
ALTER TABLE defects ADD COLUMN IF NOT EXISTS reported_by UUID REFERENCES users(id);
UPDATE defects SET reported_by = worker_id WHERE reported_by IS NULL;

-- ── Settings ───────────────────────────────────────────────────────────────────
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS hint TEXT;
INSERT INTO app_settings (key, value, label, hint) VALUES
  ('vat_pct',               '20',  'ДДС (%)', 'Цените в поръчките са С ДДС. Използва се за изчисляване на сума без ДДС и марж.'),
  ('min_area_igu_m2',       '0.4', 'Минимална площ — стъклопакет (м²)', 'Всеки стъклопакет под тази площ се таксува като тази площ.'),
  ('min_area_single_m2',    '0.2', 'Минимална площ — единично стъкло (м²)', 'Всяко единично стъкло под тази площ се таксува като тази площ.'),
  ('default_overhead_pct',  '15',  'Режийни върху себестойността (%)', 'Добавя се към материали + труд + машини при нови поръчки.')
ON CONFLICT (key) DO NOTHING;
UPDATE app_settings SET hint = 'Процент от продажната цена без ДДС, който получава размераджията.' WHERE key='commission_measurer_pct' AND hint IS NULL;
UPDATE app_settings SET hint = 'Процент от продажната цена без ДДС, който получава офисът, приел поръчката.' WHERE key='commission_office_pct' AND hint IS NULL;
UPDATE app_settings SET hint = 'Общ процент за разпределяне (в таблицата — колона „по 7,7%“).' WHERE key='commission_pool_pct' AND hint IS NULL;
UPDATE app_settings SET hint = 'С колко се надценява себестойността от каталога, за да се получи продажна цена.' WHERE key='price_markup_pct' AND hint IS NULL;

-- ── Purchase orders: allow partial receipt ─────────────────────────────────────
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check
  CHECK (status IN ('DRAFT','SENT','PARTIAL','RECEIVED','CANCELLED'));
