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
    <form onSubmit={handleSubmit} style={{ padding: 0 }}>
      <h2 style={{ 
        fontSize: 24, 
        fontWeight: 700, 
        marginBottom: 10,
        color: '#222'
      }}>
        {existingCollection ? 'Edit Collection' : 'Create New Collection'}
      </h2>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c00',
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label 
          htmlFor="title" 
          style={{ 
            display: 'block', 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#222',
            marginBottom: 8 
          }}
        >
          Collection name
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 15,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#FF9E00'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
          placeholder="e.g., Italian Favorites"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label 
          htmlFor="description" 
          style={{ 
            display: 'block', 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#222',
            marginBottom: 8 
          }}
        >
          Description <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 15,
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#FF9E00'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
          placeholder="Describe your collection..."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label 
          style={{ 
            display: 'block', 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#222',
            marginBottom: 8 
          }}
        >
          Cover Image
        </label>
        <ImageUpload
          collectionId={existingCollection?.id || 'new'}
          userId={userId}
          currentImageUrl={coverImageUrl}
          onImageUploaded={handleImageUploaded}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 20px',
            borderRadius: 12,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#222',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#f9f9f9')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#fff')}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 20px',
            borderRadius: 12,
            border: 'none',
            background: loading ? '#ccc' : '#FF9E00',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#FF8C00')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#FF9E00')}
        >
          {loading ? 'Saving...' : existingCollection ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
