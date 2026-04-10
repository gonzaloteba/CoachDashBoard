-- =============================================
-- Add 'manual' to alerts.type check constraint
-- =============================================

ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_type_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_type_check CHECK (type IN (
  'missed_checkin', 'phase_change', 'renewal_approaching',
  'training_plan_expiring', 'no_call_logged', 'onboarding_incomplete',
  'program_ending', 'birthday', 'upcoming_call', 'manual'
));
