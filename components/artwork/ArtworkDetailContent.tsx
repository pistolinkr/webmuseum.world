'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Artwork } from '@/types';

interface ArtworkDetailContentProps {
  artwork: Artwork;
  exhibitionId: string;
}

export default function ArtworkDetailContent({ artwork, exhibitionId }: ArtworkDetailContentProps) {
  const [isWideImage, setIsWideImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !artwork.imageUrl) return;

    const handleImageLoad = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      // 가로가 세로보다 1.5배 이상 긴 경우 세로 레이아웃으로 변경
      setIsWideImage(aspectRatio > 1.5);
    };

    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener('load', handleImageLoad);
      return () => img.removeEventListener('load', handleImageLoad);
    }
  }, [artwork.imageUrl]);

  return (
    <div className={`artwork-detail-page__content ${isWideImage ? 'artwork-detail-page__content--vertical' : ''}`}>
      <div className="artwork-detail-page__image-section">
        <div className="artwork-detail-page__image">
          {artwork.imageUrl && !imageError ? (
            <img
              ref={imgRef}
              src={artwork.imageUrl}
              alt={artwork.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
              }}
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <div className="artwork-detail-page__image-placeholder" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>🖼️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 300 }}>{artwork.title}</div>
            </div>
          )}
        </div>
      </div>

      <div className="artwork-detail-page__info">
        <h1 className="artwork-detail-page__title">{artwork.title}</h1>
        <p className="artwork-detail-page__artist">
          by <Link href={`/artist/${artwork.artistId || ''}`} className="artwork-detail-page__artist-link" prefetch={true}>
            {artwork.artist}
          </Link>
        </p>

        {artwork.caption && (
          <p className="artwork-detail-page__caption">{artwork.caption}</p>
        )}

        {artwork.description && (
          <div className="artwork-detail-page__description">
            <h2 className="artwork-detail-page__section-title">Description</h2>
            <p className="artwork-detail-page__text">{artwork.description}</p>
          </div>
        )}

        <div className="artwork-detail-page__metadata">
          {artwork.year && (
            <div className="artwork-detail-page__meta-item">
              <span className="artwork-detail-page__meta-label">Year</span>
              <span className="artwork-detail-page__meta-value">{artwork.year}</span>
            </div>
          )}
          {artwork.medium && (
            <div className="artwork-detail-page__meta-item">
              <span className="artwork-detail-page__meta-label">Medium</span>
              <span className="artwork-detail-page__meta-value">{artwork.medium}</span>
            </div>
          )}
          {artwork.dimensions && (
            <div className="artwork-detail-page__meta-item">
              <span className="artwork-detail-page__meta-label">Dimensions</span>
              <span className="artwork-detail-page__meta-value">{artwork.dimensions}</span>
            </div>
          )}
        </div>

        {artwork.genre && artwork.genre.length > 0 && (
          <div className="artwork-detail-page__tags">
            <h2 className="artwork-detail-page__section-title">Tags</h2>
            <div className="artwork-detail-page__tags-list">
              {artwork.genre.map(genre => (
                <span key={genre} className="artwork-detail-page__tag">{genre}</span>
              ))}
            </div>
          </div>
        )}

        <div className="artwork-detail-page__ctas">
          <Link 
            href={`/exhibition/${exhibitionId}/story`}
            className="artwork-detail-page__cta"
            prefetch={true}
          >
            See in Story
          </Link>
          <Link 
            href={`/exhibition/${exhibitionId}/space`}
            className="artwork-detail-page__cta artwork-detail-page__cta--secondary"
            prefetch={true}
          >
            Enter the Space
          </Link>
        </div>
      </div>
    </div>
  );
}

