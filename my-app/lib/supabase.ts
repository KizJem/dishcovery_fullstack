import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
if (typeof window !== 'undefined') {
  console.log('🔗 Supabase client initialized');
  console.log('URL:', supabaseUrl);
}

// Upload image to Supabase Storage
export async function uploadCollectionImage(file: File, collectionId: string, userId: string) {
  // Validate inputs
  if (!userId) {
    throw new Error('User ID is required to upload images');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${collectionId}-${Date.now()}.${fileExt}`;
  const filePath = `collection-covers/${fileName}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('collection-images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('collection-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Delete image from Supabase Storage
export async function deleteCollectionImage(imageUrl: string) {
  // Extract the file path from the URL
  const filePath = imageUrl.split('/collection-images/')[1];
  
  if (!filePath) {
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('collection-images')
    .remove([`collection-covers/${filePath}`]);

  if (error) {
    throw error;
  }
}

// Upload profile image to Supabase Storage
export async function uploadProfileImage(file: File, userId: string) {
  // Validate inputs
  if (!userId) {
    throw new Error('User ID is required to upload images');
  }

  if (!file) {
    throw new Error('No file provided');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;
  const filePath = `profile-images/${fileName}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('collection-images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('collection-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
