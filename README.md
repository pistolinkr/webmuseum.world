# WebMuseum World

A web exhibition platform supporting three viewing modes:
- Narrative Scroll Exhibition (Story)
- Artwork Gallery View (Gallery)
- 3D Exhibition Space (Space)

## Project Structure

```
webmuseum.world/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
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
│       ├── StoryView.tsx          # Story scroll component
│       ├── GalleryView.tsx        # Gallery grid component
│       └── SpaceView.tsx          # 3D space component
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
- Grid layout of artworks
- Click to open lightbox/zoom view
- Shows artwork details

### SpaceView
- Three.js/React Three Fiber 3D space
- Walkable exhibition space
- Artwork frames on walls

## Routes

- `/` - Home page listing exhibitions
- `/exhibition/[id]/story` - Story view
- `/exhibition/[id]/gallery` - Gallery view
- `/exhibition/[id]/space` - 3D space view

## Development

```bash
npm install
npm run dev
```

