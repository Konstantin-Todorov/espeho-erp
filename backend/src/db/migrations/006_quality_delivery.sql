-- Quality control checklist items per order
CREATE TABLE IF NOT EXISTS quality_checks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item        TEXT NOT NULL,
  checked     BOOLEAN NOT NULL DEFAULT false,
  checked_by  UUID REFERENCES users(id),
  checked_at  TIMESTAMPTZ,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_checks_order ON quality_checks(order_id);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id       UUID REFERENCES users(id),
  driver_name     TEXT,
  scheduled_date  DATE,
  delivered_at    TIMESTAMPTZ,
  address         TEXT,
  notes           TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','IN_TRANSIT','DELIVERED','FAILED')),
  recipient_name  TEXT,
  signature_note  TEXT,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(scheduled_date);
