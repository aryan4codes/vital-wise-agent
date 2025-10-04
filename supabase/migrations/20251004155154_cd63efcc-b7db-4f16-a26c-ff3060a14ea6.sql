-- Create storage bucket for prescription files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
);

-- RLS policies for prescriptions bucket
CREATE POLICY "Users can upload their own prescriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prescriptions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own prescriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'prescriptions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view prescriptions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prescriptions');