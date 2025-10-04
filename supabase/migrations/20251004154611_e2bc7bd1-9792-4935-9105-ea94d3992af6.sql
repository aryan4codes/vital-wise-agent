-- Create enum types for the health monitoring system
CREATE TYPE medication_frequency AS ENUM ('once_daily', 'twice_daily', 'thrice_daily', 'four_times_daily', 'as_needed', 'custom');
CREATE TYPE vital_type AS ENUM ('blood_pressure', 'glucose', 'heart_rate', 'weight', 'temperature', 'oxygen_saturation');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_status AS ENUM ('pending', 'acknowledged', 'resolved');

-- User profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  doctor_name TEXT,
  prescription_date DATE NOT NULL,
  file_url TEXT,
  raw_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending', -- pending, processed, active, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strength TEXT,
  dosage TEXT,
  frequency medication_frequency NOT NULL,
  custom_frequency TEXT, -- for custom schedules
  route TEXT, -- oral, injection, topical, etc.
  duration_days INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  side_effects TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication schedules (individual doses)
CREATE TABLE IF NOT EXISTS public.medication_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, taken, missed, skipped
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health vitals table
CREATE TABLE IF NOT EXISTS public.health_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  vital_type vital_type NOT NULL,
  value NUMERIC NOT NULL,
  secondary_value NUMERIC, -- for blood pressure (diastolic)
  unit TEXT NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  status alert_status NOT NULL DEFAULT 'pending',
  alert_type TEXT, -- medication_missed, vital_abnormal, drug_interaction, etc.
  related_id UUID, -- ID of related medication, vital, etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Drug interactions table
CREATE TABLE IF NOT EXISTS public.drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_a_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  medication_b_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  severity TEXT NOT NULL, -- mild, moderate, severe
  description TEXT,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregivers table
CREATE TABLE IF NOT EXISTS public.caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  caregiver_email TEXT NOT NULL,
  caregiver_name TEXT NOT NULL,
  relationship TEXT,
  access_level TEXT DEFAULT 'view', -- view, manage
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
CREATE POLICY "Users can view own profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for prescriptions
CREATE POLICY "Users can view own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = patient_id);

-- RLS Policies for medications
CREATE POLICY "Users can view own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own medications"
  ON public.medications FOR ALL
  USING (auth.uid() = patient_id);

-- RLS Policies for medication_schedules
CREATE POLICY "Users can view own schedules"
  ON public.medication_schedules FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own schedules"
  ON public.medication_schedules FOR ALL
  USING (auth.uid() = patient_id);

-- RLS Policies for health_vitals
CREATE POLICY "Users can view own vitals"
  ON public.health_vitals FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own vitals"
  ON public.health_vitals FOR ALL
  USING (auth.uid() = patient_id);

-- RLS Policies for health_alerts
CREATE POLICY "Users can view own alerts"
  ON public.health_alerts FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own alerts"
  ON public.health_alerts FOR ALL
  USING (auth.uid() = patient_id);

-- RLS Policies for drug_interactions
CREATE POLICY "Users can view own interactions"
  ON public.drug_interactions FOR SELECT
  USING (auth.uid() = patient_id);

-- RLS Policies for caregivers
CREATE POLICY "Users can view own caregivers"
  ON public.caregivers FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can manage own caregivers"
  ON public.caregivers FOR ALL
  USING (auth.uid() = patient_id);

-- Create indexes for better query performance
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_medications_patient ON public.medications(patient_id);
CREATE INDEX idx_medications_prescription ON public.medications(prescription_id);
CREATE INDEX idx_schedules_patient ON public.medication_schedules(patient_id);
CREATE INDEX idx_schedules_time ON public.medication_schedules(scheduled_time);
CREATE INDEX idx_vitals_patient ON public.health_vitals(patient_id);
CREATE INDEX idx_vitals_type ON public.health_vitals(vital_type, measured_at);
CREATE INDEX idx_alerts_patient ON public.health_alerts(patient_id);
CREATE INDEX idx_alerts_status ON public.health_alerts(status, severity);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON public.medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON public.medication_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();