-- Setup Storage RLS policies for expenses bucket
-- This migration creates the necessary policies to allow authenticated users to upload, read, and delete files in the expenses bucket

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to expenses bucket
CREATE POLICY "Allow authenticated uploads to expenses bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'expenses' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to read files from expenses bucket  
CREATE POLICY "Allow authenticated reads from expenses bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'expenses'
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update files in expenses bucket
CREATE POLICY "Allow authenticated updates to expenses bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'expenses'
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'expenses'
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete files from expenses bucket
CREATE POLICY "Allow authenticated deletes from expenses bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'expenses'
  AND auth.role() = 'authenticated'
);

-- Create the expenses bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('expenses', 'expenses', false)
ON CONFLICT (id) DO NOTHING;

-- Set up bucket policy to allow file size limit and MIME type restrictions
UPDATE storage.buckets 
SET 
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'expenses';