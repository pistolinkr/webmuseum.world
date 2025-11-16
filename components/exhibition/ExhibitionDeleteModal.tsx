'use client';

import { useState } from 'react';
import { deleteExhibition } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ExhibitionDeleteModalProps {
  exhibitionId: string;
  exhibitionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExhibitionDeleteModal({
  exhibitionId,
  exhibitionTitle,
  isOpen,
  onClose,
  onSuccess,
}: ExhibitionDeleteModalProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to delete an exhibition');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await deleteExhibition(exhibitionId, currentUser.uid);
      if (success) {
        onSuccess?.();
        router.push('/account');
        onClose();
      } else {
        setError('Failed to delete exhibition');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-modal" onClick={onClose}>
      <div className="delete-modal__content" onClick={(e) => e.stopPropagation()}>
        <h2 className="delete-modal__title">Delete Exhibition</h2>
        
        <p className="delete-modal__warning">
          Are you sure you want to delete <strong>"{exhibitionTitle}"</strong>?
        </p>
        <p className="delete-modal__warning-text">
          This action cannot be undone. All artworks in this exhibition will also be deleted.
        </p>

        {error && (
          <div className="delete-modal__error" role="alert">
            {error}
          </div>
        )}

        <div className="delete-modal__field">
          <label htmlFor="confirm" className="delete-modal__label">
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            id="confirm"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="delete-modal__input"
            placeholder="DELETE"
          />
        </div>

        <div className="delete-modal__actions">
          <button
            type="button"
            onClick={onClose}
            className="delete-modal__button delete-modal__button--cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="delete-modal__button delete-modal__button--delete"
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? 'Deleting...' : 'Delete Exhibition'}
          </button>
        </div>
      </div>
    </div>
  );
}

