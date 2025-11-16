'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Exhibition } from '@/types';
import { createExhibition, updateExhibition } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
      const exhibitionData: Omit<Exhibition, 'id'> = {
        title: formData.title,
        description: formData.description,
        statement: formData.statement || undefined,
        curator: formData.curator || undefined,
        date: formData.date || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        isPublic: formData.isPublic,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        genre: formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(Boolean) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        userId: currentUser.uid,
        artistIds: [],
        artworks: [],
        featured: false,
      };

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
        const exhibitionId = await createExhibition(exhibitionData);
        if (exhibitionId) {
          onSuccess?.();
          router.push(`/exhibition/${exhibitionId}/story`);
        } else {
          setError('Failed to create exhibition');
        }
      }
    } catch (err: any) {
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
          Thumbnail Image URL
        </label>
        <input
          id="thumbnailUrl"
          type="url"
          value={formData.thumbnailUrl}
          onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
          className="exhibition-form__input"
          placeholder="https://example.com/image.jpg"
        />
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

