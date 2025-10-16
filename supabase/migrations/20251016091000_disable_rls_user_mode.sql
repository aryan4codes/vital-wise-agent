-- Disable RLS for app-managed auth mode
ALTER TABLE public.patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers DISABLE ROW LEVEL SECURITY;

-- Optional: create permissive policies instead of disabling RLS entirely
-- Uncomment to allow all access while keeping RLS enabled
--
-- ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "allow_all_prescriptions" ON public.prescriptions;
-- CREATE POLICY "allow_all_prescriptions" ON public.prescriptions FOR ALL TO anon USING (true) WITH CHECK (true);

