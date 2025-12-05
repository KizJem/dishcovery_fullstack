-- ============================================
-- SUPABASE RLS FIX FOR COLLECTIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

-- Step 2: Enable RLS (if not already enabled)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Step 3: Create proper policies for Supabase Auth
-- Allow users to view their own collections
CREATE POLICY "Users can view their own collections"
ON collections
FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow users to insert their own collections
CREATE POLICY "Users can insert their own collections"
ON collections
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own collections
CREATE POLICY "Users can update their own collections"
ON collections
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own collections
CREATE POLICY "Users can delete their own collections"
ON collections
FOR DELETE
USING (auth.uid()::text = user_id);

-- Step 4: Fix for collection_recipes table
DROP POLICY IF EXISTS "Users can view recipes in their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;

ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;

-- Allow users to manage recipes in their own collections
CREATE POLICY "Users can view recipes in their collections"
ON collection_recipes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_recipes.collection_id
    AND collections.user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can add recipes to their collections"
ON collection_recipes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_recipes.collection_id
    AND collections.user_id = auth.uid()::text
  )
);

CREATE POLICY "Users can remove recipes from their collections"
ON collection_recipes
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM collections
    WHERE collections.id = collection_recipes.collection_id
    AND collections.user_id = auth.uid()::text
  )
);

-- Step 5: Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('collections', 'collection_recipes')
ORDER BY tablename, policyname;
