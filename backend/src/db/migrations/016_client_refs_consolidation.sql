-- 016: "client reference" on orders + consolidation of clients that were really one client with
-- different reference numbers in the spreadsheet (МП 26-3200-0476, АЛДИС-8676, ДН СТИЛ 2096,
-- СЛАТИНА БЛ.246-ЕТАП 1 …). Old names are kept as aliases so later imports map to the same client.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_ref VARCHAR(80);  -- номер/референция на клиента (негова поръчка, обект, етап)
CREATE INDEX IF NOT EXISTS idx_orders_client_ref ON orders (client_ref);

CREATE TEMP TABLE _consolidate (old_id UUID, old_name TEXT, target TEXT, ref TEXT) ON COMMIT DROP;

INSERT INTO _consolidate
SELECT id, name, 'МП', NULLIF(TRIM(REGEXP_REPLACE(name, '^МП[\s-]*', '')), '')
  FROM clients WHERE name ~ '^МП[\s-]*[0-9]';

INSERT INTO _consolidate
SELECT id, name, 'АЛДИС', NULLIF(TRIM(REGEXP_REPLACE(name, '^АЛДИС[\s-]*', '')), '')
  FROM clients WHERE name ~ '^АЛДИС[\s-]+\S' ;

INSERT INTO _consolidate
SELECT id, name, 'ДН СТИЛ', NULLIF(TRIM(REGEXP_REPLACE(name, '^(ДН|Д\.Н\.)\s*СТИЛ[\s-]*', '')), '')
  FROM clients WHERE name ~ '^(ДН|Д\.Н\.)\s*СТИЛ' AND name <> 'ДН СТИЛ';

INSERT INTO _consolidate
SELECT id, name, 'ОБЕКТ СЛАТИНА БЛ.246',
       NULLIF(TRIM(REGEXP_REPLACE(REGEXP_REPLACE(name, '^(КЪМ\s+)?(ОБЕКТ\s+)?(СЛАТИНА|СЛ\.)\s*(БЛ\.246)?[\s-]*', ''), '^-', '')), '')
  FROM clients WHERE name ~ '(СЛАТИНА|^СЛ\.БЛ\.246)';

-- Target clients (create the ones that don't exist yet)
INSERT INTO clients (name, source, notes)
SELECT DISTINCT c.target, 'office',
       CASE c.target
         WHEN 'МП' THEN 'Обединени поръчки с номера „МП …“ — номерът е в „Реф. на клиента“. Уточнете пълното име на фирмата.'
         WHEN 'ОБЕКТ СЛАТИНА БЛ.246' THEN 'Строителен обект — етапи и апартаменти са в „Реф. на клиента“.'
         ELSE 'Обединени поръчки — номерът на клиента е в „Реф. на клиента“.' END
  FROM _consolidate c
 WHERE NOT EXISTS (SELECT 1 FROM clients x WHERE x.name = c.target);

-- Move the orders and keep the number as the client's reference
UPDATE orders o SET client_id = t.id, client_ref = COALESCE(o.client_ref, c.ref)
  FROM _consolidate c JOIN clients t ON t.name = c.target
 WHERE o.client_id = c.old_id;
UPDATE quotations q SET client_id = t.id
  FROM _consolidate c JOIN clients t ON t.name = c.target
 WHERE q.client_id = c.old_id;

-- Remember the old names, then remove the now-empty duplicates (only plain imported ones)
INSERT INTO client_aliases (name_key, client_id)
SELECT c.old_name, t.id FROM _consolidate c JOIN clients t ON t.name = c.target
ON CONFLICT (name_key) DO UPDATE SET client_id = EXCLUDED.client_id;
UPDATE client_aliases a SET client_id = t.id
  FROM _consolidate c JOIN clients t ON t.name = c.target WHERE a.client_id = c.old_id;

DELETE FROM clients x USING _consolidate c
 WHERE x.id = c.old_id
   AND x.eik IS NULL AND x.phone IS NULL AND x.email IS NULL
   AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.client_id = x.id)
   AND NOT EXISTS (SELECT 1 FROM quotations q WHERE q.client_id = x.id);
