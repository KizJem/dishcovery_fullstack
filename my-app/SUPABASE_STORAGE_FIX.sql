-- ============================================
-- SUPABASE STORAGE RLS FIX
-- Run this in Supabase SQL Editor
-- ============================================

-- Fix Storage Bucket Policies for collection-images

-- Step 1: Drop existing storage policies
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload to collection-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read collection images" ON storage.objects;

-- Step 2: Create new storage policies for collection-images bucket

-- Allow authenticated users to upload images to collection-images bucket
CREATE POLICY "Authenticated users can upload collection images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'collection-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update collection images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'collection-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'collection-images' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete collection images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'collection-images' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to collection images
CREATE POLICY "Public can read collection images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'collection-images');

-- Step 3: Verify storage policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Also check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'collection-images';
