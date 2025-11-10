# AWS S3 + CloudFront Setup Guide

## 1. S3 Bucket 생성

1. AWS Console → S3 → Create bucket
2. Bucket name: `webmuseum-media` (또는 원하는 이름)
3. Region: `ap-northeast-2` (Seoul) 또는 `us-east-1`
4. **Block Public Access 설정 해제** (또는 특정 정책으로 제어)
5. Create bucket

## 2. S3 Bucket Policy 설정

버킷 → Permissions → Bucket Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## 3. CORS 설정

버킷 → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 4. CloudFront Distribution 생성

1. AWS Console → CloudFront → Create distribution
2. **Origin Domain**: S3 bucket 선택 (예: `webmuseum-media.s3.ap-northeast-2.amazonaws.com`)
3. **Origin Access**: Origin Access Control (OAC) 또는 Public
4. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
5. **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
6. **Cache Policy**: CachingOptimized 또는 Custom
7. Create distribution
8. 배포 완료 후 **Distribution Domain Name** 복사 (예: `d1234567890abc.cloudfront.net`)

## 5. IAM User 생성 (업로드용)

1. AWS Console → IAM → Users → Create user
2. User name: `webmuseum-uploader`
3. **Attach policies directly**: `AmazonS3FullAccess` 또는 커스텀 정책
4. Create user
5. **Security credentials** 탭 → Create access key
6. Access key ID와 Secret access key 저장

## 6. 환경 변수 설정

`.env.local` 파일에 추가:

```bash
NEXT_PUBLIC_STORAGE_PROVIDER=s3
NEXT_PUBLIC_AWS_REGION=ap-northeast-2
NEXT_PUBLIC_STORAGE_BUCKET=webmuseum-media
NEXT_PUBLIC_CLOUDFRONT_URL=https://d1234567890abc.cloudfront.net
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
```

## 7. Vercel 환경 변수 설정

Vercel Dashboard → Project → Settings → Environment Variables에 위 변수들 추가

**참고:**
- `NEXT_PUBLIC_*` 변수는 클라이언트에서 접근 가능
- `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`는 서버 사이드에서만 사용 (Vercel 환경 변수로 설정)

