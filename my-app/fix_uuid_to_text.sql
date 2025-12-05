-- FIX: Change user_id from UUID to TEXT to support Firebase Auth IDs

-- Step 1: Drop the foreign key constraint (references auth.users)
ALTER TABLE collections 
DROP CONSTRAINT IF EXISTS collections_user_id_fkey;

-- Step 2: Change user_id column type from UUID to TEXT
ALTER TABLE collections 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 3: Do the same for collection_recipes if needed
ALTER TABLE collection_recipes 
ALTER COLUMN collection_id TYPE TEXT USING collection_id::TEXT;

-- Step 4: Update collections table id to TEXT
ALTER TABLE collections 
ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 5: Update primary key
ALTER TABLE collections DROP CONSTRAINT IF EXISTS collections_pkey;
ALTER TABLE collections ADD PRIMARY KEY (id);

-- Step 6: Update collection_recipes foreign keys
ALTER TABLE collection_recipes 
DROP CONSTRAINT IF EXISTS collection_recipes_collection_id_fkey;

ALTER TABLE collection_recipes 
ADD CONSTRAINT collection_recipes_collection_id_fkey 
FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'collections' 
AND column_name IN ('id', 'user_id');
