-- =============================================
-- CONSOLIDATED DATABASE SCHEMA - Coach Dashboard
-- Generated from full_setup.sql + migrations 002-030
-- Run this ONCE in the new Supabase project's SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: coaches (dashboard users)
-- =============================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coach', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: clients
-- =============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/Mexico_City',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  is_renewed BOOLEAN NOT NULL DEFAULT false,
  is_success_case BOOLEAN NOT NULL DEFAULT false,
  plan_type TEXT DEFAULT '3_months',
  start_date DATE NOT NULL,
  end_date DATE,
  renewal_date DATE,
  current_phase INTEGER DEFAULT 1 CHECK (current_phase IN (1, 2, 3)),
  phase_change_date DATE,
  closer TEXT,
  drive_folder_url TEXT,
  onboarding_trainingpeaks BOOLEAN DEFAULT FALSE,
  onboarding_whatsapp_group BOOLEAN DEFAULT FALSE,
  onboarding_community_group BOOLEAN DEFAULT FALSE,
  onboarding_initial_audit BOOLEAN DEFAULT FALSE,
  onboarding_meal_plan_sent BOOLEAN DEFAULT FALSE,
  custom_phase_duration_days INTEGER,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  onboarding_response_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Profile fields
  birth_date DATE,
  height_cm INTEGER,
  initial_weight_kg DECIMAL,
  initial_body_fat_pct DECIMAL,
  location TEXT,
  training_level TEXT,
  motivation TEXT,
  medical_notes TEXT,
  goals TEXT,
  diagnosis TEXT,
  diagnosis_detail TEXT,
  has_event BOOLEAN DEFAULT FALSE,
  event_name TEXT,
  event_date DATE,

  -- Auditoria Inicial fields
  wake_time TEXT,
  bed_time TEXT,
  sleep_hours_avg DECIMAL,
  sleep_quality_initial INTEGER,
  wakes_at_night BOOLEAN,
  feels_rested BOOLEAN,
  occupation TEXT,
  work_schedule TEXT,
  work_modality TEXT,
  work_activity_level TEXT,
  training_days_per_week INTEGER,
  training_time TEXT,
  training_location TEXT,
  training_cardio TEXT,
  trains_fasted BOOLEAN,
  training_notes TEXT,
  meals_per_day TEXT,
  first_meal_time TEXT,
  dinner_time TEXT,
  night_hunger BOOLEAN,
  coffee_intake TEXT,
  food_intolerances TEXT,
  energy_level_initial INTEGER,
  stress_level_initial INTEGER,
  energy_dips TEXT,
  onboarding_notes TEXT,
  onboarding_submitted_at TIMESTAMPTZ,
  initial_photo_url TEXT
);

-- =============================================
-- TABLE: check_ins
-- =============================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ NOT NULL,
  typeform_response_id TEXT UNIQUE,
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  waist_measurement DECIMAL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  nutrition_adherence INTEGER CHECK (nutrition_adherence BETWEEN 1 AND 10),
  training_adherence INTEGER CHECK (training_adherence BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Extended check-in fields (Typeform integration)
  phase TEXT,
  daily_energy TEXT,
  cravings BOOLEAN,
  craving_details TEXT,
  digestion TEXT,
  difficulties TEXT,
  carb_performance TEXT,
  carb_sensation TEXT,
  post_carb_symptoms TEXT,
  carb_strategy TEXT,
  loss_of_control BOOLEAN,
  loss_of_control_detail TEXT,
  protocol_adherence TEXT,
  unused_optimizers TEXT,
  unused_supplements TEXT,
  main_limiter TEXT,
  priority_objective TEXT,
  sleep_hours TEXT
);

-- =============================================
-- TABLE: calls
-- =============================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  call_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  notes TEXT,
  transcript TEXT,
  google_event_id TEXT,
  meet_link TEXT,
  coach_actions TEXT,
  coach_actions_completed BOOLEAN NOT NULL DEFAULT false,
  coach_actions_completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  calendly_event_uri TEXT,
  scheduled_at TIMESTAMPTZ,
  transcript_summary TEXT,
  positive_highlights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN calls.transcript_summary IS 'Brief AI-generated summary of the call transcript for quick context';
COMMENT ON COLUMN calls.positive_highlights IS 'AI-extracted positive highlights from the call for WhatsApp follow-up';

-- =============================================
-- TABLE: training_plans
-- =============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  plan_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: alerts
-- =============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'missed_checkin', 'phase_change', 'renewal_approaching',
    'training_plan_expiring', 'no_call_logged', 'onboarding_incomplete',
    'program_ending', 'birthday', 'upcoming_call', 'manual'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: resources
-- =============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_coach ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_onboarding_response ON clients(onboarding_response_id) WHERE onboarding_response_id IS NOT NULL;

-- check_ins
CREATE INDEX IF NOT EXISTS idx_check_ins_client ON check_ins(client_id, submitted_at DESC);

-- calls
CREATE INDEX IF NOT EXISTS idx_calls_client ON calls(client_id, call_date DESC);
CREATE INDEX IF NOT EXISTS idx_calls_coach ON calls(coach_id);
CREATE INDEX IF NOT EXISTS idx_calls_date ON calls(call_date);
CREATE INDEX IF NOT EXISTS idx_calls_scheduled ON calls(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_calls_google_event ON calls(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calls_pending_coach_actions ON calls(client_id) WHERE coach_actions IS NOT NULL AND coach_actions_completed = false;

-- alerts
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(is_resolved, severity) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_alerts_client ON alerts(client_id);

-- training_plans
CREATE INDEX IF NOT EXISTS idx_training_plans_client ON training_plans(client_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-calculate phase_change_date (supports custom duration and indefinite)
CREATE OR REPLACE FUNCTION calculate_phase_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_phase_duration_days = -1 THEN
    -- Indefinite: no automatic phase change
    NEW.phase_change_date := NULL;
  ELSIF NEW.custom_phase_duration_days IS NOT NULL AND NEW.custom_phase_duration_days > 0 THEN
    -- Custom interval: phase_change_date = today + custom days
    NEW.phase_change_date := CURRENT_DATE + (NEW.custom_phase_duration_days * INTERVAL '1 day');
  ELSIF NEW.current_phase = 1 THEN
    -- Phase 1: 7 days from start
    NEW.phase_change_date := NEW.start_date + INTERVAL '7 days';
  ELSIF NEW.current_phase = 2 THEN
    -- Phase 2: 30 days after Phase 1 ends (day 7 + 30 = day 37)
    NEW.phase_change_date := NEW.start_date + INTERVAL '37 days';
  ELSE
    -- Phase 3: ends at day 90
    NEW.phase_change_date := NEW.start_date + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optimized latest check-in per client (avoids full table scan)
CREATE OR REPLACE FUNCTION get_latest_checkin_per_client()
RETURNS TABLE(client_id UUID, latest_submitted_at TIMESTAMPTZ) AS $$
  SELECT DISTINCT ON (client_id) client_id, submitted_at AS latest_submitted_at
  FROM check_ins
  ORDER BY client_id, submitted_at DESC
$$ LANGUAGE SQL STABLE;

-- Atomic coach action toggle (prevents race conditions)
CREATE OR REPLACE FUNCTION toggle_coach_action_item(
  p_call_id UUID,
  p_item_index INT,
  p_completed BOOLEAN
) RETURNS JSONB AS $$
DECLARE
  v_items INT[];
  v_total INT;
  v_all_completed BOOLEAN;
  v_actions TEXT;
BEGIN
  SELECT
    COALESCE(coach_actions_completed_items, '{}'),
    COALESCE(coach_actions, '')
  INTO v_items, v_actions
  FROM calls WHERE id = p_call_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Call not found');
  END IF;

  IF p_completed THEN
    IF NOT (p_item_index = ANY(v_items)) THEN
      v_items := array_append(v_items, p_item_index);
    END IF;
  ELSE
    v_items := array_remove(v_items, p_item_index);
  END IF;

  -- Count non-empty action lines
  SELECT COUNT(*) INTO v_total
  FROM unnest(regexp_split_to_array(trim(v_actions), E'\n')) AS line
  WHERE trim(line) <> '';

  v_all_completed := v_total > 0 AND array_length(v_items, 1) >= v_total;

  UPDATE calls SET
    coach_actions_completed_items = v_items,
    coach_actions_completed = v_all_completed
  WHERE id = p_call_id;

  RETURN jsonb_build_object(
    'allCompleted', v_all_completed,
    'items', to_jsonb(v_items)
  );
END;
$$ LANGUAGE plpgsql;

-- Mark coach actions as completed (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION complete_coach_actions(call_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE calls
  SET coach_actions_completed = true
  WHERE id = call_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================
DROP TRIGGER IF EXISTS trigger_phase_change ON clients;
CREATE TRIGGER trigger_phase_change
  BEFORE INSERT OR UPDATE OF current_phase ON clients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_phase_change();

DROP TRIGGER IF EXISTS trigger_updated_at ON clients;
CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: Authenticated users (dashboard)
-- =============================================

-- clients
CREATE POLICY "Authenticated users can read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE TO authenticated USING (true);

-- check_ins
CREATE POLICY "Authenticated users can read check_ins" ON check_ins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert check_ins" ON check_ins FOR INSERT TO authenticated WITH CHECK (true);

-- calls
CREATE POLICY "Authenticated users can read calls" ON calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert calls" ON calls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update calls" ON calls FOR UPDATE TO authenticated USING (true);

-- training_plans
CREATE POLICY "Authenticated users can read training_plans" ON training_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert training_plans" ON training_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update training_plans" ON training_plans FOR UPDATE TO authenticated USING (true);

-- alerts
CREATE POLICY "Authenticated users can read alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON alerts FOR UPDATE TO authenticated USING (true);

-- coaches (all authenticated users can read all coaches)
CREATE POLICY "Authenticated users can read coaches" ON coaches FOR SELECT TO authenticated USING (true);

-- resources (full CRUD for authenticated)
CREATE POLICY "Authenticated users can read resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert resources" ON resources FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update resources" ON resources FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete resources" ON resources FOR DELETE TO authenticated USING (true);

-- =============================================
-- RLS POLICIES: Service role (webhooks / cron)
-- =============================================
CREATE POLICY "Service role can insert clients" ON clients FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update clients" ON clients FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role can read clients" ON clients FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role can insert check_ins" ON check_ins FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert alerts" ON alerts FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update alerts" ON alerts FOR UPDATE TO service_role USING (true);

-- =============================================
-- STORAGE: client-photos bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-photos', 'client-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read access for client photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-photos');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-photos');

-- Service role can upload (for webhooks)
CREATE POLICY "Service role can upload photos"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'client-photos');

-- Service role can delete photos
CREATE POLICY "Service role can delete photos"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'client-photos');
