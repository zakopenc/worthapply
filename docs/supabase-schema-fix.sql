-- ============================================================
-- WorthApply - Supabase Schema Fixes
-- Fixes issues found by automated testing
-- ============================================================

-- Issue 1: Add missing 'email' column to profiles table
-- --------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Optional: Add unique constraint if email should be unique
-- ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- ============================================================
-- Issue 2: Create 'resumes' storage bucket
-- ============================================================

-- Create resumes bucket (skip if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,  -- Private bucket
  10485760,  -- 10MB max file size
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Issue 3: Set up RLS policies for resumes bucket
-- ============================================================

-- Policy: Users can upload their own resumes
CREATE POLICY IF NOT EXISTS "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can read their own resumes
CREATE POLICY IF NOT EXISTS "Users can read their own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own resumes
CREATE POLICY IF NOT EXISTS "Users can update their own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own resumes
CREATE POLICY IF NOT EXISTS "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- Optional: Verify schema
-- ============================================================

-- Check profiles table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Check storage buckets
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'resumes';

-- Check storage policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ============================================================
-- Complete! Re-run tests:
-- npm run test:production
-- ============================================================
