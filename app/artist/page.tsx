'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllExhibitions } from '@/lib/firestore';
import { Artist, Artwork } from '@/types';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    async function loadArtists() {
      try {
        const exhibitions = await getAllExhibitions();
        // Extract unique artists from artworks
        const uniqueArtists = new Map<string, Artist>();
        exhibitions.forEach(ex => {
          ex.artworks.forEach(art => {
            if (art.artistId && !uniqueArtists.has(art.artistId)) {
              uniqueArtists.set(art.artistId, {
                id: art.artistId,
                name: art.artist,
              });
            }
          });
        });
        setArtists(Array.from(uniqueArtists.values()));
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
        <p className="artists-page__subtitle">
          Discover artists from user-created museums
        </p>
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

