-- Disable RLS or add policies to allow anonymous/public access
-- This allows the static admin user to work without authentication

-- Option 1: Disable RLS entirely (simpler for development)
ALTER TABLE public.patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS but allow access, uncomment the following:
-- (These policies allow anyone to access data, essentially bypassing RLS while keeping it enabled)
/*
-- Patient profiles - allow all operations
CREATE POLICY "Allow public access to patient_profiles"
  ON public.patient_profiles FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Prescriptions - allow all operations
CREATE POLICY "Allow public access to prescriptions"
  ON public.prescriptions FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Medications - allow all operations
CREATE POLICY "Allow public access to medications"
  ON public.medications FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Medication schedules - allow all operations
CREATE POLICY "Allow public access to medication_schedules"
  ON public.medication_schedules FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Health vitals - allow all operations
CREATE POLICY "Allow public access to health_vitals"
  ON public.health_vitals FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Health alerts - allow all operations
CREATE POLICY "Allow public access to health_alerts"
  ON public.health_alerts FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Drug interactions - allow all operations
CREATE POLICY "Allow public access to drug_interactions"
  ON public.drug_interactions FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Caregivers - allow all operations
CREATE POLICY "Allow public access to caregivers"
  ON public.caregivers FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
*/

