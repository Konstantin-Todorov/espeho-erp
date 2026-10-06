-- 015: client data from the official registers (Търговски регистър / VIES)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS website VARCHAR(200),
  ADD COLUMN IF NOT EXISTS legal_name VARCHAR(250),        -- пълно официално наименование
  ADD COLUMN IF NOT EXISTS registry_checked_at TIMESTAMPTZ; -- кога е сверен с регистъра
CREATE INDEX IF NOT EXISTS idx_clients_eik ON clients (eik);

-- Old / alternative names of a client (after a merge or rename) so a later spreadsheet import
-- maps them to the right client instead of creating a duplicate.
CREATE TABLE IF NOT EXISTS client_aliases (
  name_key   VARCHAR(250) PRIMARY KEY,                       -- UPPER, single spaces
  client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_aliases_client ON client_aliases (client_id);

-- Complaint / rework orders point to the original order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_related ON orders (related_order_id);
