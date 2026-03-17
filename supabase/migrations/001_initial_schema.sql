-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: coaches (dashboard users)
CREATE TABLE coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coach', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/Mexico_City',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'success_case')),
  plan_type TEXT DEFAULT '3_months',
  start_date DATE NOT NULL,
  end_date DATE GENERATED ALWAYS AS (start_date + INTERVAL '90 days') STORED,
  renewal_date DATE GENERATED ALWAYS AS (start_date + INTERVAL '75 days') STORED,
  current_phase INTEGER DEFAULT 1 CHECK (current_phase IN (1, 2, 3)),
  phase_change_date DATE,
  closer TEXT,
  drive_folder_url TEXT,
  onboarding_trainingpeaks BOOLEAN DEFAULT FALSE,
  onboarding_whatsapp_group BOOLEAN DEFAULT FALSE,
  onboarding_community_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: check_ins
CREATE TABLE check_ins (
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
  notes TEXT,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  call_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: training_plans
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  plan_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'missed_checkin', 'phase_change', 'renewal_approaching',
    'training_plan_expiring', 'no_call_logged', 'onboarding_incomplete', 'program_ending'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_check_ins_client ON check_ins(client_id, submitted_at DESC);
CREATE INDEX idx_calls_client ON calls(client_id, call_date DESC);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved, severity) WHERE is_resolved = FALSE;
CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_training_plans_client ON training_plans(client_id);

-- Trigger: auto-calculate phase_change_date
CREATE OR REPLACE FUNCTION calculate_phase_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_phase = 1 THEN
    NEW.phase_change_date := NEW.start_date + INTERVAL '7 days';
  ELSIF NEW.current_phase = 2 THEN
    NEW.phase_change_date := NEW.start_date + INTERVAL '35 days';
  ELSE
    NEW.phase_change_date := NEW.start_date + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_phase_change
  BEFORE INSERT OR UPDATE OF current_phase ON clients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_phase_change();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Policies: coaches can read all data (authenticated users)
CREATE POLICY "Authenticated users can read clients" ON clients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert clients" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update clients" ON clients
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read check_ins" ON check_ins
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert check_ins" ON check_ins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read calls" ON calls
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert calls" ON calls
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read training_plans" ON training_plans
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert training_plans" ON training_plans
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update training_plans" ON training_plans
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read alerts" ON alerts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update alerts" ON alerts
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON alerts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Coaches can read own profile" ON coaches
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Service role policy for webhooks (typeform inserts check-ins)
CREATE POLICY "Service role can insert check_ins" ON check_ins
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can insert alerts" ON alerts
  FOR INSERT TO service_role WITH CHECK (true);
