'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllExhibitions } from '@/lib/firestore';
import { Exhibition, Artist, Artwork, SearchFilters } from '@/types';

type SearchTab = 'all' | 'exhibitions' | 'artworks' | 'artists';

export default function ExplorePage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllExhibitions();
        setExhibitions(data);
        
        // Extract all artworks from exhibitions
        const artworks: Artwork[] = [];
        data.forEach(ex => {
          ex.artworks.forEach(art => {
            artworks.push(art);
          });
        });
        setAllArtworks(artworks);
        
        // Extract unique artists from artworks
        const uniqueArtists = new Map<string, Artist>();
        artworks.forEach(art => {
          if (art.artistId && !uniqueArtists.has(art.artistId)) {
            uniqueArtists.set(art.artistId, {
              id: art.artistId,
              name: art.artist,
            });
          }
        });
        setArtists(Array.from(uniqueArtists.values()));
      } catch (error) {
        console.error('Failed to load data from Firestore:', error);
      }
    }
    loadData();
  }, []);

  // Filter exhibitions
  const filteredExhibitions = exhibitions.filter(ex => {
    if (searchQuery && (activeTab === 'all' || activeTab === 'exhibitions')) {
      const query = searchQuery.toLowerCase();
      if (!ex.title.toLowerCase().includes(query) && 
          !ex.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (filters.genre && filters.genre.length > 0) {
      if (!ex.genre || !filters.genre.some(g => ex.genre?.includes(g))) {
        return false;
      }
    }
    
    if (filters.artistId) {
      if (!ex.artistIds?.includes(filters.artistId)) {
        return false;
      }
    }
    
    return true;
  });

  // Filter artworks
  const filteredArtworks = allArtworks.filter(art => {
    if (searchQuery && (activeTab === 'all' || activeTab === 'artworks')) {
      const query = searchQuery.toLowerCase();
      if (!art.title.toLowerCase().includes(query) && 
          !art.artist.toLowerCase().includes(query) &&
          !art.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (filters.genre && filters.genre.length > 0) {
      if (!art.genre || !filters.genre.some(g => art.genre?.includes(g))) {
        return false;
      }
    }
    
    if (filters.medium && filters.medium.length > 0) {
      if (!art.medium || !filters.medium.includes(art.medium)) {
        return false;
      }
    }
    
    if (filters.emotion && filters.emotion.length > 0) {
      if (!art.emotion || !filters.emotion.some(e => art.emotion?.includes(e))) {
        return false;
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      if (!art.tags || !filters.tags.some(t => art.tags?.includes(t))) {
        return false;
      }
    }
    
    if (filters.artistId) {
      if (art.artistId !== filters.artistId) {
        return false;
      }
    }
    
    return true;
  });

  // Filter artists
  const filteredArtists = artists.filter(artist => {
    if (searchQuery && (activeTab === 'all' || activeTab === 'artists')) {
      const query = searchQuery.toLowerCase();
      if (!artist.name.toLowerCase().includes(query) && 
          !artist.bio?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  // Get unique values for filters
  const allGenres = Array.from(new Set(
    allArtworks.flatMap(art => art.genre || [])
      .concat(exhibitions.flatMap(ex => ex.genre || []))
  ));
  const allMediums = Array.from(new Set(
    allArtworks.map(art => art.medium).filter(Boolean) as string[]
  ));
  const allEmotions = Array.from(new Set(
    allArtworks.flatMap(art => art.emotion || [])
  ));
  const allTags = Array.from(new Set(
    allArtworks.flatMap(art => art.tags || [])
  ));

  return (
    <main className="explore-page">
      <div className="explore-page__container">
        <h1 className="explore-page__title">Explore</h1>
        
        <div className="explore-page__search">
          <input
            type="text"
            placeholder="Search exhibitions, artworks, artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="explore-page__search-input"
          />
        </div>

        <div className="explore-page__tabs">
          <button
            className={`explore-page__tab ${activeTab === 'all' ? 'explore-page__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`explore-page__tab ${activeTab === 'exhibitions' ? 'explore-page__tab--active' : ''}`}
            onClick={() => setActiveTab('exhibitions')}
          >
            Exhibitions
          </button>
          <button
            className={`explore-page__tab ${activeTab === 'artworks' ? 'explore-page__tab--active' : ''}`}
            onClick={() => setActiveTab('artworks')}
          >
            Artworks
          </button>
          <button
            className={`explore-page__tab ${activeTab === 'artists' ? 'explore-page__tab--active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            Artists
          </button>
        </div>

        <div className="explore-page__filters">
          <div className="explore-page__filter-group">
            <label className="explore-page__filter-label">Genre</label>
            <select
              value={filters.genre?.[0] || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                genre: e.target.value ? [e.target.value] : undefined 
              })}
              className="explore-page__filter-select"
            >
              <option value="">All Genres</option>
              {allGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="explore-page__filter-group">
            <label className="explore-page__filter-label">Medium</label>
            <select
              value={filters.medium?.[0] || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                medium: e.target.value ? [e.target.value] : undefined 
              })}
              className="explore-page__filter-select"
            >
              <option value="">All Mediums</option>
              {allMediums.map(medium => (
                <option key={medium} value={medium}>{medium}</option>
              ))}
            </select>
          </div>

          <div className="explore-page__filter-group">
            <label className="explore-page__filter-label">Emotion</label>
            <select
              value={filters.emotion?.[0] || ''}
              onChange={(e) => setFilters({ 
                ...filters, 
                emotion: e.target.value ? [e.target.value] : undefined 
              })}
              className="explore-page__filter-select"
            >
              <option value="">All Emotions</option>
              {allEmotions.map(emotion => (
                <option key={emotion} value={emotion}>{emotion}</option>
              ))}
            </select>
          </div>

          <div className="explore-page__filter-group">
            <label className="explore-page__filter-label">Artist</label>
            <select
              value={filters.artistId || ''}
              onChange={(e) => setFilters({ ...filters, artistId: e.target.value || undefined })}
              className="explore-page__filter-select"
            >
              <option value="">All Artists</option>
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="explore-page__results">
          {(activeTab === 'all' || activeTab === 'exhibitions') && (
            <div className="explore-page__result-section">
              <h2 className="explore-page__results-title">
                {filteredExhibitions.length} Exhibition{filteredExhibitions.length !== 1 ? 's' : ''}
              </h2>
              <div className="explore-page__grid">
                {filteredExhibitions.map((exhibition) => (
                  <Link 
                    key={exhibition.id}
                    href={`/exhibition/${exhibition.id}/story`}
                    className="explore-exhibition-card"
                  >
                    <h3 className="explore-exhibition-card__title">{exhibition.title}</h3>
                    {exhibition.description && (
                      <p className="explore-exhibition-card__description">
                        {exhibition.description}
                      </p>
                    )}
                    {exhibition.date && (
                      <p className="explore-exhibition-card__date">{exhibition.date}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'artworks') && (
            <div className="explore-page__result-section">
              <h2 className="explore-page__results-title">
                {filteredArtworks.length} Artwork{filteredArtworks.length !== 1 ? 's' : ''}
              </h2>
              <div className="explore-page__grid">
                {filteredArtworks.map((artwork) => {
                  const exhibition = exhibitions.find(ex => ex.id === artwork.exhibitionId);
                  return (
                    <Link 
                      key={artwork.id}
                      href={exhibition ? `/exhibition/${exhibition.id}/gallery` : '#'}
                      className="explore-artwork-card"
                    >
                      <div className="explore-artwork-card__image">
                        <div className="explore-artwork-card__image-placeholder">
                          {artwork.title.charAt(0)}
                        </div>
                      </div>
                      <div className="explore-artwork-card__content">
                        <h3 className="explore-artwork-card__title">{artwork.title}</h3>
                        <p className="explore-artwork-card__artist">{artwork.artist}</p>
                        {artwork.medium && (
                          <p className="explore-artwork-card__medium">{artwork.medium}</p>
                        )}
                        {artwork.genre && artwork.genre.length > 0 && (
                          <div className="explore-artwork-card__tags">
                            {artwork.genre.slice(0, 2).map(genre => (
                              <span key={genre} className="explore-artwork-card__tag">{genre}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'artists') && (
            <div className="explore-page__result-section">
              <h2 className="explore-page__results-title">
                {filteredArtists.length} Artist{filteredArtists.length !== 1 ? 's' : ''}
              </h2>
              <div className="explore-page__grid">
                {filteredArtists.map((artist) => (
                  <Link 
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="explore-artist-card"
                  >
                    {artist.profileImageUrl && (
                      <div className="explore-artist-card__image">
                        <img src={artist.profileImageUrl} alt={artist.name} />
                      </div>
                    )}
                    <div className="explore-artist-card__content">
                      <h3 className="explore-artist-card__name">{artist.name}</h3>
                      {artist.bio && (
                        <p className="explore-artist-card__bio">
                          {artist.bio.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
