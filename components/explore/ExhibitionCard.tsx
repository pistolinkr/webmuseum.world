'use client';

import Link from 'next/link';
import { Exhibition } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ExhibitionCardProps {
  exhibition: Exhibition;
  showUser?: boolean;
}

export default function ExhibitionCard({ exhibition, showUser = true }: ExhibitionCardProps) {
  const { userData } = useAuth();
  const isOwner = userData?.id === exhibition.userId;

  return (
    <Link 
      href={`/exhibition/${exhibition.id}/story`}
      className="explore-exhibition-card"
      prefetch={true}
    >
      {exhibition.thumbnailUrl && (
        <div className="explore-exhibition-card__thumbnail">
          <img
            src={exhibition.thumbnailUrl}
            alt={exhibition.title}
            className="explore-exhibition-card__image"
          />
        </div>
      )}
      <div className="explore-exhibition-card__content">
        <h3 className="explore-exhibition-card__title">{exhibition.title}</h3>
        {exhibition.description && (
          <p className="explore-exhibition-card__description">
            {exhibition.description.length > 150
              ? `${exhibition.description.substring(0, 150)}...`
              : exhibition.description}
          </p>
        )}
        <div className="explore-exhibition-card__meta">
          {exhibition.date && (
            <span className="explore-exhibition-card__date">{exhibition.date}</span>
          )}
          {exhibition.artworks && exhibition.artworks.length > 0 && (
            <span className="explore-exhibition-card__artwork-count">
              {exhibition.artworks.length} artwork{exhibition.artworks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {exhibition.genre && exhibition.genre.length > 0 && (
          <div className="explore-exhibition-card__tags">
            {exhibition.genre.slice(0, 3).map((tag, index) => (
              <span key={index} className="explore-exhibition-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {showUser && exhibition.userId && (
          <div className="explore-exhibition-card__user">
            <Link
              href={`/user/${exhibition.userId}`}
              className="explore-exhibition-card__user-link"
              onClick={(e) => e.stopPropagation()}
              prefetch={true}
            >
              View Creator →
            </Link>
          </div>
        )}
        {isOwner && (
          <span className="explore-exhibition-card__badge explore-exhibition-card__badge--owner">
            Your Museum
          </span>
        )}
        {exhibition.isPublic === false && (
          <span className="explore-exhibition-card__badge explore-exhibition-card__badge--private">
            Private
          </span>
        )}
      </div>
    </Link>
  );
}

