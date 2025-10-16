-- Create application-managed users table and repoint foreign keys
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Repoint patient_profiles.id foreign key from auth.users to app_users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'patient_profiles_id_fkey'
  ) THEN
    ALTER TABLE public.patient_profiles DROP CONSTRAINT patient_profiles_id_fkey;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- table might not exist yet in some envs; ignore
  NULL;
END $$;

ALTER TABLE public.patient_profiles
  ADD CONSTRAINT patient_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES public.app_users(id);


