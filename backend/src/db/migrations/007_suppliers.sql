-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  contact     TEXT,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  vat_number  TEXT,
  notes       TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase orders (orders TO suppliers)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number     VARCHAR(20) UNIQUE NOT NULL,
  supplier_id   UUID NOT NULL REFERENCES suppliers(id),
  created_by    UUID NOT NULL REFERENCES users(id),
  status        VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                CHECK (status IN ('DRAFT','SENT','RECEIVED','CANCELLED')),
  expected_date DATE,
  received_date DATE,
  notes         TEXT,
  total_amount  NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS po_seq START 1;

-- Purchase order line items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  material_id     UUID REFERENCES materials(id),
  description     TEXT NOT NULL,
  quantity        NUMERIC(12,4) NOT NULL,
  unit            TEXT,
  unit_price      NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_price     NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(quantity * unit_price, 2)) STORED,
  received_qty    NUMERIC(12,4) DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Link materials to preferred supplier
ALTER TABLE materials ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
