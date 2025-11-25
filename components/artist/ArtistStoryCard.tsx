'use client';

import { Artist } from '@/types';

interface ArtistStoryCardProps {
  artist: Artist;
}

export default function ArtistStoryCard({ artist }: ArtistStoryCardProps) {
  // For now, we'll use a placeholder for creative process/philosophy
  // In the future, this could come from artist.creativeProcess or artist.philosophy fields
  const creativeProcess = artist.bio 
    ? `Building on ${artist.name}'s artistic foundation, their creative process reflects a deep commitment to ${artist.category || 'artistic expression'}. Through careful observation and thoughtful execution, each work represents a moment of connection between the artist's vision and the viewer's experience.`
    : `The creative journey of ${artist.name} is marked by a dedication to exploring the boundaries of ${artist.category || 'artistic expression'}, where technique and emotion converge to create meaningful visual narratives.`;

  return (
    <div className="artist-story-card">
      <h2 className="artist-story-card__title">Creative Process & Philosophy</h2>
      <div className="artist-story-card__content">
        <p className="artist-story-card__text">{creativeProcess}</p>
        <div className="artist-story-card__quote">
          <svg className="artist-story-card__quote-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 9.464-9.57V2.846c-3.776 0-7.286 2.748-7.286 6.355v4.714h7.286v7.085h-9.464zm-14.017 0v-7.391c0-5.704 3.748-9.57 9.464-9.57V2.846c-3.776 0-7.286 2.748-7.286 6.355v4.714h7.286v7.085H0z" fill="currentColor"/>
          </svg>
          <p className="artist-story-card__quote-text">
            Art is not what you see, but what you make others see.
          </p>
        </div>
      </div>
    </div>
  );
}



