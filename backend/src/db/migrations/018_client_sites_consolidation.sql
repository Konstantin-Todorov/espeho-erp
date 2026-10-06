-- 018: sites / stages / branches that were written as separate clients ("ВАЛМАН-ЕТАП 1",
-- "ДИЕМКЕЙ-КОЙНАРЕ", "КЮПИ-СОФИЯ" …) are moved to their client; the difference in the name
-- becomes the order's client reference. Only the clear cases — people sharing a first name are untouched.
CREATE TEMP TABLE _sites (old_name TEXT, target TEXT) ON COMMIT DROP;
INSERT INTO _sites VALUES
  ('ВАЛМАН-73 ОУ','ВАЛМАН'), ('ВАЛМАН-ЕТАП 1','ВАЛМАН'), ('ВАЛМАН-ЕТАП 2','ВАЛМАН'),
  ('ВИЕНВИ-ЕТ.3','ВИЕНВИ'), ('ВИЕНВИ-ЕТ.4','ВИЕНВИ'), ('ВИЕНВИ-ЕТ.5','ВИЕНВИ'),
  ('ДИЕМКЕЙ-КОЙНАРЕ','ДИЕМКЕЙ'), ('ДИЕМКЕЙ ПОБИТ КАМЪК','ДИЕМКЕЙ'), ('ДИЕМКЕЙ-РАВНО ПОЛЕ','ДИЕМКЕЙ'),
  ('ДИЕМКЕЙ СТ.ГРАД','ДИЕМКЕЙ'), ('ДИЕМКЕЙ-СТ.ГРАД','ДИЕМКЕЙ'), ('ДИ ЕМ КЕЙ','ДИЕМКЕЙ'),
  ('КЮПИ ВАРНА','КЮПИ'), ('КЮПИ-КАРЛОВО','КЮПИ'), ('КЮПИ-ПАЗАРДЖИК','КЮПИ'), ('КЮПИ-РУСЕ','КЮПИ'), ('КЮПИ-СОФИЯ','КЮПИ'),
  ('ТИМБОПАРК-1','ТИМБОПАРК'), ('ТИМБОПАРК-3','ТИМБОПАРК'), ('ТИМБОПАРК-4','ТИМБОПАРК'),
  ('ИНТЕРБИЛД ЛОМСКО','ИНТЕРБИЛД'), ('ИНТЕРБИЛД ЛОМСКО ШОСЕ','ИНТЕРБИЛД'),
  ('КАДА ПЛАСТ-ЦЕРБ','КАДА ПЛАСТ'),
  ('БОЯРТ-84475','БОЯРТ'), ('БОЯРТ-АЙ ЕМ ЕС','БОЯРТ'),
  ('АЛЕМАР ОТ КН','АЛЕМАР'),
  ('МЕТАЛ 22 КАРЛОВО','МЕТАЛ 22'),
  ('ДИДО АСТЕРА/АНДРЕЙЧО','ДИДО АСТЕРА');

-- Only pairs where both clients exist
DELETE FROM _sites s WHERE NOT EXISTS (SELECT 1 FROM clients WHERE name = s.old_name)
                        OR NOT EXISTS (SELECT 1 FROM clients WHERE name = s.target);

UPDATE orders o SET
  client_id = t.id,
  client_ref = COALESCE(o.client_ref, NULLIF(TRIM(BOTH ' -./' FROM
    CASE WHEN s.old_name LIKE s.target || '%' THEN SUBSTRING(s.old_name FROM LENGTH(s.target) + 1) ELSE s.old_name END), ''))
FROM _sites s JOIN clients x ON x.name = s.old_name JOIN clients t ON t.name = s.target
WHERE o.client_id = x.id;

-- A spelling variant is not a site — no reference for it
UPDATE orders SET client_ref = NULL WHERE client_ref = 'ДИ ЕМ КЕЙ';

UPDATE quotations q SET client_id = t.id
  FROM _sites s JOIN clients x ON x.name = s.old_name JOIN clients t ON t.name = s.target
 WHERE q.client_id = x.id;

INSERT INTO client_aliases (name_key, client_id)
SELECT s.old_name, t.id FROM _sites s JOIN clients t ON t.name = s.target
ON CONFLICT (name_key) DO UPDATE SET client_id = EXCLUDED.client_id;
UPDATE client_aliases a SET client_id = t.id
  FROM _sites s JOIN clients x ON x.name = s.old_name JOIN clients t ON t.name = s.target
 WHERE a.client_id = x.id;

-- Register proposals made for the removed names are no longer relevant
DELETE FROM client_registry_suggestions WHERE client_id IN (SELECT x.id FROM _sites s JOIN clients x ON x.name = s.old_name);

DELETE FROM clients x USING _sites s
 WHERE x.name = s.old_name AND x.eik IS NULL AND x.phone IS NULL
   AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.client_id = x.id)
   AND NOT EXISTS (SELECT 1 FROM quotations q WHERE q.client_id = x.id);
