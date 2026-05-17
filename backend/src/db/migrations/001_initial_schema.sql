-- ============================================================
-- ЕСПЕХО ООД — ERP Database Schema
-- Migration 001: Initial schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search on names

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('admin','office','production','warehouse')),
  active      BOOLEAN NOT NULL DEFAULT true,
  hourly_rate NUMERIC(8,2) DEFAULT 0, -- лв/час, used for labor cost
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(200) NOT NULL,
  phone       VARCHAR(50),
  email       VARCHAR(150),
  address     TEXT,
  city        VARCHAR(100),
  eik         VARCHAR(20),       -- ЕИК / булстат
  mol         VARCHAR(100),      -- материално отговорно лице
  source      VARCHAR(30) DEFAULT 'office' CHECK (source IN ('phone','email','office','website','referral','other')),
  notes       TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_name ON clients USING gin(name gin_trgm_ops);
CREATE INDEX idx_clients_phone ON clients(phone);

-- ============================================================
-- MACHINES
-- ============================================================
CREATE TABLE IF NOT EXISTS machines (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(100) NOT NULL,
  type                 VARCHAR(50),           -- резачка, шлайф, заливачка, etc.
  model                VARCHAR(100),
  serial_number        VARCHAR(100),
  cost_per_hour        NUMERIC(8,2) DEFAULT 0,
  last_service         DATE,
  service_interval_days INTEGER DEFAULT 90,
  notes                TEXT,
  active               BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'НОВА',
  'МАТЕРИАЛИ',
  'ПРОИЗВОДСТВО',
  'ГОТОВА',
  'ДОСТАВЕНА',
  'ОТКАЗАНА'
);

CREATE TYPE order_type AS ENUM (
  'стъклопакет',
  'единично_стъкло',
  'смесена'
);

CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number  SERIAL UNIQUE,        -- human-readable: 2024-001
  client_id     UUID NOT NULL REFERENCES clients(id),
  status        order_status NOT NULL DEFAULT 'НОВА',
  order_type    order_type NOT NULL DEFAULT 'стъклопакет',
  deadline      DATE,
  is_urgent     BOOLEAN NOT NULL DEFAULT false,
  sale_price    NUMERIC(10,2),        -- крайна продажна цена
  notes         TEXT,
  delivery_address TEXT,
  source        VARCHAR(30) DEFAULT 'office' CHECK (source IN ('phone','email','office','website','referral','other')),
  created_by    UUID NOT NULL REFERENCES users(id),
  updated_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_deadline ON orders(deadline);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number DESC);

-- ============================================================
-- ORDER ITEMS (products within an order)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_type  VARCHAR(50) NOT NULL,   -- стъклопакет / единично стъкло / etc.
  product_desc  TEXT NOT NULL,          -- full description (e.g. "4-16Ar-4 Low-E")
  width         NUMERIC(8,2),           -- мм
  height        NUMERIC(8,2),           -- мм
  qty           INTEGER NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2),          -- visible only to admin/office
  notes         TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- PRODUCTION STAGES
-- ============================================================
CREATE TYPE stage_status AS ENUM ('ЧАКАЩ','В_ПРОЦЕС','ГОТОВ','ПРОПУСНАТ');

-- Stage definitions per order type
-- стъклопакет:    Рязане, Миене, Сглобяване, Заливане
-- единично_стъкло: Рязане, Шлайфане, Кантиране

CREATE TABLE IF NOT EXISTS production_stages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage_name    VARCHAR(50) NOT NULL,
  stage_order   INTEGER NOT NULL,   -- sequence: 1,2,3...
  status        stage_status NOT NULL DEFAULT 'ЧАКАЩ',
  assigned_to   UUID REFERENCES users(id),
  machine_id    UUID REFERENCES machines(id),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prod_stages_order ON production_stages(order_id);
CREATE INDEX idx_prod_stages_status ON production_stages(status);
CREATE INDEX idx_prod_stages_assigned ON production_stages(assigned_to);

-- ============================================================
-- LABOR LOGS (кой колко часа е работил по поръчка/етап)
-- ============================================================
CREATE TABLE IF NOT EXISTS labor_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage_id    UUID REFERENCES production_stages(id),
  worker_id   UUID NOT NULL REFERENCES users(id),
  minutes     INTEGER NOT NULL CHECK (minutes > 0),
  hourly_rate NUMERIC(8,2) NOT NULL DEFAULT 0,  -- snapshot at time of log
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes       TEXT
);

CREATE INDEX idx_labor_order ON labor_logs(order_id);
CREATE INDEX idx_labor_worker ON labor_logs(worker_id);

-- ============================================================
-- MATERIALS (склад — материален каталог)
-- ============================================================
CREATE TYPE material_category AS ENUM (
  'стъкло',
  'дистанционна_рамка',
  'уплътнител',
  'консуматив',
  'химия',
  'инструмент',
  'друго'
);

CREATE TABLE IF NOT EXISTS materials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(200) NOT NULL,
  code            VARCHAR(50) UNIQUE,    -- вътрешен код
  category        material_category NOT NULL DEFAULT 'друго',
  unit            VARCHAR(20) NOT NULL,  -- м², м, кг, бр, л
  price_per_unit  NUMERIC(10,4) NOT NULL DEFAULT 0,
  description     TEXT,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_name ON materials USING gin(name gin_trgm_ops);
CREATE INDEX idx_materials_category ON materials(category);

-- ============================================================
-- STORAGE LOCATIONS (~20 места)
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- ============================================================
-- STOCK (наличности)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id   UUID NOT NULL REFERENCES materials(id),
  location_id   UUID NOT NULL REFERENCES locations(id),
  quantity      NUMERIC(12,4) NOT NULL DEFAULT 0,
  min_threshold NUMERIC(12,4) NOT NULL DEFAULT 0,  -- alert threshold
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(material_id, location_id)
);

CREATE INDEX idx_stock_material ON stock(material_id);
CREATE INDEX idx_stock_location ON stock(location_id);

-- ============================================================
-- STOCK MOVEMENTS (входящи / изходящи)
-- ============================================================
CREATE TYPE movement_type AS ENUM (
  'ПОЛУЧЕНО',    -- доставка от доставчик
  'ИЗПИСАНО',    -- изписано към поръчка
  'ВЪРНАТО',     -- върнато от поръчка
  'КОРЕКЦИЯ',    -- ревизия
  'БРАК'         -- брак на материал
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id   UUID NOT NULL REFERENCES materials(id),
  location_id   UUID REFERENCES locations(id),
  order_id      UUID REFERENCES orders(id),
  movement_type movement_type NOT NULL,
  quantity      NUMERIC(12,4) NOT NULL,  -- positive = in, negative = out
  unit_price    NUMERIC(10,4) NOT NULL DEFAULT 0,
  total_value   NUMERIC(12,2) GENERATED ALWAYS AS (ABS(quantity) * unit_price) STORED,
  worker_id     UUID NOT NULL REFERENCES users(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_material ON stock_movements(material_id);
CREATE INDEX idx_movements_order ON stock_movements(order_id);
CREATE INDEX idx_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_movements_created ON stock_movements(created_at DESC);

-- ============================================================
-- ORDER COSTS (себестойност — натрупва се в реално време)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_costs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  material_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  labor_cost      NUMERIC(10,2) NOT NULL DEFAULT 0,
  machine_cost    NUMERIC(10,2) NOT NULL DEFAULT 0,
  overhead_pct    NUMERIC(5,2) NOT NULL DEFAULT 15.0,  -- % overhead
  overhead_cost   NUMERIC(10,2) GENERATED ALWAYS AS (
    ROUND((material_cost + labor_cost + machine_cost) * overhead_pct / 100, 2)
  ) STORED,
  total_cost      NUMERIC(10,2) GENERATED ALWAYS AS (
    material_cost + labor_cost + machine_cost +
    ROUND((material_cost + labor_cost + machine_cost) * overhead_pct / 100, 2)
  ) STORED,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEFECTS / БРАК
-- ============================================================
CREATE TYPE defect_cause AS ENUM (
  'машинна_грешка',
  'човешка_грешка',
  'дефект_материал',
  'грешка_размер',
  'транспортна_повреда',
  'друго'
);

CREATE TYPE defect_decision AS ENUM (
  'преработка',   -- remake
  'отписване'     -- write off
);

CREATE TABLE IF NOT EXISTS defects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  stage_id      UUID REFERENCES production_stages(id),
  worker_id     UUID NOT NULL REFERENCES users(id),
  machine_id    UUID REFERENCES machines(id),
  cause_type    defect_cause NOT NULL,
  cause_notes   TEXT,
  material_cost NUMERIC(10,2) NOT NULL DEFAULT 0,  -- auto-calculated
  labor_cost    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost    NUMERIC(10,2) GENERATED ALWAYS AS (material_cost + labor_cost) STORED,
  decision      defect_decision,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES users(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_defects_order ON defects(order_id);
CREATE INDEX idx_defects_worker ON defects(worker_id);
CREATE INDEX idx_defects_machine ON defects(machine_id);
CREATE INDEX idx_defects_created ON defects(created_at DESC);

-- ============================================================
-- MACHINE MAINTENANCE LOG
-- ============================================================
CREATE TYPE maintenance_type AS ENUM (
  'профилактика',
  'ремонт',
  'смяна_части',
  'калибриране',
  'почистване'
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id    UUID NOT NULL REFERENCES machines(id),
  maintenance_type maintenance_type NOT NULL,
  performed_by  VARCHAR(100),    -- could be external technician
  worker_id     UUID REFERENCES users(id),
  cost          NUMERIC(10,2) DEFAULT 0,
  notes         TEXT NOT NULL,
  performed_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  next_service  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maint_machine ON maintenance_logs(machine_id);
CREATE INDEX idx_maint_date ON maintenance_logs(performed_at DESC);

-- ============================================================
-- ORDER FILES (чертежи, документи)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  filepath      TEXT NOT NULL,
  mime_type     VARCHAR(100),
  file_size     INTEGER,
  uploaded_by   UUID NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_order ON order_files(order_id);

-- ============================================================
-- AUDIT LOG (кой какво е направил)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  table_name  VARCHAR(50),
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_record ON audit_log(table_name, record_id);

-- ============================================================
-- HELPER FUNCTION: update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_materials_updated BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stock_updated BEFORE UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
