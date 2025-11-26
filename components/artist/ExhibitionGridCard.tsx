'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Exhibition } from '@/types';

interface ExhibitionGridCardProps {
  exhibition: Exhibition;
}

export default function ExhibitionGridCard({ exhibition }: ExhibitionGridCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const thumbnailUrl = exhibition.thumbnailUrl || 
    (exhibition.artworks && exhibition.artworks.length > 0 
      ? exhibition.artworks[0].imageUrl 
      : null);

  return (
    <Link 
      href={`/exhibition/${exhibition.id}/story`}
      className="exhibition-grid-card"
    >
      <div className="exhibition-grid-card__image-wrapper">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={exhibition.title}
            className="exhibition-grid-card__image"
          />
        ) : (
          <div className="exhibition-grid-card__placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <div className="exhibition-grid-card__overlay">
          <button
            onClick={handleFavorite}
            className={`exhibition-grid-card__action exhibition-grid-card__action--favorite ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button
            onClick={handleLike}
            className={`exhibition-grid-card__action exhibition-grid-card__action--like ${isLiked ? 'active' : ''}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="exhibition-grid-card__content">
        <h3 className="exhibition-grid-card__title">{exhibition.title}</h3>
        {exhibition.description && (
          <p className="exhibition-grid-card__description">
            {exhibition.description.length > 120 
              ? `${exhibition.description.substring(0, 120)}...` 
              : exhibition.description}
          </p>
        )}
        <div className="exhibition-grid-card__meta">
          {exhibition.date && (
            <span className="exhibition-grid-card__date">{exhibition.date}</span>
          )}
          {exhibition.artworks && exhibition.artworks.length > 0 && (
            <span className="exhibition-grid-card__count">
              {exhibition.artworks.length} artwork{exhibition.artworks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}







