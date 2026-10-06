-- 014: remove the demo machines, materials, stock and storage locations created by the first seed
-- (17.05.2026). Real records created later are kept. Supplier orders entered by the client keep their
-- lines (only the link to the demo material is cleared).

-- Demo materials / machines = created by the seed, before the system went live with real data
CREATE TEMP TABLE _demo_materials ON COMMIT DROP AS
  SELECT id FROM materials WHERE created_at < '2026-05-18';
CREATE TEMP TABLE _demo_machines ON COMMIT DROP AS
  SELECT id FROM machines WHERE created_at < '2026-05-18';

UPDATE purchase_order_items SET material_id = NULL WHERE material_id IN (SELECT id FROM _demo_materials);
UPDATE production_stages SET machine_id = NULL WHERE machine_id IN (SELECT id FROM _demo_machines);
UPDATE defects SET machine_id = NULL WHERE machine_id IN (SELECT id FROM _demo_machines);

DELETE FROM stock_movements WHERE material_id IN (SELECT id FROM _demo_materials);
DELETE FROM stock WHERE material_id IN (SELECT id FROM _demo_materials);
DELETE FROM materials WHERE id IN (SELECT id FROM _demo_materials);

DELETE FROM maintenance_logs WHERE machine_id IN (SELECT id FROM _demo_machines);
DELETE FROM machines WHERE id IN (SELECT id FROM _demo_machines);

-- Demo storage locations that nothing points to any more
DELETE FROM locations l
 WHERE NOT EXISTS (SELECT 1 FROM stock s WHERE s.location_id = l.id)
   AND NOT EXISTS (SELECT 1 FROM stock_movements m WHERE m.location_id = l.id);

-- The two real places (editable in Склад)
INSERT INTO locations (name, description) VALUES
  ('Цех — Чепинско шосе 110', 'Основен склад за стъкло и материали'),
  ('Офис — Св. Наум 35', 'Готова продукция и дребни артикули')
ON CONFLICT (name) DO NOTHING;

-- Low-stock notifications about the demo materials
DELETE FROM notifications WHERE type = 'low_stock';
