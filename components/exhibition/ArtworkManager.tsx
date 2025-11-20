'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getArtworksByExhibition, deleteArtwork } from '@/lib/firestore';
import { Artwork, Exhibition } from '@/types';
import ArtworkForm from '@/components/artwork/ArtworkForm';
import Link from 'next/link';

interface ArtworkManagerProps {
  exhibition: Exhibition;
}

export default function ArtworkManager({ exhibition }: ArtworkManagerProps) {
  const { currentUser } = useAuth();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);

  // Check if current user owns this exhibition
  const isOwner = currentUser && exhibition.userId === currentUser.uid;

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    async function loadArtworks() {
      try {
        const data = await getArtworksByExhibition(exhibition.id);
        setArtworks(data);
      } catch (error) {
        console.error('Error loading artworks:', error);
      } finally {
        setLoading(false);
      }
    }
    loadArtworks();
  }, [exhibition.id, isOwner]);

  const handleSuccess = async () => {
    setShowAddForm(false);
    setEditingArtwork(null);
    // Reload artworks
    const data = await getArtworksByExhibition(exhibition.id);
    setArtworks(data);
  };

  const handleDelete = async () => {
    if (!deletingArtwork || !currentUser) return;
    if (typeof window === 'undefined') return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${deletingArtwork.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteArtwork(deletingArtwork.id, currentUser.uid);
        setDeletingArtwork(null);
        // Reload artworks
        const data = await getArtworksByExhibition(exhibition.id);
        setArtworks(data);
      } catch (error: any) {
        console.error('Error deleting artwork:', error);
        alert(error.message || 'Failed to delete artwork');
      }
    }
  };

  if (!isOwner) {
    return null;
  }

  if (loading) {
    return <div className="artwork-manager__loading">Loading artworks...</div>;
  }

  return (
    <section className="artwork-manager">
      <div className="artwork-manager__header">
        <h2 className="artwork-manager__title">Manage Artworks</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="artwork-manager__add-button"
        >
          + Add Artwork
        </button>
      </div>

      {showAddForm && (
        <div className="artwork-manager__form-container">
          <ArtworkForm
            exhibitionId={exhibition.id}
            onSuccess={handleSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingArtwork && (
        <div className="artwork-manager__form-container">
          <ArtworkForm
            exhibitionId={exhibition.id}
            artwork={editingArtwork}
            onSuccess={handleSuccess}
            onCancel={() => setEditingArtwork(null)}
          />
        </div>
      )}

      {artworks.length > 0 ? (
        <div className="artwork-manager__grid">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="artwork-manager__card">
              <Link
                href={`/exhibition/${exhibition.id}/artwork/${artwork.id}`}
                className="artwork-manager__card-link"
                prefetch={true}
              >
                {artwork.imageUrl && (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="artwork-manager__card-image"
                  />
                )}
                <h3 className="artwork-manager__card-title">{artwork.title}</h3>
                <p className="artwork-manager__card-artist">{artwork.artist}</p>
                {artwork.caption && (
                  <p className="artwork-manager__card-caption">{artwork.caption}</p>
                )}
              </Link>
              <div className="artwork-manager__card-actions">
                <button
                  onClick={() => setEditingArtwork(artwork)}
                  className="artwork-manager__card-action"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingArtwork(artwork)}
                  className="artwork-manager__card-action artwork-manager__card-action--delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="artwork-manager__empty">
          <p>No artworks yet. Add your first artwork to get started!</p>
        </div>
      )}

      {deletingArtwork && (
        <div className="artwork-manager__delete-overlay" onClick={() => setDeletingArtwork(null)}>
          <div className="artwork-manager__delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Artwork</h3>
            <p>Are you sure you want to delete &quot;{deletingArtwork.title}&quot;?</p>
            <div className="artwork-manager__delete-actions">
              <button
                onClick={() => setDeletingArtwork(null)}
                className="artwork-manager__delete-button artwork-manager__delete-button--cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="artwork-manager__delete-button artwork-manager__delete-button--confirm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

