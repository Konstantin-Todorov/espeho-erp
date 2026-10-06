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

-- Defaults based on espeho.com and the real order data (October 2026)
INSERT INTO option_lists (list_key, value, label, sort_order) VALUES
  ('defect_cause', 'счупено_рязане', 'Счупено при рязане', 1),
  ('defect_cause', 'счупено_кант', 'Счупено при кантиране / шлайф', 2),
  ('defect_cause', 'счупено_отвор', 'Счупено при пробиване / изрез', 3),
  ('defect_cause', 'счупено_закаляване', 'Счупено при закаляване', 4),
  ('defect_cause', 'драскотина', 'Драскотина', 5),
  ('defect_cause', 'мида', 'Мида / отчупен ръб', 6),
  ('defect_cause', 'грешка_размер', 'Грешен размер (цех)', 7),
  ('defect_cause', 'грешка_замерване', 'Грешен размер от замерване / клиента', 8),
  ('defect_cause', 'грешка_офис', 'Грешка при въвеждане на поръчката', 9),
  ('defect_cause', 'грешно_стъкло', 'Грешен вид / дебелина стъкло', 10),
  ('defect_cause', 'дефект_материал', 'Дефект на стъклото от доставчика', 11),
  ('defect_cause', 'петна', 'Петна / лошо миене', 12),
  ('defect_cause', 'конденз', 'Разхерметизиран пакет / конденз', 13),
  ('defect_cause', 'транспортна_повреда', 'Счупено при транспорт / товарене', 14),
  ('defect_cause', 'счупено_монтаж', 'Счупено при монтаж', 15),
  ('defect_cause', 'машинна_грешка', 'Машинна повреда', 16),
  ('defect_cause', 'човешка_грешка', 'Човешка грешка (друго)', 17),
  ('defect_cause', 'друго', 'Друго', 99),
  ('defect_responsibility', 'цех', 'Цех', 1),
  ('defect_responsibility', 'офис', 'Офис', 2),
  ('defect_responsibility', 'доставчик', 'Доставчик', 3),
  ('defect_responsibility', 'клиент', 'Клиент', 4),
  ('defect_responsibility', 'транспорт', 'Транспорт', 5),
  ('defect_responsibility', 'монтаж', 'Монтаж', 6),
  ('payment_method', 'брой', 'В брой', 1),
  ('payment_method', 'банка', 'Банков превод', 2),
  ('payment_method', 'карта', 'Карта (POS)', 3),
  ('payment_method', 'онлайн', 'Онлайн с карта', 4),
  ('payment_method', 'наложен', 'Наложен платеж (куриер)', 5),
  ('payment_method', 'аванс', 'Авансово плащане', 6),
  ('payment_method', 'прихващане', 'Прихващане', 7),
  ('payment_method', 'друго', 'Друго', 99),
  ('source', 'office', 'Посещение в офиса / цеха', 1),
  ('source', 'phone', 'Телефон', 2),
  ('source', 'email', 'Имейл', 3),
  ('source', 'website', 'Сайт espeho.com', 4),
  ('source', 'shop', 'Онлайн магазин', 5),
  ('source', 'google', 'Google (търсене / Maps)', 6),
  ('source', 'social', 'Facebook / Instagram', 7),
  ('source', 'referral', 'Препоръка', 8),
  ('source', 'regular', 'Постоянен клиент', 9),
  ('source', 'dealer', 'Дилър / монтажна фирма', 10),
  ('source', 'builder', 'Строителна фирма / архитект', 11),
  ('source', 'other', 'Друго', 99),
  ('stages:стъклопакет', 'Рязане', 'Рязане', 1),
  ('stages:стъклопакет', 'Миене', 'Миене', 2),
  ('stages:стъклопакет', 'Рамка (дистанционер)', 'Рамка (дистанционер)', 3),
  ('stages:стъклопакет', 'Сглобяване', 'Сглобяване', 4),
  ('stages:стъклопакет', 'Заливане', 'Заливане', 5),
  ('stages:стъклопакет', 'Контрол', 'Контрол', 6),
  ('stages:единично_стъкло', 'Рязане', 'Рязане', 1),
  ('stages:единично_стъкло', 'Кантиране', 'Кантиране', 2),
  ('stages:единично_стъкло', 'Отвори / изрези', 'Отвори / изрези', 3),
  ('stages:единично_стъкло', 'Миене', 'Миене', 4),
  ('stages:единично_стъкло', 'Контрол', 'Контрол', 5),
  ('stages:смесена', 'Рязане', 'Рязане', 1),
  ('stages:смесена', 'Кантиране', 'Кантиране', 2),
  ('stages:смесена', 'Миене', 'Миене', 3),
  ('stages:смесена', 'Сглобяване', 'Сглобяване', 4),
  ('stages:смесена', 'Заливане', 'Заливане', 5),
  ('stages:смесена', 'Контрол', 'Контрол', 6),
  ('stage_extra', 'Шлайф', 'Шлайф', 1),
  ('stage_extra', 'Фасет', 'Фасет', 2),
  ('stage_extra', 'Закаляване', 'Закаляване', 3),
  ('stage_extra', 'Пълнене с аргон', 'Пълнене с аргон', 4),
  ('stage_extra', 'Матиране / фолиране', 'Матиране / фолиране', 5),
  ('stage_extra', 'Боядисване RAL', 'Боядисване RAL', 6),
  ('stage_extra', 'UV лепене', 'UV лепене', 7),
  ('stage_extra', 'Лепене със силикон', 'Лепене със силикон', 8),
  ('stage_extra', 'Съхнене', 'Съхнене', 9),
  ('stage_extra', 'Опаковане', 'Опаковане', 10),
  ('stage_extra', 'Замерване на обекта', 'Замерване на обекта', 11),
  ('stage_extra', 'Монтаж', 'Монтаж', 12)
ON CONFLICT (list_key, value) DO NOTHING;

ALTER TABLE defects ADD COLUMN IF NOT EXISTS responsibility VARCHAR(40);

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

-- ── Services sold every day (кант, отвори, закаляване…) — unit as in the price list, price = median of real sales
INSERT INTO product_templates (name, order_type, category, uom, sale_price, sort_order)
SELECT v.name, 'друго', v.cat, v.uom, v.price, v.ord
  FROM (VALUES
    ('ПРАВОЛИНЕЕН КАНТ 4ММ', 'Обработки', 'lm', 1.40, 1), ('ПРАВОЛИНЕЕН КАНТ 5ММ', 'Обработки', 'lm', 1.40, 2),
    ('ПРАВОЛИНЕЕН КАНТ 6ММ', 'Обработки', 'lm', 1.40, 3), ('ПРАВОЛИНЕЕН КАНТ 8ММ', 'Обработки', 'lm', 2.30, 4),
    ('ПРАВОЛИНЕЕН КАНТ 10ММ', 'Обработки', 'lm', 2.80, 5), ('ПРАВОЛИНЕЕН КАНТ 4,1,4', 'Обработки', 'lm', 2.30, 6),
    ('ШЛАЙФ', 'Обработки', 'lm', 0.90, 7), ('ФАСЕТ', 'Обработки', 'lm', NULL, 8),
    ('ОТВОР Ф12', 'Обработки', 'pcs', 1.80, 10), ('ОТВОР Ф16', 'Обработки', 'pcs', 1.80, 11), ('ОТВОР Ф26', 'Обработки', 'pcs', 1.80, 12),
    ('ГАМА/ПАНТА', 'Обработки', 'pcs', 3.70, 13), ('КОПЧЕ', 'Обработки', 'pcs', 2.30, 14),
    ('НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 'Обработки', 'pcs', 3.50, 15), ('АРКА / КРЪГ', 'Обработки', 'pcs', 5.50, 16),
    ('ЛЕПЕНЕ СЪС СИЛИКОН', 'Обработки', 'pcs', 7.05, 17), ('ЛЕПЕНЕ UV', 'Обработки', 'pcs', NULL, 18),
    ('ЗАКАЛЯВАНЕ ФЛОАТ 4ММ', 'Закаляване и матиране', 'm2', 15.50, 20), ('ЗАКАЛЯВАНЕ ФЛОАТ 6ММ', 'Закаляване и матиране', 'm2', 17.40, 21),
    ('ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 'Закаляване и матиране', 'm2', 21.50, 22), ('ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 'Закаляване и матиране', 'm2', 25.50, 23),
    ('ЗАКАЛЯВАНЕ 8ММ ЦВЕТНО', 'Закаляване и матиране', 'm2', 25.50, 24),
    ('ХИМИЧЕСКИ МАТ 4ММ', 'Закаляване и матиране', 'm2', 17.10, 25), ('ХИМИЧЕСКИ МАТ 8ММ', 'Закаляване и матиране', 'm2', 34.50, 26),
    ('ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 'Добавки за стъклопакет', 'm2', NULL, 30), ('ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 'Добавки за стъклопакет', 'm2', 12.60, 31),
    ('АРГОН 2-ЕН', 'Добавки за стъклопакет', 'm2', NULL, 32), ('АРГОН 3-ЕН', 'Добавки за стъклопакет', 'm2', NULL, 33),
    ('НЕПРАВИЛЕН 2-ЕН', 'Добавки за стъклопакет', 'pcs', 5.40, 34), ('АРКА 2-ЕН', 'Добавки за стъклопакет', 'pcs', 11.00, 35),
    ('МОНТАЖ', 'Услуги', 'fixed', NULL, 40), ('ТРАНСПОРТ СОФИЯ', 'Услуги', 'fixed', NULL, 41),
    ('ТРАНСПОРТ ИЗВЪН СОФИЯ', 'Услуги', 'fixed', NULL, 42), ('ЗАМЕРВАНЕ', 'Услуги', 'fixed', NULL, 43)
  ) AS v(name, cat, uom, price, ord)
 WHERE NOT EXISTS (SELECT 1 FROM product_templates p WHERE UPPER(p.name) = v.name);

-- ── Company details for printouts (editable in Настройки)
INSERT INTO app_settings (key, value, label, hint) VALUES
  ('company_name',    '„ЕСПЕХО“ ООД', 'Фирма', 'Изписва се на работните листове и бележките.'),
  ('company_eik',     '130495743', 'ЕИК', ''),
  ('company_vat',     'BG130495743', 'ДДС №', ''),
  ('company_address', 'гр. София, бул. „Свети Наум“ 35', 'Адрес на офиса', ''),
  ('company_workshop','гр. София, ул. „Чепинско шосе“ 110', 'Адрес на цеха', ''),
  ('company_phone',   '0888 567 406, 02/963-17-92', 'Телефони', ''),
  ('company_email',   'office@espeho.com', 'Имейл', '')
ON CONFLICT (key) DO NOTHING;
