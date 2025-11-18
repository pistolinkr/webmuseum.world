// Firebase Storage utilities - All storage operations use Firebase Storage
import { uploadToFirebaseStorage } from './firebaseStorage';

/**
 * Upload file to Firebase Storage
 * This replaces the old AWS/S3/R2 implementation
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    return await uploadToFirebaseStorage(file, path, onProgress);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Generate public URL for media
 * Firebase Storage URLs are already public, so we just return the URL
 */
export function getMediaUrl(url: string): string {
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, it should already be a Firebase Storage URL
  return url;
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { storage } = await import('./firebase');
    const { ref, deleteObject } = await import('firebase/storage');
    
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }
    
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Generate unique key for artwork image
 */
export function generateArtworkKey(exhibitionId: string, artworkId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/artworks/${artworkId}-${timestamp}.${extension}`;
}

/**
 * Generate unique key for exhibition thumbnail
 */
export function generateExhibitionThumbnailKey(exhibitionId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/thumbnail-${timestamp}.${extension}`;
}

/**
 * Generate unique key for user profile picture
 */
export function generateProfilePictureKey(userId: string, extension: string): string {
  const timestamp = Date.now();
  return `users/${userId}/avatar-${timestamp}.${extension}`;
}

/**
 * Generate unique key for user cover image
 */
export function generateCoverImageKey(userId: string, extension: string): string {
  const timestamp = Date.now();
  return `users/${userId}/cover-${timestamp}.${extension}`;
}
