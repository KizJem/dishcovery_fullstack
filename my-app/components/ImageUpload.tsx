'use client';

import { useState } from 'react';
import { uploadCollectionImage } from '@/lib/supabase';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  collectionId: string;
  userId: string;
  currentImageUrl?: string;
}

export default function ImageUpload({ onImageUploaded, collectionId, userId, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Check if user is provided
    if (!userId) {
      setError('You must be logged in to upload images');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase (requires authentication)
      const url = await uploadCollectionImage(file, collectionId, userId);
      onImageUploaded(url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label 
          htmlFor="cover-image" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Collection Cover Image
        </label>
        
        {preview && (
          <div className="mb-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <input
          id="cover-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Uploading...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
