'use client';

import { useState } from 'react';
import { SearchFilters } from '@/types';

interface ExhibitionFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableGenres: string[];
  availableTags: string[];
  availableUsers: Array<{ id: string; name: string }>;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function ExhibitionFilters({
  filters,
  onFiltersChange,
  availableGenres,
  availableTags,
  availableUsers,
  sortBy,
  onSortChange,
}: ExhibitionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleGenreToggle = (genre: string) => {
    const currentGenres = filters.genre || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    onFiltersChange({ ...filters, genre: newGenres.length > 0 ? newGenres : undefined });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFiltersChange({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.genre?.length ||
    filters.tags?.length ||
    filters.userId ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="exhibition-filters">
      <div className="exhibition-filters__header">
        <div className="exhibition-filters__controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`exhibition-filters__toggle ${showFilters ? 'exhibition-filters__toggle--active' : ''}`}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <span className="exhibition-filters__badge">
                {[
                  filters.genre?.length || 0,
                  filters.tags?.length || 0,
                  filters.userId ? 1 : 0,
                  filters.startDate ? 1 : 0,
                  filters.endDate ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="exhibition-filters__clear"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="exhibition-filters__sort">
          <label htmlFor="sort-select" className="exhibition-filters__sort-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="exhibition-filters__sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="artworks-desc">Most Artworks</option>
            <option value="artworks-asc">Fewest Artworks</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="exhibition-filters__panel">
          {availableUsers.length > 0 && (
            <div className="exhibition-filters__group">
              <label className="exhibition-filters__group-label">Creator</label>
              <select
                value={filters.userId || ''}
                onChange={(e) => onFiltersChange({ ...filters, userId: e.target.value || undefined })}
                className="exhibition-filters__select"
              >
                <option value="">All Creators</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}

          {availableGenres.length > 0 && (
            <div className="exhibition-filters__group">
              <label className="exhibition-filters__group-label">Genre</label>
              <div className="exhibition-filters__chips">
                {availableGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`exhibition-filters__chip ${filters.genre?.includes(genre) ? 'exhibition-filters__chip--active' : ''}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableTags.length > 0 && (
            <div className="exhibition-filters__group">
              <label className="exhibition-filters__group-label">Tags</label>
              <div className="exhibition-filters__chips">
                {availableTags.slice(0, 20).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`exhibition-filters__chip ${filters.tags?.includes(tag) ? 'exhibition-filters__chip--active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="exhibition-filters__group">
            <label className="exhibition-filters__group-label">Date Range</label>
            <div className="exhibition-filters__date-range">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
                className="exhibition-filters__date-input"
                placeholder="Start date"
              />
              <span className="exhibition-filters__date-separator">to</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
                className="exhibition-filters__date-input"
                placeholder="End date"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

