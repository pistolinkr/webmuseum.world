import { Exhibition } from '@/types';

export const mockExhibitions: Exhibition[] = [
  {
    id: '1',
    title: 'Digital Horizons',
    description: 'An exploration of digital art in the modern age',
    curator: 'Jane Curator',
    date: '2024',
    artworks: [
      {
        id: 'artwork-1',
        title: 'Abstract Flow',
        artist: 'Alex Artist',
        imageUrl: '/images/artwork-1.jpg',
        caption: 'A flowing abstraction of digital colors',
        description: 'This piece explores the fluidity of digital media through abstract forms and vibrant color gradients. The artist seeks to capture the ephemeral nature of digital creation.',
        year: 2024,
        medium: 'Digital',
        dimensions: '1920 x 1080px'
      },
      {
        id: 'artwork-2',
        title: 'Urban Fragments',
        artist: 'Sam Creator',
        imageUrl: '/images/artwork-2.jpg',
        caption: 'Collage of urban landscapes',
        description: 'A digital collage combining multiple perspectives of urban environments, creating a fragmented narrative of city life and architecture.',
        year: 2023,
        medium: 'Digital Collage',
        dimensions: '2560 x 1440px'
      },
      {
        id: 'artwork-3',
        title: 'Silent Echoes',
        artist: 'Morgan Visual',
        imageUrl: '/images/artwork-3.jpg',
        caption: 'Minimalist composition with subtle textures',
        description: 'A minimalist approach to digital art, focusing on texture, negative space, and the subtle interplay between light and shadow.',
        year: 2024,
        medium: 'Digital',
        dimensions: '2048 x 1536px'
      }
    ]
  }
];

export function getExhibitionById(id: string): Exhibition | undefined {
  return mockExhibitions.find(ex => ex.id === id);
}

