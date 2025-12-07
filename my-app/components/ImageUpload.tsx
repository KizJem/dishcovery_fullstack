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
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);

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
    <div>
      {preview && (
        <div style={{ marginBottom: 16 }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover' as const,
              borderRadius: 8,
              border: '1px solid #eee'
            }}
          />
        </div>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <input
          id="cover-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            position: 'absolute',
            width: 0,
            height: 0,
            opacity: 0,
            overflow: 'hidden',
            zIndex: -1,
          }}
        />
        <label
          htmlFor="cover-image"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 20px',
            background: '#ddd',
            color: '#333',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.5 : 1,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => !uploading && (e.currentTarget.style.background = '#ccc')}
          onMouseLeave={(e) => !uploading && (e.currentTarget.style.background = '#ddd')}
        >
          Choose File
        </label>
        <span style={{ 
          marginLeft: 16, 
          fontSize: 15, 
          color: fileName ? '#333' : '#666' 
        }}>
          {fileName || 'No file chosen'}
        </span>
      </div>
      
      <p style={{ 
        marginTop: 8, 
        fontSize: 12, 
        color: '#999' 
      }}>
        PNG, JPG, GIF up to 5mb
      </p>

      {uploading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          color: '#FF9E00',
          marginTop: 12
        }}>
          <div style={{
            width: 16,
            height: 16,
            border: '2px solid #FFE0B2',
            borderTopColor: '#FF9E00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Uploading...
        </div>
      )}

      {error && (
        <div style={{
          fontSize: 14,
          color: '#c00',
          background: '#fee',
          padding: 12,
          borderRadius: 8,
          marginTop: 12
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
