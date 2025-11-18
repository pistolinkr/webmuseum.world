// Firebase Storage utilities for uploading user profile images
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';

/**
 * Check if Firebase Storage is available
 */
function ensureStorage() {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please check your Firebase configuration and ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set.');
  }
  return storage;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 */
export async function uploadToFirebaseStorage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  const storageInstance = ensureStorage();
  
  console.log('Firebase Storage initialized:', !!storageInstance);
  console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes');
  console.log('Upload path:', path);

  try {
    console.log('Starting upload to Firebase Storage:', path);
    const storageRef = ref(storageInstance, path);
    
    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error('Upload timeout after 60 seconds. Please check your internet connection and Firebase Storage configuration.'));
      }, 60000); // 60 second timeout
      
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${Math.round(progress)}%`);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          clearTimeout(timeout);
          console.error('Upload error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Provide more helpful error messages
          let errorMessage = 'Failed to upload image. ';
          if (error.code === 'storage/unauthorized') {
            errorMessage += 'You do not have permission to upload. Please check Firebase Storage rules.';
          } else if (error.code === 'storage/canceled') {
            errorMessage += 'Upload was canceled.';
          } else if (error.code === 'storage/unknown') {
            errorMessage += 'Unknown error occurred. Please check Firebase Storage configuration.';
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage += 'Storage quota exceeded. Please contact support.';
          } else {
            errorMessage += error.message || 'Please try again.';
          }
          
          reject(new Error(errorMessage));
        },
        async () => {
          clearTimeout(timeout);
          // Upload completed successfully
          try {
            console.log('Upload completed, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            resolve(downloadURL);
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            reject(new Error('Upload completed but failed to get download URL: ' + (error.message || 'Unknown error')));
          }
        }
      );
    });
  } catch (error: any) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Generate path for user profile picture
 */
export function getUserProfilePicturePath(userId: string, extension: string): string {
  const timestamp = Date.now();
  return `users/${userId}/avatar-${timestamp}.${extension}`;
}

/**
 * Generate path for user cover image
 */
export function getUserCoverImagePath(userId: string, extension: string): string {
  const timestamp = Date.now();
  return `users/${userId}/cover-${timestamp}.${extension}`;
}

/**
 * Generate path for artwork image
 */
export function getArtworkImagePath(exhibitionId: string, artworkId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/artworks/${artworkId}-${timestamp}.${extension}`;
}

/**
 * Generate path for exhibition thumbnail
 */
export function getExhibitionThumbnailPath(exhibitionId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/thumbnail-${timestamp}.${extension}`;
}

