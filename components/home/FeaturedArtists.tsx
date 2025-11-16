'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Artist } from '@/types';
import SmoothCorner from '@/components/ui/SmoothCorner';

export default function FeaturedArtists() {
  // Note: Artists are now users who create exhibitions
  // For now, show empty state or remove this section
  const artists: Artist[] = [];

  return (
    <section className="featured-artists">
      <div className="featured-artists__container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="featured-artists__title"
        >
          Artists
        </motion.h2>
      </div>
      {artists.length > 0 ? (
        <div className="featured-artists__grid">
          {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut', delay: index * 0.1 }}
          >
            <SmoothCorner radius={20}>
              <Link href={`/artist/${artist.id}`} className="artist-card" prefetch={true}>
                {artist.profileImageUrl && (
                  <div className="artist-card__image">
                    <img src={artist.profileImageUrl} alt={artist.name} />
                  </div>
                )}
                <div className="artist-card__content">
                  <h3 className="artist-card__name">{artist.name}</h3>
                  {artist.category && (
                    <p className="artist-card__category">{artist.category}</p>
                  )}
                  {artist.location && (
                    <p className="artist-card__location">{artist.location}</p>
                  )}
                </div>
              </Link>
            </SmoothCorner>
          </motion.div>
        ))}
        </div>
      ) : (
        <div className="featured-artists__empty">
          <p>No artists available yet.</p>
        </div>
      )}
      <div className="featured-artists__container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.6 }}
          className="featured-artists__cta"
        >
          <SmoothCorner radius={16}>
            <Link href="/artist" className="featured-artists__link" prefetch={true}>
              View all artists →
            </Link>
          </SmoothCorner>
        </motion.div>
      </div>
    </section>
  );
}

