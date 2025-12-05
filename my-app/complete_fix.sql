-- COMPLETE FIX: Drop policies, change types, disable RLS

-- Step 1: Drop all policies from ALL tables
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
DROP POLICY IF EXISTS "Allow users to view collections" ON collections;
DROP POLICY IF EXISTS "Allow users to insert collections" ON collections;
DROP POLICY IF EXISTS "Allow users to update collections" ON collections;
DROP POLICY IF EXISTS "Allow users to delete collections" ON collections;

-- Drop collection_recipes policies (THIS WAS MISSING!)
DROP POLICY IF EXISTS "Users can view their collection recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Public read collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public insert collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public delete collection_recipes" ON collection_recipes;

-- Drop recipes policies
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Public read recipes" ON recipes;
DROP POLICY IF EXISTS "Public insert recipes" ON recipes;

-- Step 2: Drop foreign key constraints
ALTER TABLE collections 
DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

-- Step 3: Change user_id from UUID to TEXT
ALTER TABLE collections 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 4: Change id from UUID to TEXT
ALTER TABLE collections 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 5: Drop and recreate primary key
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_pkey;
ALTER TABLE collections ADD PRIMARY KEY (id);

-- Step 6: Fix collection_recipes table
ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_collection_id_fkey;

ALTER TABLE collection_recipes 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

ALTER TABLE collection_recipes 
ALTER COLUMN collection_id TYPE TEXT USING collection_id::TEXT;

-- Step 7: Recreate foreign key
ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_collection_id_fkey 
FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

-- Step 8: Disable RLS (no policies needed for development)
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;

-- Step 9: Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('collections', 'collection_recipes')
AND column_name IN ('id', 'user_id', 'collection_id')
ORDER BY table_name, column_name;

-- Step 10: Check RLS status
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('collections', 'recipes', 'collection_recipes');
