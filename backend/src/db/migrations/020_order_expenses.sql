-- 020: extra expenses per order (transport, installation crew, commission, subcontractor…) — entered by the
-- owner in the "Платени поръчки" report or on the order. Amounts are WITHOUT VAT, like the cost.
CREATE TABLE IF NOT EXISTS order_expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  category    VARCHAR(120) NOT NULL DEFAULT 'друго',
  description TEXT,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount <> 0),
  spent_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_expenses_order ON order_expenses (order_id);

INSERT INTO option_lists (list_key, value, label, sort_order) VALUES
  ('expense_category', 'материали',     'Материали (допълнително)', 1),
  ('expense_category', 'транспорт',     'Транспорт',                2),
  ('expense_category', 'монтаж',        'Монтаж / монтажници',      3),
  ('expense_category', 'комисионна',    'Комисионна',               4),
  ('expense_category', 'подизпълнител', 'Подизпълнител (закаляване и др.)', 5),
  ('expense_category', 'друго',         'Друго',                    99)
ON CONFLICT (list_key, value) DO NOTHING;
