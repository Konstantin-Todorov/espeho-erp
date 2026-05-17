-- Allow free-text order types and defect causes (remove ENUM constraints)
ALTER TABLE orders ALTER COLUMN order_type TYPE TEXT;
ALTER TABLE defects ALTER COLUMN cause_type TYPE TEXT;
