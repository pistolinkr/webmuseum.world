// Media storage utilities for Cloudflare R2 / AWS S3
// Supports both Cloudflare R2 (S3-compatible) and AWS S3

export type StorageProvider = 'r2' | 's3';

interface StorageConfig {
  provider: StorageProvider;
  endpoint?: string; // Required for R2, optional for S3
  region?: string; // Required for S3
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

// Get storage configuration from environment variables
function getStorageConfig(): StorageConfig | null {
  const provider = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER as StorageProvider) || 'r2';
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || '';

  if (!bucket || !accessKeyId || !secretAccessKey) {
    console.warn('Storage configuration incomplete');
    return null;
  }

  if (provider === 'r2') {
    const endpoint = process.env.NEXT_PUBLIC_R2_ENDPOINT || '';
    if (!endpoint) {
      console.warn('R2 endpoint not configured');
      return null;
    }
    return { provider, endpoint, bucket, accessKeyId, secretAccessKey };
  } else {
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    return { provider, region, bucket, accessKeyId, secretAccessKey };
  }
}

// Generate presigned URL for uploading
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string | null> {
  // This would typically be handled by a backend API endpoint
  // to keep credentials secure
  const config = getStorageConfig();
  if (!config) return null;

  // Call server-side API route
  try {
    const response = await fetch(`/api/storage?action=upload&key=${encodeURIComponent(key)}&type=${encodeURIComponent(contentType)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return null;
  }
}

// Generate public URL for media
export function getMediaUrl(key: string): string {
  const config = getStorageConfig();
  if (!config) return '';

  if (config.provider === 'r2') {
    // Cloudflare R2 public URL format
    const accountId = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID || '';
    return `https://${accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`;
  } else {
    // AWS S3 with CloudFront CDN
    const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL;
    if (cloudfrontUrl) {
      // Use CloudFront CDN URL if configured
      return `${cloudfrontUrl}/${key}`;
    }
    // Fallback to S3 direct URL
    const region = config.region || 'us-east-1';
    return `https://${config.bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}

// Upload file (client-side, requires presigned URL)
export async function uploadFile(
  file: File,
  key: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    // Get presigned URL from API
    const uploadUrl = await getUploadUrl(key, file.type);
    if (!uploadUrl) return null;

    // Upload using fetch with progress tracking
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(getMediaUrl(key));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Delete file (requires backend API)
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Generate unique key for artwork image
export function generateArtworkKey(exhibitionId: string, artworkId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/artworks/${artworkId}-${timestamp}.${extension}`;
}

// Generate unique key for exhibition thumbnail
export function generateExhibitionThumbnailKey(exhibitionId: string, extension: string): string {
  const timestamp = Date.now();
  return `exhibitions/${exhibitionId}/thumbnail-${timestamp}.${extension}`;
}

// Generate unique key for user profile picture
export function generateProfilePictureKey(userId: string, extension: string): string {
  const timestamp = Date.now();
  return `users/${userId}/avatar-${timestamp}.${extension}`;
}

