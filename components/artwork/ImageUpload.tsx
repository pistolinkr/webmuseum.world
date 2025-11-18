'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { uploadToFirebaseStorage, getArtworkImagePath } from '@/lib/firebaseStorage';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  exhibitionId: string;
  artworkId?: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export default function ImageUpload({
  exhibitionId,
  artworkId,
  currentImageUrl,
  onImageUploaded,
  onError,
}: ImageUploadProps) {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('Image size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    setUploadProgress(0);

    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const tempId = artworkId || `temp-${Date.now()}`;
      const path = getArtworkImagePath(exhibitionId, tempId, extension);

      const imageUrl = await uploadToFirebaseStorage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if (imageUrl) {
        onImageUploaded(imageUrl);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      onError?.(err.message || 'Failed to upload image');
      setPreviewUrl(null);
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
    <div className="image-upload">
      <div className="image-upload__preview">
        {previewUrl ? (
          <div className="image-upload__preview-container">
            <img
              src={previewUrl}
              alt="Preview"
              className="image-upload__preview-image"
            />
            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="image-upload__remove"
                aria-label="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="image-upload__placeholder">
            <svg
              className="image-upload__icon"
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
            <p className="image-upload__placeholder-text">Click to upload image</p>
            <p className="image-upload__placeholder-hint">Max 10MB</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="image-upload__progress">
          <div className="image-upload__progress-bar">
            <div
              className="image-upload__progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="image-upload__progress-text">
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
        className="image-upload__input"
        id="image-upload-input"
      />
      <label
        htmlFor="image-upload-input"
        className={`image-upload__label ${uploading ? 'image-upload__label--disabled' : ''}`}
      >
        {previewUrl ? 'Change Image' : 'Select Image'}
      </label>
    </div>
  );
}

