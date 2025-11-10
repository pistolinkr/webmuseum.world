'use client';

import { useState, useEffect } from 'react';
import { Artwork } from '@/types';

interface GalleryViewProps {
  artworks: Artwork[];
}

export default function GalleryView({ artworks }: GalleryViewProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '8rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {artworks.map((artwork) => (
          <div
            key={artwork.id}
            onClick={() => setSelectedArtwork(artwork)}
            style={{
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '4/3',
                backgroundColor: '#f5f5f5',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#999' }}>Image: {artwork.title}</span>
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {artwork.title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              {artwork.artist}
            </p>
          </div>
        ))}
      </div>

      {selectedArtwork && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            style={{
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: '#1a1a1a',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#666' }}>Zoomed Image: {selectedArtwork.title}</span>
            </div>
            <div style={{ color: '#fff' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {selectedArtwork.title}
              </h2>
              <p style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#ccc' }}>
                {selectedArtwork.caption}
              </p>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem', color: '#999' }}>
                {selectedArtwork.description}
              </p>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <p>{selectedArtwork.artist}</p>
                {selectedArtwork.year && <p>{selectedArtwork.year}</p>}
                {selectedArtwork.medium && <p>{selectedArtwork.medium}</p>}
                {selectedArtwork.dimensions && <p>{selectedArtwork.dimensions}</p>}
              </div>
            </div>
            <button
              onClick={() => setSelectedArtwork(null)}
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

