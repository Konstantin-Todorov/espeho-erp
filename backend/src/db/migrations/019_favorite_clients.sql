-- 019: favorite (key) clients — shown first in client pickers, quick search and lists.
-- Shared by the whole office; the 8 biggest clients of the year are pre-marked and can be changed any time.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_clients_favorite ON clients (is_favorite) WHERE is_favorite;

UPDATE clients SET is_favorite = true WHERE id IN (
  SELECT c.id FROM clients c JOIN orders o ON o.client_id = c.id
   WHERE c.name <> 'КЛИЕНТ НА МЯСТО (БЕЗ ИМЕ)' AND o.order_category = 'нормална'
   GROUP BY c.id ORDER BY SUM(o.sale_price) DESC LIMIT 8)
  AND NOT EXISTS (SELECT 1 FROM clients WHERE is_favorite);
