-- Migration: Make end_date and renewal_date regular columns instead of generated
-- This allows different plan durations (3M, 4M, 6M, 12M) instead of fixed 90/75 days

-- Drop generated columns
ALTER TABLE clients DROP COLUMN IF EXISTS end_date;
ALTER TABLE clients DROP COLUMN IF EXISTS renewal_date;

-- Recreate as regular columns
ALTER TABLE clients ADD COLUMN end_date DATE;
ALTER TABLE clients ADD COLUMN renewal_date DATE;
