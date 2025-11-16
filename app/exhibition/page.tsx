'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllExhibitions } from '@/lib/firestore';
import { Exhibition, SearchFilters } from '@/types';
import ExhibitionCard from '@/components/explore/ExhibitionCard';
import ExhibitionFilters from '@/components/explore/ExhibitionFilters';
import { getUser } from '@/lib/firestore';

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllExhibitions();
        if (data && data.length > 0) {
          setExhibitions(data);
        }
      } catch (error) {
        console.error('Error loading exhibitions:', error);
      }
    }
    loadData();
  }, []);

  // Get unique users from exhibitions
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    async function loadUsers() {
      const userIds = Array.from(new Set(exhibitions.map(ex => ex.userId).filter(Boolean) as string[]));
      const users = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const user = await getUser(userId);
            return user ? { id: userId, name: user.displayName || user.name || user.email || 'Unknown' } : null;
          } catch {
            return { id: userId, name: 'Unknown' };
          }
        })
      );
      setAvailableUsers(users.filter(Boolean) as Array<{ id: string; name: string }>);
    }
    if (exhibitions.length > 0) {
      loadUsers();
    }
  }, [exhibitions]);

  // Filter exhibitions
  const filteredExhibitions = useMemo(() => {
    let filtered = exhibitions.filter(ex => {
      // Only show public exhibitions
      if (ex.isPublic === false) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!ex.title.toLowerCase().includes(query) &&
            !ex.description.toLowerCase().includes(query) &&
            !ex.curator?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Genre filter
      if (filters.genre && filters.genre.length > 0) {
        if (!ex.genre || !filters.genre.some(g => ex.genre?.includes(g))) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        if (!ex.tags || !filters.tags.some(t => ex.tags?.includes(t))) {
          return false;
        }
      }

      // User filter
      if (filters.userId && ex.userId !== filters.userId) {
        return false;
      }

      // Date range filter
      if (filters.startDate && ex.startDate && ex.startDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && ex.endDate && ex.endDate > filters.endDate) {
        return false;
      }

      return true;
    });

    // Sort exhibitions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const aDate = a.createdAt || a.startDate || '';
          const bDate = b.createdAt || b.startDate || '';
          return bDate.localeCompare(aDate);
        case 'oldest':
          const aDateOld = a.createdAt || a.startDate || '';
          const bDateOld = b.createdAt || b.startDate || '';
          return aDateOld.localeCompare(bDateOld);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'artworks-desc':
          return (b.artworks?.length || 0) - (a.artworks?.length || 0);
        case 'artworks-asc':
          return (a.artworks?.length || 0) - (b.artworks?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [exhibitions, searchQuery, filters, sortBy]);

  // Get available filter options
  const availableGenres = useMemo(() => {
    return Array.from(new Set(exhibitions.flatMap(ex => ex.genre || [])));
  }, [exhibitions]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(exhibitions.flatMap(ex => ex.tags || [])));
  }, [exhibitions]);

  return (
    <main className="exhibitions-page">
      <div className="exhibitions-page__container">
        <div className="exhibitions-page__header">
          <div>
            <h1 className="exhibitions-page__title">Discover Museums</h1>
            <p className="exhibitions-page__subtitle">
              Explore user-created museums from around the world
            </p>
          </div>
        </div>

        <div className="exhibitions-page__search">
          <input
            type="text"
            placeholder="Search museums by title, description, or curator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="exhibitions-page__search-input"
          />
        </div>

        <ExhibitionFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableGenres={availableGenres}
          availableTags={availableTags}
          availableUsers={availableUsers}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="exhibitions-page__results">
          <p className="exhibitions-page__results-count">
            {filteredExhibitions.length} museum{filteredExhibitions.length !== 1 ? 's' : ''} found
          </p>
          {filteredExhibitions.length > 0 ? (
            <div className="exhibitions-page__grid">
              {filteredExhibitions.map((exhibition) => (
                <ExhibitionCard
                  key={exhibition.id}
                  exhibition={exhibition}
                  showUser={true}
                />
              ))}
            </div>
          ) : (
            <div className="exhibitions-page__empty">
              <p>No museums found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({});
                }}
                className="exhibitions-page__clear-button"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
