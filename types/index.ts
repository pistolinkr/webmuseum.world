export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  imageUrl: string;
  caption: string;
  description: string;
  year?: number;
  medium?: string;
  dimensions?: string;
  genre?: string[];
  tags?: string[];
  emotion?: string[];
  exhibitionId: string;
  userId?: string; // User who created/owns this artwork
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Exhibition {
  id: string;
  title: string;
  description: string;
  statement?: string;
  artworks: Artwork[];
  curator?: string;
  artistIds?: string[];
  ownerId?: string; // User who created/owns this museum/exhibition (required for Firestore rules)
  userId?: string; // User who created/owns this museum/exhibition (backward compatibility)
  date?: string;
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  thumbnailUrl?: string;
  genre?: string[];
  tags?: string[];
  isPublic?: boolean; // Whether the exhibition is publicly visible
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  profileImageUrl?: string;
  category?: string; // 활동 분야
  location?: string; // 주로 활동하는 지역
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  exhibitions?: string[];
  artworks?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string; // Unique username/handle
  displayName?: string; // Public display name
  bio?: string; // User bio/description
  avatarUrl?: string; // Profile picture URL
  coverImageUrl?: string; // Cover/banner image URL
  category?: string; // Field/category of activity (e.g., "Digital Art", "Photography", "Sculpture")
  location?: string; // User location
  website?: string; // Personal website
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  bookmarkedExhibitions?: string[];
  purchasedItems?: string[];
  createdExhibitions?: string[]; // IDs of exhibitions created by this user
  createdArtworks?: string[]; // IDs of artworks created by this user
  settings?: {
    notifications?: {
      email?: boolean;
      exhibitionComments?: boolean;
      newFollowers?: boolean;
      exhibitionUpdates?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'private';
      defaultExhibitionVisibility?: 'public' | 'private';
      showEmail?: boolean;
      showLocation?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
  connectedAccounts?: {
    google?: boolean;
    github?: boolean;
    microsoft?: boolean;
    apple?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type ViewMode = 'story' | 'gallery' | 'space';

export interface SearchFilters {
  genre?: string[];
  medium?: string[];
  emotion?: string[];
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  startDate?: string;
  endDate?: string;
  artistId?: string;
  userId?: string;
}

