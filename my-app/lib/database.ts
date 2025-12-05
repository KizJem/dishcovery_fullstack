// Database types for Supabase (using TEXT for IDs to support Firebase Auth)
export interface Collection {
  id: string;  // TEXT - can be any string format
  user_id: string;  // TEXT - Firebase Auth user ID
  title: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;  // TEXT
  title: string;
  description?: string;
  ingredients?: any;
  instructions?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionRecipe {
  id: string;  // TEXT
  collection_id: string;  // TEXT
  recipe_id: string;  // TEXT
  added_at: string;
}

// Helper functions for collections
import { supabase } from './supabase';

// Fetch all collections for the current user
export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    console.log('🔍 Fetching collections for user:', userId);
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log('✅ Collections fetched:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Exception in getUserCollections:', err);
    return [];
  }
}

// Fetch a single collection by ID
export async function getCollection(collectionId: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', collectionId)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  return data;
}

// Create a new collection
export async function createCollection(
  userId: string,
  title: string,
  description?: string,
  coverImageUrl?: string
): Promise<Collection | null> {
  try {
    console.log('📝 Creating collection:', { userId, title, coverImageUrl });
    
    // Get the current authenticated user to verify
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated:', authError);
      throw new Error('You must be logged in to create a collection');
    }
    
    console.log('✅ Authenticated user:', user.id);
    
    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      console.error('❌ User ID mismatch:', { provided: userId, actual: user.id });
      throw new Error('User ID mismatch');
    }
    
    // Generate a unique ID (simple timestamp-based)
    const collectionId = `col_${userId}_${Date.now()}`;
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        id: collectionId,
        user_id: userId,
        title,
        description,
        cover_image_url: coverImageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating collection:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ Collection created:', data);
    return data;
  } catch (err) {
    console.error('❌ Exception in createCollection:', err);
    throw err;
  }
}

// Update a collection
export async function updateCollection(
  collectionId: string,
  updates: Partial<Pick<Collection, 'title' | 'description' | 'cover_image_url'>>
): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', collectionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    return null;
  }

  return data;
}

// Delete a collection
export async function deleteCollection(collectionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }

  return true;
}

// Get all recipes in a collection
export async function getCollectionRecipes(collectionId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('collection_recipes')
    .select(`
      recipe_id,
      added_at,
      recipes (*)
    `)
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Error fetching collection recipes:', error);
    return [];
  }

  // @ts-ignore - Supabase returns nested structure
  return data?.map(item => item.recipes) || [];
}

// Add a recipe to a collection
export async function addRecipeToCollection(
  collectionId: string,
  recipeData: { id: string; title: string; image?: string; description?: string }
): Promise<boolean> {
  try {
    // First, ensure the recipe exists in the recipes table
    const { error: recipeError } = await supabase
      .from('recipes')
      .upsert({
        id: recipeData.id,
        title: recipeData.title,
        image_url: recipeData.image || '/food.png',
        description: recipeData.description || '',
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (recipeError) {
      console.error('Error upserting recipe:', recipeError);
      return false;
    }

    // Then link it to the collection
    const { error: linkError } = await supabase
      .from('collection_recipes')
      .insert({
        collection_id: collectionId,
        recipe_id: recipeData.id,
      });

    if (linkError) {
      console.error('Error linking recipe to collection:', linkError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in addRecipeToCollection:', err);
    return false;
  }
}

// Remove a recipe from a collection
export async function removeRecipeFromCollection(
  collectionId: string,
  recipeId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('collection_recipes')
    .delete()
    .eq('collection_id', collectionId)
    .eq('recipe_id', recipeId);

  if (error) {
    console.error('Error removing recipe from collection:', error);
    return false;
  }

  return true;
}
