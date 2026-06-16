-- 009_order_enhancements.sql
-- Order category (нормална/гаранция/вътрешна/мострена)
-- Installation tracking
-- Payment status

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_category VARCHAR(20) NOT NULL DEFAULT 'нормална'
    CHECK (order_category IN ('нормална','гаранция','вътрешна','мострена')),
  ADD COLUMN IF NOT EXISTS installation_status VARCHAR(20) DEFAULT NULL
    CHECK (installation_status IN ('ЗА_МОНТАЖ','МОНТИРАНА') OR installation_status IS NULL),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'неплатена'
    CHECK (payment_status IN ('неплатена','частично','платена'));

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_installation_status ON orders(installation_status);
