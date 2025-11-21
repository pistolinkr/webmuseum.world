'use client';

import { useState, FormEvent } from 'react';
import { Artwork } from '@/types';
import { createArtwork, updateArtwork } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import ImageUpload from './ImageUpload';

interface ArtworkFormProps {
  exhibitionId: string;
  artwork?: Artwork;
  onSuccess?: () => void;
  onCancel?: () => void;
  onAddAnother?: () => void; // Callback for adding another artwork
}

export default function ArtworkForm({
  exhibitionId,
  artwork,
  onSuccess,
  onCancel,
  onAddAnother,
}: ArtworkFormProps) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: artwork?.title || '',
    artist: artwork?.artist || '',
    artistId: artwork?.artistId || '',
    imageUrl: artwork?.imageUrl || '',
    caption: artwork?.caption || '',
    description: artwork?.description || '',
    year: artwork?.year?.toString() || '',
    medium: artwork?.medium || '',
    dimensions: artwork?.dimensions || '',
    genre: artwork?.genre?.join(', ') || '',
    tags: artwork?.tags?.join(', ') || '',
    emotion: artwork?.emotion?.join(', ') || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to create an artwork');
      setLoading(false);
      return;
    }

    if (!formData.imageUrl) {
      setError('Please upload an image');
      setLoading(false);
      return;
    }

    try {
      // Helper function to remove undefined values
      const removeUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
        const cleaned: Partial<T> = {};
        Object.keys(obj).forEach(key => {
          if (obj[key] !== undefined && obj[key] !== null) {
            cleaned[key as keyof T] = obj[key];
          }
        });
        return cleaned;
      };

      // Build artwork data, only including fields with values
      const artworkDataRaw: any = {
        title: formData.title,
        artist: formData.artist,
        imageUrl: formData.imageUrl,
        caption: formData.caption,
        description: formData.description,
        exhibitionId: exhibitionId,
        userId: currentUser.uid,
      };

      // Only add optional fields if they have values
      if (formData.artistId && formData.artistId.trim()) {
        artworkDataRaw.artistId = formData.artistId.trim();
      }
      if (formData.year && formData.year.trim()) {
        artworkDataRaw.year = parseInt(formData.year);
      }
      if (formData.medium && formData.medium.trim()) {
        artworkDataRaw.medium = formData.medium.trim();
      }
      if (formData.dimensions && formData.dimensions.trim()) {
        artworkDataRaw.dimensions = formData.dimensions.trim();
      }
      if (formData.genre && formData.genre.trim()) {
        const genreArray = formData.genre.split(',').map(g => g.trim()).filter(Boolean);
        if (genreArray.length > 0) {
          artworkDataRaw.genre = genreArray;
        }
      }
      if (formData.tags && formData.tags.trim()) {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length > 0) {
          artworkDataRaw.tags = tagsArray;
        }
      }
      if (formData.emotion && formData.emotion.trim()) {
        const emotionArray = formData.emotion.split(',').map(e => e.trim()).filter(Boolean);
        if (emotionArray.length > 0) {
          artworkDataRaw.emotion = emotionArray;
        }
      }

      const artworkData = removeUndefined(artworkDataRaw) as Omit<Artwork, 'id'>;

      if (artwork) {
        // Check if user owns the artwork before updating
        if (artwork.userId !== currentUser.uid) {
          setError('You do not have permission to update this artwork');
          setLoading(false);
          return;
        }
        
        // Update existing artwork
        const success = await updateArtwork(artwork.id, artworkData, currentUser.uid);
        if (success) {
          onSuccess?.();
        } else {
          setError('Failed to update artwork');
        }
      } else {
        // Create new artwork
        try {
          const artworkId = await createArtwork(artworkData);
          if (artworkId) {
            // Reset form for next artwork
            setFormData({
              title: '',
              artist: formData.artist, // Keep artist name for convenience
              artistId: formData.artistId, // Keep artistId for convenience
              imageUrl: '',
              caption: '',
              description: '',
              year: '',
              medium: formData.medium, // Keep medium for convenience
              dimensions: '',
              genre: formData.genre, // Keep genre for convenience
              tags: formData.tags, // Keep tags for convenience
              emotion: '',
            });
            setError(''); // Clear any previous errors
            setLoading(false);
            
            // Call onSuccess to refresh the list
            onSuccess?.();
            
            // If onAddAnother is provided, don't close the form
            // Otherwise, the form will stay open for adding another artwork
          } else {
            setError('Failed to create artwork');
            setLoading(false);
          }
        } catch (createError: any) {
          console.error('Error in createArtwork:', createError);
          // Handle specific Firebase errors
          if (createError?.code === 'permission-denied') {
            setError('Permission denied. Please check your authentication and try again.');
          } else if (createError?.message) {
            setError(createError.message);
          } else {
            setError('Failed to create artwork. Please try again.');
          }
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="artwork-form">
      <h3 className="artwork-form__title">
        {artwork ? 'Edit Artwork' : 'Add New Artwork'}
      </h3>

      {error && (
        <div className="artwork-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="artwork-form__field">
        <label className="artwork-form__label">Image *</label>
        <ImageUpload
          exhibitionId={exhibitionId}
          artworkId={artwork?.id}
          currentImageUrl={formData.imageUrl}
          onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
          onError={(err) => setError(err)}
        />
      </div>

      <div className="artwork-form__row">
        <div className="artwork-form__field">
          <label htmlFor="title" className="artwork-form__label">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="artwork-form__input"
            placeholder="Artwork title"
          />
        </div>

        <div className="artwork-form__field">
          <label htmlFor="artist" className="artwork-form__label">
            Artist *
          </label>
          <input
            id="artist"
            type="text"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            required
            className="artwork-form__input"
            placeholder="Artist name"
          />
        </div>
      </div>

      <div className="artwork-form__field">
        <label htmlFor="caption" className="artwork-form__label">
          Caption *
        </label>
        <input
          id="caption"
          type="text"
          value={formData.caption}
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          required
          className="artwork-form__input"
          placeholder="Short caption"
        />
      </div>

      <div className="artwork-form__field">
        <label htmlFor="description" className="artwork-form__label">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="artwork-form__textarea"
          placeholder="Detailed description of the artwork"
          rows={4}
        />
      </div>

      <div className="artwork-form__row">
        <div className="artwork-form__field">
          <label htmlFor="year" className="artwork-form__label">
            Year
          </label>
          <input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="artwork-form__input"
            placeholder="e.g., 2024"
          />
        </div>

        <div className="artwork-form__field">
          <label htmlFor="medium" className="artwork-form__label">
            Medium
          </label>
          <input
            id="medium"
            type="text"
            value={formData.medium}
            onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
            className="artwork-form__input"
            placeholder="e.g., Oil on canvas"
          />
        </div>
      </div>

      <div className="artwork-form__field">
        <label htmlFor="dimensions" className="artwork-form__label">
          Dimensions
        </label>
        <input
          id="dimensions"
          type="text"
          value={formData.dimensions}
          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
          className="artwork-form__input"
          placeholder="e.g., 100 cm × 80 cm"
        />
      </div>

      <div className="artwork-form__row">
        <div className="artwork-form__field">
          <label htmlFor="genre" className="artwork-form__label">
            Genre (comma-separated)
          </label>
          <input
            id="genre"
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="artwork-form__input"
            placeholder="e.g., Abstract, Modern, Digital"
          />
        </div>

        <div className="artwork-form__field">
          <label htmlFor="tags" className="artwork-form__label">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="artwork-form__input"
            placeholder="e.g., painting, sculpture, digital"
          />
        </div>
      </div>

      <div className="artwork-form__field">
        <label htmlFor="emotion" className="artwork-form__label">
          Emotion (comma-separated)
        </label>
        <input
          id="emotion"
          type="text"
          value={formData.emotion}
          onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
          className="artwork-form__input"
          placeholder="e.g., peaceful, dramatic, vibrant"
        />
      </div>

      <div className="artwork-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="artwork-form__button artwork-form__button--secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="artwork-form__button artwork-form__button--primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : artwork ? 'Update Artwork' : 'Add Artwork'}
        </button>
      </div>
    </form>
  );
}

