-- IMPORTANT: Run this in Supabase SQL Editor to check your setup

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('collections', 'recipes', 'collection_recipes');

-- 2. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('collections', 'recipes', 'collection_recipes');

-- 3. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('collections', 'recipes', 'collection_recipes');

-- 4. DISABLE RLS (Run this if rowsecurity = true above)
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;

-- 5. Test insert (replace with your Firebase user ID)
-- INSERT INTO collections (user_id, title, description)
-- VALUES ('your-firebase-user-id-here', 'Test Collection', 'Testing');

-- 6. View all collections
SELECT * FROM collections;
