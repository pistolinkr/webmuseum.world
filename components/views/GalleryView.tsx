'use client';

import { useEffect, useRef } from 'react';
import { Artwork } from '@/types';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';

interface GalleryViewProps {
  artworks: Artwork[];
}

export default function GalleryView({ artworks }: GalleryViewProps) {
  const pswpRef = useRef<PhotoSwipe | null>(null);
  const pswpElementRef = useRef<HTMLDivElement>(null);

  const openPhotoSwipe = (index: number) => {
    if (!pswpElementRef.current) return;

    const items = artworks.map((artwork) => ({
      src: artwork.imageUrl,
      width: 1920,
      height: 1080,
      alt: artwork.title,
      title: `${artwork.title} - ${artwork.artist}`,
    }));

    const options: PhotoSwipe.Options = {
      dataSource: items,
      index: index,
      showHideAnimationType: 'fade',
      bgOpacity: 0.95,
      spacing: 0.1,
      allowPanToNext: true,
      wheelToZoom: true,
      pinchToClose: false,
      closeOnVerticalDrag: true,
      showAnimationDuration: 300,
      hideAnimationDuration: 300,
    };

    if (pswpRef.current) {
      pswpRef.current.loadAndOpen(index, options);
    } else {
      pswpRef.current = new PhotoSwipe(options);
      pswpRef.current.init();
    }
  };

  useEffect(() => {
    return () => {
      if (pswpRef.current) {
        pswpRef.current.destroy();
        pswpRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div style={{ paddingTop: '4rem', paddingBottom: '8rem', paddingLeft: '2rem', paddingRight: '2rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {artworks.map((artwork, index) => (
            <div
              key={artwork.id}
              onClick={() => openPhotoSwipe(index)}
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
                  backgroundColor: 'var(--bg-secondary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ color: 'var(--text-tertiary)' }}>Image: {artwork.title}</span>
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {artwork.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {artwork.artist}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div ref={pswpElementRef} className="pswp" tabIndex={-1} role="dialog" aria-hidden="true">
        <div className="pswp__bg"></div>
        <div className="pswp__scroll-wrap">
          <div className="pswp__container">
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
            <div className="pswp__item"></div>
          </div>
          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              <div className="pswp__counter"></div>
              <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>
              <button className="pswp__button pswp__button--share" title="Share"></button>
              <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
              <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
              <div className="pswp__preloader">
                <div className="pswp__preloader__icn">
                  <div className="pswp__preloader__cut">
                    <div className="pswp__preloader__donut"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
              <div className="pswp__share-tooltip"></div>
            </div>
            <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
            <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
            <div className="pswp__caption">
              <div className="pswp__caption__center"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
