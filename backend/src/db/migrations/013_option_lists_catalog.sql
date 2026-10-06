-- 013: editable option lists (dropdowns the office can extend) + catalog with selling prices
-- Additive only.

CREATE TABLE IF NOT EXISTS option_lists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_key   VARCHAR(60) NOT NULL,            -- e.g. 'defect_cause', 'payment_method', 'stages:стъклопакет'
  value      VARCHAR(120) NOT NULL,           -- stored on records (stable)
  label      VARCHAR(160) NOT NULL,           -- shown in the UI (editable)
  sort_order INT NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (list_key, value)
);
CREATE INDEX IF NOT EXISTS idx_option_lists_key ON option_lists (list_key, sort_order);

INSERT INTO option_lists (list_key, value, label, sort_order) VALUES
  -- Defect causes (existing values keep working)
  ('defect_cause', 'човешка_грешка',      'Човешка грешка',                1),
  ('defect_cause', 'машинна_грешка',      'Машинна грешка',                2),
  ('defect_cause', 'грешка_размер',       'Грешен размер',                 3),
  ('defect_cause', 'дефект_материал',     'Дефект на стъклото/материала',  4),
  ('defect_cause', 'транспортна_повреда', 'Счупено при транспорт',         5),
  ('defect_cause', 'счупено_монтаж',      'Счупено при монтаж',            6),
  ('defect_cause', 'грешка_клиент',       'Грешка в поръчката от клиента', 7),
  ('defect_cause', 'друго',               'Друго',                         99),
  -- Payment methods
  ('payment_method', 'брой',  'В брой',          1),
  ('payment_method', 'банка', 'Банков превод',   2),
  ('payment_method', 'карта', 'Карта',           3),
  ('payment_method', 'друго', 'Друго',           99),
  -- Where the order/client came from
  ('source', 'office',   'На място в офиса', 1),
  ('source', 'phone',    'Телефон',          2),
  ('source', 'email',    'Email',            3),
  ('source', 'website',  'Уебсайт',          4),
  ('source', 'referral', 'Препоръка',        5),
  ('source', 'dealer',   'Дилър / фирма',    6),
  ('source', 'other',    'Друго',            99),
  -- Production stages per order type (order = sequence in the shop)
  ('stages:стъклопакет',     'Рязане',      'Рязане',      1),
  ('stages:стъклопакет',     'Миене',       'Миене',       2),
  ('stages:стъклопакет',     'Сглобяване',  'Сглобяване',  3),
  ('stages:стъклопакет',     'Заливане',    'Заливане',    4),
  ('stages:единично_стъкло', 'Рязане',      'Рязане',      1),
  ('stages:единично_стъкло', 'Шлайфане',    'Шлайфане',    2),
  ('stages:единично_стъкло', 'Кантиране',   'Кантиране',   3),
  ('stages:смесена',         'Рязане',      'Рязане',      1),
  ('stages:смесена',         'Миене',       'Миене',       2),
  ('stages:смесена',         'Сглобяване',  'Сглобяване',  3),
  ('stages:смесена',         'Заливане',    'Заливане',    4),
  -- Extra stage names offered when adding a stage by hand
  ('stage_extra', 'Отвори',            'Отвори',            1),
  ('stage_extra', 'Фасет',             'Фасет',             2),
  ('stage_extra', 'Закаляване',        'Закаляване',        3),
  ('stage_extra', 'Пясъкоструене',     'Пясъкоструене',     4),
  ('stage_extra', 'Боядисване',        'Боядисване',        5),
  ('stage_extra', 'UV лепене',         'UV лепене',         6),
  ('stage_extra', 'Контрол качество',  'Контрол качество',  7),
  ('stage_extra', 'Опаковане',         'Опаковане',         8)
ON CONFLICT (list_key, value) DO NOTHING;

-- Free values instead of fixed CHECK lists (the lists above are the source of truth)
ALTER TABLE orders   DROP CONSTRAINT IF EXISTS orders_source_check;
ALTER TABLE clients  DROP CONSTRAINT IF EXISTS clients_source_check;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- ── Catalog: selling price (with VAT), unit, category ──────────────────────────
ALTER TABLE product_templates
  ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2),                 -- продажна цена с ДДС
  ADD COLUMN IF NOT EXISTS uom VARCHAR(10) NOT NULL DEFAULT 'm2'
    CHECK (uom IN ('m2','lm','pcs','fixed')),
  ADD COLUMN IF NOT EXISTS category VARCHAR(80),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN product_templates.unit_price IS 'Себестойност без ДДС (за единица мярка)';

UPDATE product_templates SET category = CASE order_type
  WHEN 'стъклопакет' THEN 'Стъклопакети' WHEN 'единично_стъкло' THEN 'Единично стъкло' ELSE 'Други' END
 WHERE category IS NULL;

-- Typical selling price from real sales (median €/м² of the last 12 months) where we have enough data
UPDATE product_templates pt SET sale_price = s.median
  FROM (
    SELECT UPPER(oi.product_desc) AS d,
           PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY oi.unit_price)::numeric(10,2) AS median, COUNT(*) AS n
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE oi.uom = 'm2' AND oi.unit_price > 0 AND o.order_category = 'нормална'
     GROUP BY 1) s
 WHERE UPPER(pt.name) = s.d AND s.n >= 3 AND pt.sale_price IS NULL;
