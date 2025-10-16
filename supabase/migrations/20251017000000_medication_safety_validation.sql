-- Create medication_safety_validations table to store validation history
CREATE TABLE IF NOT EXISTS public.medication_safety_validations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  is_safe boolean NOT NULL,
  overall_risk_level text NOT NULL CHECK (overall_risk_level IN ('safe', 'caution', 'warning', 'critical')),
  validation_method text NOT NULL CHECK (validation_method IN ('ai_clinical_nlp', 'rule_based', 'hybrid')),
  summary text,
  validated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medication_safety_validations_pkey PRIMARY KEY (id),
  CONSTRAINT medication_safety_validations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE
);

-- Create validation_flags table to store individual safety concerns
CREATE TABLE IF NOT EXISTS public.validation_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  validation_id uuid NOT NULL,
  medication_id uuid,
  medication_name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  category text NOT NULL CHECK (category IN ('dosage', 'age', 'interaction', 'contraindication', 'duration', 'frequency')),
  title text NOT NULL,
  description text NOT NULL,
  recommendation text NOT NULL,
  requires_physician_review boolean NOT NULL DEFAULT false,
  references text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT validation_flags_pkey PRIMARY KEY (id),
  CONSTRAINT validation_flags_validation_id_fkey FOREIGN KEY (validation_id) REFERENCES public.medication_safety_validations(id) ON DELETE CASCADE,
  CONSTRAINT validation_flags_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_medication_safety_validations_patient_id 
  ON public.medication_safety_validations(patient_id);

CREATE INDEX IF NOT EXISTS idx_medication_safety_validations_validated_at 
  ON public.medication_safety_validations(validated_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_flags_validation_id 
  ON public.validation_flags(validation_id);

CREATE INDEX IF NOT EXISTS idx_validation_flags_medication_id 
  ON public.validation_flags(medication_id);

CREATE INDEX IF NOT EXISTS idx_validation_flags_severity 
  ON public.validation_flags(severity);

-- Enable Row Level Security
ALTER TABLE public.medication_safety_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medication_safety_validations
CREATE POLICY "Users can view their own safety validations"
  ON public.medication_safety_validations
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert their own safety validations"
  ON public.medication_safety_validations
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- RLS Policies for validation_flags
CREATE POLICY "Users can view flags for their validations"
  ON public.validation_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.medication_safety_validations
      WHERE medication_safety_validations.id = validation_flags.validation_id
      AND medication_safety_validations.patient_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert flags for their validations"
  ON public.validation_flags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.medication_safety_validations
      WHERE medication_safety_validations.id = validation_flags.validation_id
      AND medication_safety_validations.patient_id = auth.uid()
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.medication_safety_validations IS 'Stores medication regimen safety validation results';
COMMENT ON TABLE public.validation_flags IS 'Stores individual safety concerns identified during validation';

COMMENT ON COLUMN public.medication_safety_validations.overall_risk_level IS 'Overall risk assessment: safe, caution, warning, or critical';
COMMENT ON COLUMN public.medication_safety_validations.validation_method IS 'Method used: ai_clinical_nlp, rule_based, or hybrid';
COMMENT ON COLUMN public.validation_flags.severity IS 'Flag severity: critical, high, medium, low, or info';
COMMENT ON COLUMN public.validation_flags.category IS 'Type of safety concern: dosage, age, interaction, contraindication, duration, or frequency';
COMMENT ON COLUMN public.validation_flags.requires_physician_review IS 'Whether this flag requires immediate physician review';
