'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllExhibitions } from '@/lib/firestore';
import { Exhibition } from '@/types';
import { useEffect, useState } from 'react';
import SmoothCorner from '@/components/ui/SmoothCorner';

export default function FeaturedExhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    async function loadExhibitions() {
      try {
        const data = await getAllExhibitions();
        // Filter featured exhibitions or take first 4
        const featured = data.filter(ex => ex.featured).slice(0, 4);
        setExhibitions(featured.length > 0 ? featured : data.slice(0, 4));
      } catch (error) {
        console.error('Error loading exhibitions:', error);
      }
    }
    loadExhibitions();
  }, []);

  return (
    <section className="featured-exhibitions">
      <div className="featured-exhibitions__container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="featured-exhibitions__title"
        >
          Featured Exhibitions
        </motion.h2>
      </div>
      {exhibitions.length > 0 ? (
        <div className="featured-exhibitions__grid">
          {exhibitions.map((exhibition, index) => (
          <motion.div
            key={exhibition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut', delay: index * 0.1 }}
          >
            <SmoothCorner radius={20}>
              <Link href={`/exhibition/${exhibition.id}/story`} className="featured-exhibition-card" prefetch={true}>
                <div className="featured-exhibition-card__content">
                  <h3 className="featured-exhibition-card__title">{exhibition.title}</h3>
                  {exhibition.description && (
                    <p className="featured-exhibition-card__description">
                      {exhibition.description}
                    </p>
                  )}
                  {exhibition.date && (
                    <p className="featured-exhibition-card__date">{exhibition.date}</p>
                  )}
                </div>
              </Link>
            </SmoothCorner>
          </motion.div>
        ))}
        </div>
      ) : (
        <div className="featured-exhibitions__empty">
          <p>No exhibitions available yet.</p>
        </div>
      )}
    </section>
  );
}

