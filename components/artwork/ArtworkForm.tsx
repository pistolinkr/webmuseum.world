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
}

export default function ArtworkForm({
  exhibitionId,
  artwork,
  onSuccess,
  onCancel,
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
      const artworkData: Omit<Artwork, 'id'> = {
        title: formData.title,
        artist: formData.artist,
        artistId: formData.artistId || undefined,
        imageUrl: formData.imageUrl,
        caption: formData.caption,
        description: formData.description,
        year: formData.year ? parseInt(formData.year) : undefined,
        medium: formData.medium || undefined,
        dimensions: formData.dimensions || undefined,
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(Boolean) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        emotion: formData.emotion ? formData.emotion.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        exhibitionId: exhibitionId,
        userId: currentUser.uid,
      };

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
        const artworkId = await createArtwork(artworkData);
        if (artworkId) {
          onSuccess?.();
          // Reset form
          setFormData({
            title: '',
            artist: '',
            artistId: '',
            imageUrl: '',
            caption: '',
            description: '',
            year: '',
            medium: '',
            dimensions: '',
            genre: '',
            tags: '',
            emotion: '',
          });
        } else {
          setError('Failed to create artwork');
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

