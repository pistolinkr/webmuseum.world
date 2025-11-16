'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { Artwork } from '@/types';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';

type PhotoSwipeUI = {
  element?: HTMLElement | null;
};

const getPhotoSwipeElement = (instance: PhotoSwipe | null): HTMLElement | null => {
  const ui = instance?.ui as PhotoSwipeUI | undefined;
  return ui?.element ?? null;
};

interface GalleryViewProps {
  artworks: Artwork[];
  exhibitionId: string;
}

export default function GalleryView({ artworks, exhibitionId }: GalleryViewProps) {
  const pswpRef = useRef<PhotoSwipe | null>(null);
  const pswpElementRef = useRef<HTMLDivElement>(null);
  const isDestroyingRef = useRef(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Detect Safari browser
  const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Safely destroy PhotoSwipe instance
  const destroyPhotoSwipe = useCallback(() => {
    if (!pswpRef.current || isDestroyingRef.current) return;
    
    isDestroyingRef.current = true;
    const instance = pswpRef.current;
    pswpRef.current = null;

    // Safari requires more careful DOM manipulation
    const destroyDelay = isSafari ? 500 : 350;
    const cleanupDelay = isSafari ? 100 : 50;

    try {
      // Check if instance has a UI element and if it's in the DOM
      const uiElement = getPhotoSwipeElement(instance);
      const isInDOM = uiElement && uiElement.parentNode && document.body.contains(uiElement);
      
      if (isInDOM) {
        // Close if open
        try {
          // Check opened state safely
          const isOpened = instance.opened || (instance as any).isOpen || false;
          if (isOpened) {
            instance.close();
            // Wait for close animation (longer delay for Safari)
            setTimeout(() => {
              try {
                // Double-check DOM before destroying
                const element = getPhotoSwipeElement(instance);
                if (element?.parentNode && document.body.contains(element)) {
                  instance.destroy();
                } else {
                  // DOM already removed, just clear reference
                }
              } catch (e) {
                // Ignore destroy errors - DOM may already be removed
              }
              isDestroyingRef.current = false;
            }, destroyDelay);
            return;
          }
        } catch (e) {
          // Ignore close errors
        }
      }
      
      // Not open or no UI element, destroy immediately (with Safari delay)
      setTimeout(() => {
        try {
          // Final check before destroy
          const element = getPhotoSwipeElement(instance);
          if (element?.parentNode && document.body.contains(element)) {
            instance.destroy();
          }
        } catch (e) {
          // Ignore destroy errors - DOM may already be removed
        }
        isDestroyingRef.current = false;
      }, cleanupDelay);
    } catch (e) {
      // If any error occurs, just mark as not destroying
      isDestroyingRef.current = false;
    }
  }, [isSafari]);

  const openPhotoSwipe = useCallback((index: number) => {
    if (!pswpElementRef.current || isDestroyingRef.current) return;

    const items = artworks.map((artwork) => ({
      src: artwork.imageUrl,
      width: 1920,
      height: 1080,
      alt: artwork.title,
      title: `${artwork.title} - ${artwork.artist}`,
      // Add link to artwork detail page
      link: `/exhibition/${exhibitionId}/artwork/${artwork.id}`,
    }));

    // Destroy existing instance synchronously before creating new one
    if (pswpRef.current) {
      destroyPhotoSwipe();
      // Wait longer for Safari to ensure cleanup completes
      const waitTime = isSafari ? 150 : 50;
      setTimeout(() => {
        createAndOpenPhotoSwipe(items, index);
      }, waitTime);
    } else {
      createAndOpenPhotoSwipe(items, index);
    }
  }, [artworks, destroyPhotoSwipe, isSafari]);

  const createAndOpenPhotoSwipe = useCallback((items: any[], index: number) => {
    if (!pswpElementRef.current || isDestroyingRef.current) return;

    const options = {
      dataSource: items,
      index: index,
      showHideAnimationType: 'fade' as const,
      bgOpacity: 0.95,
      spacing: 0.1,
      allowPanToNext: true,
      wheelToZoom: true,
      pinchToClose: false,
      closeOnVerticalDrag: true,
      showAnimationDuration: 300,
      hideAnimationDuration: 300,
    };

    try {
      // Create new PhotoSwipe instance
      pswpRef.current = new PhotoSwipe(options);
      pswpRef.current.init();
    } catch (e) {
      console.error('Error creating PhotoSwipe instance:', e);
      pswpRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      // Safari-safe cleanup: use multiple requestAnimationFrame delays for Safari
      if (isSafari) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              destroyPhotoSwipe();
            });
          });
        });
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            destroyPhotoSwipe();
          });
        });
      }
    };
  }, [destroyPhotoSwipe, isSafari]);

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
            <Link
              key={artwork.id}
              href={`/exhibition/${exhibitionId}/artwork/${artwork.id}`}
              prefetch={true}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                textDecoration: 'none',
                color: 'inherit',
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
                  backgroundColor: 'var(--bg-secondary)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {artwork.imageUrl && !imageErrors.has(artwork.id) ? (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    loading="lazy"
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(artwork.id));
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4rem',
                    color: 'var(--text-tertiary)',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🖼️</div>
                      <div>{artwork.title}</div>
                    </div>
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {artwork.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {artwork.artist}
              </p>
            </Link>
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
