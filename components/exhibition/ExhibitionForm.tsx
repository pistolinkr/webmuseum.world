'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { Exhibition } from '@/types';
import { createExhibition, updateExhibition } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { uploadToFirebaseStorage, getExhibitionThumbnailPath } from '@/lib/firebaseStorage';

interface ExhibitionFormProps {
  exhibition?: Exhibition;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExhibitionForm({ exhibition, onSuccess, onCancel }: ExhibitionFormProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: exhibition?.title || '',
    description: exhibition?.description || '',
    statement: exhibition?.statement || '',
    curator: exhibition?.curator || '',
    date: exhibition?.date || '',
    startDate: exhibition?.startDate || '',
    endDate: exhibition?.endDate || '',
    isPublic: exhibition?.isPublic ?? true,
    genre: exhibition?.genre?.join(', ') || '',
    tags: exhibition?.tags?.join(', ') || '',
    thumbnailUrl: exhibition?.thumbnailUrl || '',
  });

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setUploadingThumbnail(true);
    setThumbnailUploadProgress(0);
    setError('');

    try {
      const extension = file.name.split('.').pop() || 'jpg';
      // Use exhibition ID if editing, otherwise use temp ID
      const exhibitionId = exhibition?.id || `temp-${Date.now()}`;
      const path = getExhibitionThumbnailPath(exhibitionId, extension);

      const imageUrl = await uploadToFirebaseStorage(file, path, (progress) => {
        setThumbnailUploadProgress(progress);
      });

      if (imageUrl) {
        setFormData({ ...formData, thumbnailUrl: imageUrl });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload thumbnail image');
    } finally {
      setUploadingThumbnail(false);
      setThumbnailUploadProgress(0);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to create an exhibition');
      setLoading(false);
      return;
    }

    try {
      // Helper function to remove undefined values
      const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
        const cleaned: Partial<T> = {};
        Object.keys(obj).forEach(key => {
          if (obj[key] !== undefined) {
            cleaned[key as keyof T] = obj[key];
          }
        });
        return cleaned;
      };

      // Build exhibition data, only including fields with values
      const exhibitionDataRaw: any = {
        title: formData.title,
        description: formData.description,
        isPublic: formData.isPublic,
        userId: currentUser.uid,
        artistIds: [],
        artworks: [],
        featured: false,
      };

      // Only add optional fields if they have values
      if (formData.statement && formData.statement.trim()) {
        exhibitionDataRaw.statement = formData.statement.trim();
      }
      if (formData.curator && formData.curator.trim()) {
        exhibitionDataRaw.curator = formData.curator.trim();
      }
      if (formData.date && formData.date.trim()) {
        exhibitionDataRaw.date = formData.date.trim();
      }
      if (formData.startDate && formData.startDate.trim()) {
        exhibitionDataRaw.startDate = formData.startDate.trim();
      }
      if (formData.endDate && formData.endDate.trim()) {
        exhibitionDataRaw.endDate = formData.endDate.trim();
      }
      if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
        exhibitionDataRaw.thumbnailUrl = formData.thumbnailUrl.trim();
      }
      if (formData.genre && formData.genre.trim()) {
        const genreArray = formData.genre.split(',').map(g => g.trim()).filter(Boolean);
        if (genreArray.length > 0) {
          exhibitionDataRaw.genre = genreArray;
        }
      }
      if (formData.tags && formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length > 0) {
          exhibitionDataRaw.tags = tagsArray;
        }
      }

      const exhibitionData = removeUndefined(exhibitionDataRaw) as Omit<Exhibition, 'id'>;

      if (exhibition) {
        // Check if user owns the exhibition before updating
        if (exhibition.userId !== currentUser.uid) {
          setError('You do not have permission to update this exhibition');
          setLoading(false);
          return;
        }
        
        // Update existing exhibition
        const success = await updateExhibition(exhibition.id, exhibitionData, currentUser.uid);
        if (success) {
          onSuccess?.();
          router.push(`/exhibition/${exhibition.id}/story`);
        } else {
          setError('Failed to update exhibition');
        }
      } else {
        // Create new exhibition
        try {
          const exhibitionId = await createExhibition(exhibitionData);
          if (exhibitionId) {
            onSuccess?.();
            router.push(`/exhibition/${exhibitionId}/story`);
          } else {
            setError('Failed to create exhibition');
          }
        } catch (createError: any) {
          console.error('Error in createExhibition:', createError);
          // Handle specific Firebase permission errors
          if (createError?.code === 'permission-denied') {
            setError('Permission denied. Please check your authentication and try again.');
          } else if (createError?.message) {
            setError(createError.message);
          } else {
            setError('Failed to create exhibition. Please try again.');
          }
        }
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="exhibition-form">
      <h2 className="exhibition-form__title">
        {exhibition ? 'Edit Exhibition' : 'Create New Exhibition'}
      </h2>

      {error && (
        <div className="exhibition-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="exhibition-form__field">
        <label htmlFor="title" className="exhibition-form__label">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="exhibition-form__input"
          placeholder="Exhibition title"
        />
      </div>

      <div className="exhibition-form__field">
        <label htmlFor="description" className="exhibition-form__label">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="exhibition-form__textarea"
          placeholder="Brief description of the exhibition"
          rows={3}
        />
      </div>

      <div className="exhibition-form__field">
        <label htmlFor="statement" className="exhibition-form__label">
          Statement
        </label>
        <textarea
          id="statement"
          value={formData.statement}
          onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
          className="exhibition-form__textarea"
          placeholder="Curatorial statement or exhibition concept"
          rows={5}
        />
      </div>

      <div className="exhibition-form__row">
        <div className="exhibition-form__field">
          <label htmlFor="curator" className="exhibition-form__label">
            Curator
          </label>
          <input
            id="curator"
            type="text"
            value={formData.curator}
            onChange={(e) => setFormData({ ...formData, curator: e.target.value })}
            className="exhibition-form__input"
            placeholder="Curator name"
          />
        </div>

        <div className="exhibition-form__field">
          <label htmlFor="date" className="exhibition-form__label">
            Date
          </label>
          <input
            id="date"
            type="text"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="exhibition-form__input"
            placeholder="e.g., 2024 or 2020-2024"
          />
        </div>
      </div>

      <div className="exhibition-form__row">
        <div className="exhibition-form__field">
          <label htmlFor="startDate" className="exhibition-form__label">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="exhibition-form__input"
          />
        </div>

        <div className="exhibition-form__field">
          <label htmlFor="endDate" className="exhibition-form__label">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="exhibition-form__input"
          />
        </div>
      </div>

      <div className="exhibition-form__field">
        <label htmlFor="thumbnailUrl" className="exhibition-form__label">
          Thumbnail Image
        </label>
        {formData.thumbnailUrl ? (
          <div className="exhibition-form__thumbnail-preview">
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail preview"
              className="exhibition-form__thumbnail-image"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
              className="exhibition-form__thumbnail-remove"
              disabled={uploadingThumbnail}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="exhibition-form__thumbnail-upload">
            <div className="exhibition-form__thumbnail-placeholder">
              <svg
                className="exhibition-form__thumbnail-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="exhibition-form__thumbnail-text">Click to upload thumbnail</p>
              <p className="exhibition-form__thumbnail-hint">Max 10MB</p>
            </div>
            {uploadingThumbnail && (
              <div className="exhibition-form__thumbnail-progress">
                <div className="exhibition-form__thumbnail-progress-bar">
                  <div
                    className="exhibition-form__thumbnail-progress-fill"
                    style={{ width: `${thumbnailUploadProgress}%` }}
                  />
                </div>
                <span className="exhibition-form__thumbnail-progress-text">
                  {Math.round(thumbnailUploadProgress)}%
                </span>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              id="thumbnailUrl"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploadingThumbnail}
              className="exhibition-form__thumbnail-input"
            />
          </div>
        )}
      </div>

      <div className="exhibition-form__row">
        <div className="exhibition-form__field">
          <label htmlFor="genre" className="exhibition-form__label">
            Genre (comma-separated)
          </label>
          <input
            id="genre"
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="exhibition-form__input"
            placeholder="e.g., Renaissance, Modern, Abstract"
          />
        </div>

        <div className="exhibition-form__field">
          <label htmlFor="tags" className="exhibition-form__label">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="exhibition-form__input"
            placeholder="e.g., painting, sculpture, digital"
          />
        </div>
      </div>

      <div className="exhibition-form__field">
        <label className="exhibition-form__checkbox-label">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="exhibition-form__checkbox"
          />
          <span>Make this exhibition public</span>
        </label>
      </div>

      <div className="exhibition-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="exhibition-form__button exhibition-form__button--secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="exhibition-form__button exhibition-form__button--primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : exhibition ? 'Update Exhibition' : 'Create Exhibition'}
        </button>
      </div>
    </form>
  );
}

