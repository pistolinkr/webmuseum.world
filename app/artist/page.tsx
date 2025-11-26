'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllArtists } from '@/lib/firestore';
import { Artist } from '@/types';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadArtists() {
      try {
        const artistsData = await getAllArtists();
        setArtists(artistsData);
      } catch (error) {
        console.error('Error loading artists:', error);
      }
    }
    loadArtists();
  }, []);

  return (
    <main className="artists-page">
      <div className="artists-page__container">
        <h1 className="artists-page__title">Artists</h1>
        {artists.length > 0 ? (
          <div className="artists-page__grid">
            {artists.map((artist) => (
            <Link 
              key={artist.id} 
              href={`/artist/${artist.id}`}
              className="artist-profile-card"
              prefetch={true}
            >
              {artist.profileImageUrl && (
                <div className="artist-profile-card__image">
                  <img src={artist.profileImageUrl} alt={artist.name} />
                </div>
              )}
              <div className="artist-profile-card__content">
                <h2 className="artist-profile-card__name">{artist.name}</h2>
                {artist.bio && (
                  <p className="artist-profile-card__bio">{artist.bio}</p>
                )}
                {artist.category && (
                  <p className="artist-profile-card__category">{artist.category}</p>
                )}
                {artist.location && (
                  <p className="artist-profile-card__location">{artist.location}</p>
                )}
              </div>
            </Link>
          ))}
          </div>
        ) : (
          <div className="artists-page__empty">
            <p>No artists available yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

