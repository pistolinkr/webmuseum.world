'use client';

import { Artist } from '@/types';

interface ArtistInfoCardProps {
  artist: Artist;
}

export default function ArtistInfoCard({ artist }: ArtistInfoCardProps) {
  return (
    <div className="artist-info-card">
      <div className="artist-info-card__section">
        <h2 className="artist-info-card__title">About</h2>
        {artist.bio && (
          <p className="artist-info-card__bio">{artist.bio}</p>
        )}
      </div>

      {(artist.category || artist.location) && (
        <div className="artist-info-card__section">
          <h3 className="artist-info-card__subtitle">Details</h3>
          <div className="artist-info-card__tags">
            {artist.category && (
              <span className="artist-info-card__tag">
                {artist.category}
              </span>
            )}
            {artist.location && (
              <span className="artist-info-card__tag artist-info-card__tag--location">
                <svg className="artist-info-card__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0C4.134 0 1 3.134 1 7c0 4.5 7 9 7 9s7-4.5 7-9c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S6.619 4.5 8 4.5s2.5 1.119 2.5 2.5S9.381 9.5 8 9.5z" fill="currentColor"/>
                </svg>
                {artist.location}
              </span>
            )}
          </div>
        </div>
      )}

      {artist.socialLinks && (artist.socialLinks.instagram || artist.socialLinks.twitter || artist.website) && (
        <div className="artist-info-card__section">
          <h3 className="artist-info-card__subtitle">Connect</h3>
          <div className="artist-info-card__social">
            {artist.website && (
              <a 
                href={artist.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="artist-info-card__social-link"
                aria-label="Visit website"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
                Website
              </a>
            )}
            {artist.socialLinks.instagram && (
              <a 
                href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="artist-info-card__social-link"
                aria-label="Visit Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            )}
            {artist.socialLinks.twitter && (
              <a 
                href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="artist-info-card__social-link"
                aria-label="Visit Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
                Twitter
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}







