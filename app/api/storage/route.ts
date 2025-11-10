import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// This API route handles secure file uploads/deletes
// Keeps credentials server-side

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET' && req.query.action === 'upload') {
    // Generate presigned URL for upload
    const { key, type } = req.query;
    
    if (!key || !type) {
      return res.status(400).json({ error: 'Missing key or type' });
    }

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'r2';
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || '';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      return res.status(500).json({ error: 'Storage not configured' });
    }

    try {
      const s3Client = new S3Client({
        region: provider === 'r2' ? 'auto' : process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
        endpoint: provider === 'r2' ? process.env.NEXT_PUBLIC_R2_ENDPOINT : undefined,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key as string,
        ContentType: type as string,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return res.json({ url });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete file
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'Missing key' });
    }

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'r2';
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || '';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      return res.status(500).json({ error: 'Storage not configured' });
    }

    try {
      const s3Client = new S3Client({
        region: provider === 'r2' ? 'auto' : process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
        endpoint: provider === 'r2' ? process.env.NEXT_PUBLIC_R2_ENDPOINT : undefined,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key as string,
      });

      await s3Client.send(command);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

