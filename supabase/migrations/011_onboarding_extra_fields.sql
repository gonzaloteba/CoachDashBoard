-- Add two new onboarding checklist fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_initial_audit BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_meal_plan_sent BOOLEAN DEFAULT FALSE;
