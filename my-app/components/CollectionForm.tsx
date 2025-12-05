'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createCollection, updateCollection } from '@/lib/database';
import { uploadCollectionImage } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

interface CollectionFormProps {
  userId: string;
  existingCollection?: {
    id: string;
    title: string;
    description?: string;
    cover_image_url?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CollectionForm({ 
  userId, 
  existingCollection, 
  onSuccess, 
  onCancel 
}: CollectionFormProps) {
  const [title, setTitle] = useState(existingCollection?.title || '');
  const [description, setDescription] = useState(existingCollection?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(existingCollection?.cover_image_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (existingCollection) {
        // Update existing collection
        const result = await updateCollection(existingCollection.id, {
          title,
          description,
          cover_image_url: coverImageUrl,
        });

        if (!result) {
          throw new Error('Failed to update collection');
        }
      } else {
        // Create new collection
        const result = await createCollection(userId, title, description, coverImageUrl);

        if (!result) {
          throw new Error('Failed to create collection');
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error('Error saving collection:', err);
      setError(err.message || 'Failed to save collection');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setCoverImageUrl(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold">
        {existingCollection ? 'Edit Collection' : 'Create New Collection'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Italian Favorites"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your collection..."
        />
      </div>

      <ImageUpload
        collectionId={existingCollection?.id || 'new'}
        userId={userId}
        currentImageUrl={coverImageUrl}
        onImageUploaded={handleImageUploaded}
      />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : existingCollection ? 'Update Collection' : 'Create Collection'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-gray-500">
        * You must be logged in to upload cover images
      </p>
    </form>
  );
}
