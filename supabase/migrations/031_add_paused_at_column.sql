-- Add paused_at column to track when a client was paused
-- Used to calculate paused days and extend end_date on reactivation
ALTER TABLE clients ADD COLUMN IF NOT EXISTS paused_at DATE;
