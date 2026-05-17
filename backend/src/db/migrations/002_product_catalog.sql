-- 002_product_catalog.sql — Product templates catalog

CREATE TABLE IF NOT EXISTS product_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  order_type VARCHAR(50) NOT NULL DEFAULT 'стъклопакет',
  default_description TEXT,
  default_width NUMERIC(8,2),
  default_height NUMERIC(8,2),
  unit_price NUMERIC(10,2),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO product_templates (name, order_type, default_description, unit_price, sort_order) VALUES
('4-16Ar-4 Low-E',        'стъклопакет',     '4мм флоат + 16мм Ar + 4мм Low-E',        185.00, 10),
('4-16-4 стандарт',       'стъклопакет',     '4мм флоат + 16мм + 4мм флоат',             95.00, 20),
('6-16Ar-6 Low-E',        'стъклопакет',     '6мм флоат + 16мм Ar + 6мм Low-E',         280.00, 30),
('4-20Ar-6 Triple',       'стъклопакет',     '4+20Ar+6 тройно стъклопакет',             380.00, 40),
('Единично 4мм флоат',    'единично_стъкло', 'Флоат стъкло 4мм',                          12.50, 50),
('Единично 6мм флоат',    'единично_стъкло', 'Флоат стъкло 6мм',                          16.80, 60),
('Закалено 8мм',          'единично_стъкло', 'Закалено стъкло 8мм',                       42.00, 70),
('Матирано 4мм',          'единично_стъкло', 'Матирано стъкло 4мм',                       18.00, 80)
ON CONFLICT DO NOTHING;
