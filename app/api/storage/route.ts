import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// This API route handles secure file uploads/deletes
// Keeps credentials server-side

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'upload') {
    // Generate presigned URL for upload
    const key = searchParams.get('key');
    const type = searchParams.get('type');
    
    if (!key || !type) {
      return NextResponse.json({ error: 'Missing key or type' }, { status: 400 });
    }

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'r2';
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || '';

    if (!bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
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
        Key: key,
        ContentType: type,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return NextResponse.json({ url });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'r2';
  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '';
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY || '';

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
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
      Key: key,
    });

    await s3Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
