-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL;

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number    VARCHAR(20) UNIQUE NOT NULL,
  client_id       UUID NOT NULL REFERENCES clients(id),
  created_by      UUID NOT NULL REFERENCES users(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  valid_until     DATE,
  notes           TEXT,
  items           JSONB NOT NULL DEFAULT '[]',
  total_price     NUMERIC(12,2) DEFAULT 0,
  converted_to    UUID REFERENCES orders(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Counter for quote numbers
CREATE SEQUENCE IF NOT EXISTS quotation_seq START 1;
