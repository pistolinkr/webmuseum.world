'use client';

import { useState, useRef, FormEvent } from 'react';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile, generateProfilePictureKey } from '@/lib/storage';

interface ProfileEditFormProps {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProfileEditForm({ user, onSuccess, onCancel }: ProfileEditFormProps) {
  const { updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: user.displayName || user.name || '',
    bio: user.bio || '',
    category: user.category || '',
    location: user.location || '',
    website: user.website || '',
    instagram: user.socialLinks?.instagram || '',
    twitter: user.socialLinks?.twitter || '',
    avatarUrl: user.avatarUrl || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateUserProfile({
        displayName: formData.displayName || undefined,
        bio: formData.bio || undefined,
        category: formData.category || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        socialLinks: {
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
          website: formData.website || undefined,
        },
        avatarUrl: formData.avatarUrl || undefined,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <h2 className="profile-edit-form__title">Edit Profile</h2>

      {error && (
        <div className="profile-edit-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="profile-edit-form__field">
        <label className="profile-edit-form__label">Profile Picture</label>
        <ProfileImageUpload
          userId={user.id}
          currentImageUrl={formData.avatarUrl}
          onImageUploaded={(url) => setFormData({ ...formData, avatarUrl: url })}
          onError={(err) => setError(err)}
        />
      </div>

      <div className="profile-edit-form__field">
        <label htmlFor="displayName" className="profile-edit-form__label">
          Display Name *
        </label>
        <input
          id="displayName"
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          required
          className="profile-edit-form__input"
          placeholder="Your display name"
        />
      </div>

      <div className="profile-edit-form__field">
        <label htmlFor="bio" className="profile-edit-form__label">
          Bio
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="profile-edit-form__textarea"
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </div>

      <div className="profile-edit-form__row">
        <div className="profile-edit-form__field">
          <label htmlFor="category" className="profile-edit-form__label">
            Category / Field
          </label>
          <input
            id="category"
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="profile-edit-form__input"
            placeholder="e.g., Digital Art, Photography"
          />
        </div>

        <div className="profile-edit-form__field">
          <label htmlFor="location" className="profile-edit-form__label">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="profile-edit-form__input"
            placeholder="e.g., New York, USA"
          />
        </div>
      </div>

      <div className="profile-edit-form__field">
        <label htmlFor="website" className="profile-edit-form__label">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="profile-edit-form__input"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div className="profile-edit-form__row">
        <div className="profile-edit-form__field">
          <label htmlFor="instagram" className="profile-edit-form__label">
            Instagram
          </label>
          <input
            id="instagram"
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            className="profile-edit-form__input"
            placeholder="@username"
          />
        </div>

        <div className="profile-edit-form__field">
          <label htmlFor="twitter" className="profile-edit-form__label">
            Twitter
          </label>
          <input
            id="twitter"
            type="text"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            className="profile-edit-form__input"
            placeholder="@username"
          />
        </div>
      </div>

      <div className="profile-edit-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="profile-edit-form__button profile-edit-form__button--secondary"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="profile-edit-form__button profile-edit-form__button--primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// Profile Image Upload Component
function ProfileImageUpload({
  userId,
  currentImageUrl,
  onImageUploaded,
  onError,
}: {
  userId: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError?.('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const key = generateProfilePictureKey(userId, extension);

      const imageUrl = await uploadFile(file, key, (progress) => {
        setUploadProgress(progress);
      });

      if (imageUrl) {
        onImageUploaded(imageUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      onError?.(err.message || 'Failed to upload image');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('');
  };

  return (
    <div className="profile-image-upload">
      <div className="profile-image-upload__preview">
        {previewUrl ? (
          <div className="profile-image-upload__preview-container">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="profile-image-upload__preview-image"
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="profile-image-upload__remove"
                aria-label="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="profile-image-upload__placeholder">
            <svg
              className="profile-image-upload__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="profile-image-upload__placeholder-text">Click to upload</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="profile-image-upload__progress">
          <div className="profile-image-upload__progress-bar">
            <div
              className="profile-image-upload__progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="profile-image-upload__progress-text">
            {Math.round(uploadProgress)}%
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="profile-image-upload__input"
        id="profile-image-upload-input"
      />
      <label
        htmlFor="profile-image-upload-input"
        className={`profile-image-upload__label ${uploading ? 'profile-image-upload__label--disabled' : ''}`}
      >
        {previewUrl ? 'Change Picture' : 'Upload Picture'}
      </label>
    </div>
  );
}

