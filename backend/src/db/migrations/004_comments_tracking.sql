-- Order comments (internal chat between office and production)
CREATE TABLE IF NOT EXISTS order_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_order ON order_comments(order_id);

-- Public tracking token for client order tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_token UUID DEFAULT uuid_generate_v4() UNIQUE;
UPDATE orders SET tracking_token = uuid_generate_v4() WHERE tracking_token IS NULL;
