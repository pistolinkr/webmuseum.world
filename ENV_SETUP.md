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

### Option 2: AWS S3

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=s3
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_STORAGE_BUCKET=your_bucket_name
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
```

**Note:** Keep `STORAGE_ACCESS_KEY_ID` and `STORAGE_SECRET_ACCESS_KEY` secure. These should only be used server-side in API routes.

