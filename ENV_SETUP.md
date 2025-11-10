# Environment Variables Setup

## Firebase Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Storage Provider Configuration

### Option 1: Cloudflare R2

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=r2
NEXT_PUBLIC_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_STORAGE_BUCKET=your_bucket_name
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
```

### Option 2: AWS S3 + CloudFront CDN

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=s3
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_STORAGE_BUCKET=your_bucket_name
NEXT_PUBLIC_CLOUDFRONT_URL=https://your-cloudfront-distribution-id.cloudfront.net
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
```

**Setup Steps:**
1. Create S3 bucket in AWS Console
2. Create CloudFront distribution with S3 bucket as origin
3. Set CloudFront distribution URL in `NEXT_PUBLIC_CLOUDFRONT_URL`
4. Configure S3 bucket CORS and bucket policy for public read access
5. Set up IAM user with S3 upload permissions for `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY`

**Note:** Keep `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY` secure. These should only be used server-side in API routes.

