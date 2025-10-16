

CREATE TABLE public.caregivers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  caregiver_email text NOT NULL,
  caregiver_name text NOT NULL,
  relationship text,
  access_level text DEFAULT 'view'::text,
  invited_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT caregivers_pkey PRIMARY KEY (id),
  CONSTRAINT caregivers_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.drug_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  medication_a_id uuid NOT NULL,
  medication_b_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  severity text NOT NULL,
  description text,
  recommendation text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT drug_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT drug_interactions_medication_a_id_fkey FOREIGN KEY (medication_a_id) REFERENCES public.medications(id),
  CONSTRAINT drug_interactions_medication_b_id_fkey FOREIGN KEY (medication_b_id) REFERENCES public.medications(id),
  CONSTRAINT drug_interactions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.health_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity USER-DEFINED NOT NULL DEFAULT 'info'::alert_severity,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::alert_status,
  alert_type text,
  related_id uuid,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  acknowledged_at timestamp with time zone,
  resolved_at timestamp with time zone,
  CONSTRAINT health_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT health_alerts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.health_vitals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  vital_type USER-DEFINED NOT NULL,
  value numeric NOT NULL,
  secondary_value numeric,
  unit text NOT NULL,
  measured_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT health_vitals_pkey PRIMARY KEY (id),
  CONSTRAINT health_vitals_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);


CREATE TABLE public.medication_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  scheduled_time timestamp with time zone NOT NULL,
  actual_time timestamp with time zone,
  status text DEFAULT 'pending'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medication_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT medication_schedules_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(id),
  CONSTRAINT medication_schedules_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.medications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  prescription_id uuid,
  patient_id uuid NOT NULL,
  name text NOT NULL,
  strength text,
  dosage text,
  frequency USER-DEFINED NOT NULL,
  custom_frequency text,
  route text,
  duration_days integer,
  start_date date NOT NULL,
  end_date date,
  instructions text,
  side_effects ARRAY,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medications_pkey PRIMARY KEY (id),
  CONSTRAINT medications_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id),
  CONSTRAINT medications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);
CREATE TABLE public.patient_profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  date_of_birth date,
  phone text,
  emergency_contact text,
  emergency_phone text,
  preferred_language text DEFAULT 'en'::text,
  timezone text DEFAULT 'UTC'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT patient_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.prescriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_name text,
  prescription_date date NOT NULL,
  file_url text,
  raw_text text,
  parsed_data jsonb,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
  CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id)
);