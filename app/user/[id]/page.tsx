import { notFound } from 'next/navigation';
import { getUser } from '@/lib/firestore';
import { getUserExhibitions } from '@/lib/firestore';
import Link from 'next/link';
import { Exhibition } from '@/types';

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  
  if (!user) {
    notFound();
  }

  // Get user's public exhibitions
  const exhibitions = await getUserExhibitions(params.id);
  const publicExhibitions = exhibitions.filter(ex => ex.isPublic !== false);

  return (
    <main className="user-profile-page">
      <div className="user-profile-page__container">
        <div className="user-profile-page__header">
          {user.avatarUrl && (
            <div className="user-profile-page__avatar">
              <img src={user.avatarUrl} alt={user.displayName || user.name || 'User'} />
            </div>
          )}
          <div className="user-profile-page__info">
            <h1 className="user-profile-page__name">
              {user.displayName || user.name || user.email}
            </h1>
            {user.bio && (
              <p className="user-profile-page__bio">{user.bio}</p>
            )}
            <div className="user-profile-page__meta">
              {user.category && (
                <span className="user-profile-page__category">{user.category}</span>
              )}
              {user.location && (
                <span className="user-profile-page__location">📍 {user.location}</span>
              )}
            </div>
            {user.socialLinks && (
              <div className="user-profile-page__social">
                {user.website && (
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="user-profile-page__social-link"
                  >
                    Website
                  </a>
                )}
                {user.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="user-profile-page__social-link"
                  >
                    Instagram
                  </a>
                )}
                {user.socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="user-profile-page__social-link"
                  >
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {publicExhibitions.length > 0 ? (
          <section className="user-profile-page__exhibitions">
            <h2 className="user-profile-page__section-title">
              Exhibitions ({publicExhibitions.length})
            </h2>
            <div className="user-profile-page__exhibitions-grid">
              {publicExhibitions.map((exhibition) => (
                <Link 
                  key={exhibition.id}
                  href={`/exhibition/${exhibition.id}/story`}
                  className="user-exhibition-card"
                  prefetch={true}
                >
                  {exhibition.thumbnailUrl && (
                    <img
                      src={exhibition.thumbnailUrl}
                      alt={exhibition.title}
                      className="user-exhibition-card__thumbnail"
                    />
                  )}
                  <h3 className="user-exhibition-card__title">{exhibition.title}</h3>
                  {exhibition.description && (
                    <p className="user-exhibition-card__description">
                      {exhibition.description}
                    </p>
                  )}
                  {exhibition.date && (
                    <p className="user-exhibition-card__date">{exhibition.date}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="user-profile-page__empty">
            <p>No public exhibitions yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

