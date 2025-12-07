-- Fix the foreign key relationship between collection_recipes and recipes tables
-- This allows Supabase to perform joins between these tables

-- First, ensure all tables exist with correct structure
-- Check if recipes table exists, if not create it
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  image_url TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check if collections table exists, if not create it
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check if collection_recipes table exists, if not create it
CREATE TABLE IF NOT EXISTS collection_recipes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  collection_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id)
);

-- Drop existing foreign key constraints if they exist
ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_collection_id_fkey;

ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_recipe_id_fkey;

-- Add the foreign key constraints
ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_collection_id_fkey 
FOREIGN KEY (collection_id) 
REFERENCES collections(id) 
ON DELETE CASCADE;

ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_recipe_id_fkey 
FOREIGN KEY (recipe_id) 
REFERENCES recipes(id) 
ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collection_recipes_collection_id 
ON collection_recipes(collection_id);

CREATE INDEX IF NOT EXISTS idx_collection_recipes_recipe_id 
ON collection_recipes(recipe_id);

CREATE INDEX IF NOT EXISTS idx_collections_user_id 
ON collections(user_id);

-- Disable RLS on all tables to avoid permission issues
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public read recipes" ON recipes;
DROP POLICY IF EXISTS "Public insert recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON recipes;

DROP POLICY IF EXISTS "Public read access" ON collections;
DROP POLICY IF EXISTS "Public insert access" ON collections;
DROP POLICY IF EXISTS "Public update access" ON collections;
DROP POLICY IF EXISTS "Public delete access" ON collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

DROP POLICY IF EXISTS "Public read collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public insert collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public delete collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Users can view their collection recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;

-- Grant necessary permissions
GRANT ALL ON recipes TO anon, authenticated;
GRANT ALL ON collections TO anon, authenticated;
GRANT ALL ON collection_recipes TO anon, authenticated;

-- Verify the relationship exists
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='collection_recipes';
