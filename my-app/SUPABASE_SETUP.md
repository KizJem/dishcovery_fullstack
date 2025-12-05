# Supabase Database Setup for Dishcovery

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - Name: dishcovery (or your preferred name)
   - Database Password: (create a strong password and save it)
   - Region: (choose closest to your users)
5. Click "Create new project"

## 2. Set Up Storage for Collection Cover Images

### Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Configure the bucket:
   - Name: `collection-images`
   - Public bucket: **Yes** (enable this so images can be accessed via URL)
   - File size limit: 5MB (or adjust as needed)
4. Click "Create bucket"

### Set Up Storage Policies

After creating the bucket, you need to set up policies:

1. Click on the `collection-images` bucket
2. Go to "Policies"
3. Create the following policies:

#### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'collection-images' );
```

#### Policy 2: Allow Authenticated Users to Upload (Their Own Folder Only)
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
  bucket_id = 'collection-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Allow Users to Delete Their Own Images Only
```sql
CREATE POLICY "Allow users to delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
  bucket_id = 'collection-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Important:** These policies ensure that:
- Only **logged-in users** can upload images
- Users can only upload to their own folder (organized by user ID)
- Users can only delete their own images
- Anyone can view/read images (public bucket)

## 3. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL:

```sql
-- Create collections table
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table (if needed)
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions TEXT,
  image_url TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_recipes junction table (many-to-many relationship)
CREATE TABLE collection_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_recipes_collection_id ON collection_recipes(collection_id);
CREATE INDEX idx_collection_recipes_recipe_id ON collection_recipes(recipe_id);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections (Allow all authenticated operations for now)
-- Since we're using Firebase Auth, we'll allow access based on user_id matching
-- You can make this more strict later if needed

CREATE POLICY "Allow users to view collections"
  ON collections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for recipes (allow all authenticated users to read)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for collection_recipes
CREATE POLICY "Users can view their collection recipes"
  ON collection_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_recipes.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add recipes to their collections"
  ON collection_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_recipes.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from their collections"
  ON collection_recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_recipes.collection_id
      AND collections.user_id = auth.uid()
    )
  );
```

## 4. Get Your API Keys

1. Go to **Settings** > **API**
2. Copy the following values:
   - Project URL
   - `anon` `public` key

## 5. Configure Environment Variables

1. Create a `.env.local` file in the `my-app` directory
2. Copy the contents from `.env.local.example`
3. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 6. Test the Setup

You can test if everything is working by:

1. Running your Next.js application: `npm run dev`
2. Try creating a collection with a cover image
3. Check your Supabase dashboard to see if:
   - The image appears in Storage > collection-images
   - The collection data appears in Table Editor > collections

## Database Schema Overview

### Collections Table
- Stores collection metadata including title, description, and cover image URL
- Linked to users through `user_id`

### Recipes Table
- Stores recipe information
- Can be shared across multiple collections

### Collection_Recipes Table
- Junction table for many-to-many relationship
- Links recipes to collections

## Storage Structure

Images are organized by user ID for better security and organization:

```
collection-images/
  └── collection-covers/
      ├── user-id-1/
      │   ├── collection-id-timestamp.jpg
      │   └── collection-id-timestamp.png
      ├── user-id-2/
      │   ├── collection-id-timestamp.jpg
      │   └── collection-id-timestamp.png
      └── ...
```

This structure ensures:
- Each user's images are in their own folder
- Easy to manage and delete user data
- Better security with folder-level access control

## Next Steps

After setup, you can:
1. Implement authentication using Supabase Auth
2. Create forms for adding collections with image uploads
3. Query collections and display them with cover images
4. Add recipe management features

## Troubleshooting

- **Images not uploading:** Check storage policies and bucket configuration
- **403 errors:** Verify RLS policies are correctly set up
- **Connection errors:** Double-check environment variables

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
