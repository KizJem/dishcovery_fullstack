# Quick Fix: Update Supabase RLS Policies for Firebase Auth

Since you're using Firebase Authentication instead of Supabase Auth, you need to update the Row Level Security (RLS) policies.

## Option 1: Disable RLS (For Development Only - Not Recommended for Production)

Go to **SQL Editor** in Supabase and run:

```sql
-- Disable RLS temporarily for development
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;
```

## Option 2: Make Tables Public (Better for Development)

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON collections;

-- Create public policies (allows anyone to read/write)
CREATE POLICY "Public read access"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Public insert access"
  ON collections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access"
  ON collections FOR UPDATE
  USING (true);

CREATE POLICY "Public delete access"
  ON collections FOR DELETE
  USING (true);

-- Do the same for collection_recipes
DROP POLICY IF EXISTS "Users can view their collection recipes" ON collection_recipes;
DROP POLICY IF EXISTS "Users can add recipes to their collections" ON collection_recipes;
DROP POLICY IF EXISTS "Users can remove recipes from their collections" ON collection_recipes;

CREATE POLICY "Public read collection_recipes"
  ON collection_recipes FOR SELECT
  USING (true);

CREATE POLICY "Public insert collection_recipes"
  ON collection_recipes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public delete collection_recipes"
  ON collection_recipes FOR DELETE
  USING (true);

-- For recipes table
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON recipes;

CREATE POLICY "Public read recipes"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Public insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (true);
```

## Option 3: Use Service Role Key (Bypasses RLS)

Instead of using the `anon` key, you can use the `service_role` key in your `.env.local` for development:

```env
# ⚠️ WARNING: Only use this for development! Never commit this key!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Then update `lib/supabase.ts`:

```typescript
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
```

## Recommendation

For now, use **Option 2** (Public policies) to test your image uploads. Once everything works, you can implement proper authentication later.

## Run This SQL Now

Copy and paste this into your Supabase SQL Editor:

```sql
-- Make tables accessible without strict RLS
ALTER TABLE collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes DISABLE ROW LEVEL SECURITY;
```

After running this, your collections and images should save properly to the database! ✅
