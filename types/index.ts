export interface Artwork {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  caption: string;
  description: string;
  year?: number;
  medium?: string;
  dimensions?: string;
}

export interface Exhibition {
  id: string;
  title: string;
  description: string;
  artworks: Artwork[];
  curator?: string;
  date?: string;
}

export type ViewMode = 'story' | 'gallery' | 'space';

