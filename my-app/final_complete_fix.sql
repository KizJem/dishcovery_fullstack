-- COMPLETE FIX: Drop ALL policies from ALL tables, then change types

-- ==========================================
-- STEP 1: Drop ALL policies from ALL tables
-- ==========================================

-- Drop policies from collections table
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;
DROP POLICY IF EXISTS "Allow users to view collections" ON collections;
DROP POLICY IF EXISTS "Allow users to insert collections" ON collections;
DROP POLICY IF EXISTS "Allow users to update collections" ON collections;
DROP POLICY IF EXISTS "Allow users to delete collections" ON collections;
DROP POLICY IF EXISTS "Public read access" ON collections;
DROP POLICY IF EXISTS "Public insert access" ON collections;
DROP POLICY IF EXISTS "Public update access" ON collections;
DROP POLICY IF EXISTS "Public delete access" ON collections;

-- Drop policies from collection_recipes table (THIS IS THE KEY!)
DROP POLICY IF EXISTS "Users can view their collection recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Public read collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public insert collection_recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Public delete collection_recipes" ON collection_recipes;

-- Drop policies from recipes table
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON recipes;
DROP POLICY IF EXISTS "Public read recipes" ON recipes;
DROP POLICY IF EXISTS "Public insert recipes" ON recipes;

-- ==========================================
-- STEP 2: Drop constraints
-- ==========================================

ALTER TABLE collections 
DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_collection_id_fkey;

ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_recipe_id_fkey;

-- ==========================================
-- STEP 3: Change column types to TEXT
-- ==========================================

-- Change collections table
ALTER TABLE collections 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

ALTER TABLE collections 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Change collection_recipes table
ALTER TABLE collection_recipes 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

ALTER TABLE collection_recipes 
ALTER COLUMN collection_id TYPE TEXT USING collection_id::TEXT;

-- Change recipes table id if needed
ALTER TABLE recipes 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

ALTER TABLE collection_recipes 
ALTER COLUMN recipe_id TYPE TEXT USING recipe_id::TEXT;

-- ==========================================
-- STEP 4: Recreate primary keys
-- ==========================================

ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_pkey;
ALTER TABLE collections ADD PRIMARY KEY (id);

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_pkey;
ALTER TABLE recipes ADD PRIMARY KEY (id);

ALTER TABLE collection_recipes DROP CONSTRAINT IF EXISTS collection_recipes_pkey;
ALTER TABLE collection_recipes ADD PRIMARY KEY (id);

-- ==========================================
-- STEP 5: Recreate foreign keys
-- ==========================================

ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_collection_id_fkey 
FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_recipe_id_fkey 
FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

-- ==========================================
-- STEP 6: Disable RLS completely
-- ==========================================

ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 7: Verify changes
-- ==========================================

SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('collections', 'collection_recipes', 'recipes')
AND column_name IN ('id', 'user_id', 'collection_id', 'recipe_id')
ORDER BY table_name, column_name;
