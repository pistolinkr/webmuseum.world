'use client';

import { useState } from 'react';
import { Artist } from '@/types';

interface ArtistProfileHeaderProps {
  artist: Artist;
  isFollowing?: boolean;
  onFollow?: () => void;
  onSubscribe?: () => void;
}

export default function ArtistProfileHeader({ 
  artist, 
  isFollowing = false,
  onFollow,
  onSubscribe 
}: ArtistProfileHeaderProps) {
  const [following, setFollowing] = useState(isFollowing);

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.();
  };

  return (
    <div className="artist-header">
      <div className="artist-header__background">
        {artist.profileImageUrl && (
          <div className="artist-header__cover">
            <img 
              src={artist.profileImageUrl} 
              alt={`${artist.name} cover`}
              className="artist-header__cover-image"
            />
            <div className="artist-header__cover-overlay" />
          </div>
        )}
      </div>
      
      <div className="artist-header__content">
        <div className="artist-header__profile">
          {artist.profileImageUrl && (
            <div className="artist-header__avatar">
              <img 
                src={artist.profileImageUrl} 
                alt={artist.name}
                className="artist-header__avatar-image"
              />
            </div>
          )}
          
          <div className="artist-header__info">
            <h1 className="artist-header__name">{artist.name}</h1>
            {artist.category && (
              <p className="artist-header__category">{artist.category}</p>
            )}
          </div>
          
          <div className="artist-header__actions">
            <button
              onClick={handleFollow}
              className={`artist-header__button artist-header__button--${following ? 'following' : 'follow'}`}
              aria-label={following ? 'Unfollow' : 'Follow'}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={onSubscribe}
              className="artist-header__button artist-header__button--subscribe"
              aria-label="Subscribe to premium content"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



