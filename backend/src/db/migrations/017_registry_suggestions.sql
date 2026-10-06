-- 017: proposed Търговски регистър matches for existing clients, waiting for the office to confirm
CREATE TABLE IF NOT EXISTS client_registry_suggestions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  confidence  VARCHAR(10) NOT NULL CHECK (confidence IN ('high','medium','low','none')),
  reason      TEXT,                     -- why this match was proposed
  candidate   JSONB,                    -- the proposed record (ЕИК, name, address, МОЛ, ДДС…)
  alternatives JSONB,                   -- other companies with the same name
  status      VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  decided_by  UUID REFERENCES users(id),
  decided_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id)
);
