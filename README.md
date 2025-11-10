# WebMuseum World

A web exhibition platform supporting three viewing modes:
- Narrative Scroll Exhibition (Story)
- Artwork Gallery View (Gallery)
- 3D Exhibition Space (Space)

## Tech Stack

### Frontend
- **Next.js 14** + **React 18** - CSR + SSR support
- **GSAP + ScrollTrigger** - Smooth narrative scroll animations
- **PhotoSwipe** - High-quality gallery viewer with zoom interaction
- **Three.js + React Three Fiber** - 3D exhibition space

### Backend & Storage
- **Firebase** - User & content management (Firestore, Auth, Storage)
- **Cloudflare R2 / AWS S3** - Efficient large media hosting

## Project Structure

```
webmuseum.world/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── api/
│   │   └── storage/
│   │       └── route.ts           # Storage API (presigned URLs)
│   └── exhibition/
│       └── [id]/
│           ├── layout.tsx         # Exhibition layout wrapper
│           ├── story/
│           │   └── page.tsx       # Story view page
│           ├── gallery/
│           │   └── page.tsx       # Gallery view page
│           └── space/
│               └── page.tsx       # Space view page
├── components/
│   ├── Header.tsx                 # Site header
│   ├── ModeSwitcher.tsx          # Bottom navigation switcher
│   ├── ExhibitionLayoutClient.tsx # Client wrapper for layout
│   └── views/
│       ├── StoryView.tsx          # Story scroll component (GSAP)
│       ├── GalleryView.tsx        # Gallery grid component (PhotoSwipe)
│       └── SpaceView.tsx          # 3D space component (Three.js)
├── lib/
│   ├── firebase.ts                # Firebase initialization
│   ├── firestore.ts               # Firestore service layer
│   └── storage.ts                 # R2/S3 storage utilities
├── data/
│   └── mockExhibitions.ts         # Mock exhibition data
├── types/
│   └── index.ts                   # TypeScript types
├── package.json
├── tsconfig.json
└── next.config.js
```

## Key Components

### StoryView
- Uses GSAP ScrollTrigger for scroll animations
- Displays artworks in narrative sequence
- Fade-in animations on scroll

### GalleryView
- PhotoSwipe integration for high-quality lightbox
- Grid layout of artworks
- Click to open zoom view with smooth transitions
- Shows artwork details and metadata

### SpaceView
- Three.js/React Three Fiber 3D space
- Walkable exhibition space
- Artwork frames on walls
- OrbitControls for navigation

## Routes

- `/` - Home page listing exhibitions
- `/exhibition/[id]/story` - Story view
- `/exhibition/[id]/gallery` - Gallery view
- `/exhibition/[id]/space` - 3D space view

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory. See `ENV_SETUP.md` for detailed configuration.

**Required Firebase variables:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Storage Provider (choose one):**

Cloudflare R2:
```bash
NEXT_PUBLIC_STORAGE_PROVIDER=r2
NEXT_PUBLIC_R2_ENDPOINT=...
NEXT_PUBLIC_R2_ACCOUNT_ID=...
NEXT_PUBLIC_STORAGE_BUCKET=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
```

AWS S3:
```bash
NEXT_PUBLIC_STORAGE_PROVIDER=s3
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_STORAGE_BUCKET=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
```

### 3. Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

### Firebase Integration
- Firestore for exhibitions and artworks data
- Firebase Storage for media files
- Authentication ready (configured but not implemented)

### Storage Integration
- Cloudflare R2 or AWS S3 support
- Presigned URL generation for secure uploads
- Media URL utilities
- Server-side API routes for secure credential handling

### PhotoSwipe Gallery
- Smooth zoom and pan interactions
- Keyboard navigation support
- Touch gestures for mobile
- High-quality image rendering

## Development Notes

- All storage credentials are kept server-side via API routes
- Firebase config uses environment variables for security
- Mock data available in `data/mockExhibitions.ts` for development
- TypeScript types defined in `types/index.ts`

