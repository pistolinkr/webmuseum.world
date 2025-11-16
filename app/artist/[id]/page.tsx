import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllExhibitions } from '@/lib/firestore';
import { Artist } from '@/types';

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  const allExhibitions = await getAllExhibitions();
  
  // Find artist from artworks
  let artist: Artist | null = null;
  for (const ex of allExhibitions) {
    const artwork = ex.artworks.find(art => art.artistId === params.id);
    if (artwork) {
      artist = {
        id: artwork.artistId || params.id,
        name: artwork.artist,
      };
      break;
    }
  }
  
  if (!artist) {
    notFound();
  }
  
  // Filter exhibitions: only include exhibitions where this artist has artworks
  // and ensure all artworks in the exhibition belong to this artist (for individual exhibitions)
  const artistExhibitions = allExhibitions.filter(ex => {
    const hasArtistId = ex.artistIds?.includes(params.id);
    const artistArtworks = ex.artworks.filter(art => art.artistId === params.id);
    
    // Include if artist is in artistIds AND has at least one artwork
    if (hasArtistId && artistArtworks.length > 0) {
      // For individual exhibitions (only one artist), all artworks must belong to this artist
      if (ex.artistIds?.length === 1) {
        return ex.artworks.every(art => art.artistId === params.id);
      }
      // For group exhibitions, at least one artwork must belong to this artist
      return true;
    }
    
    return false;
  });

  return (
    <main className="artist-profile-page">
      <div className="artist-profile-page__container">
        <div className="artist-profile-page__header">
          {artist.profileImageUrl && (
            <div className="artist-profile-page__image">
              <img src={artist.profileImageUrl} alt={artist.name} />
            </div>
          )}
          <div className="artist-profile-page__info">
            <h1 className="artist-profile-page__name">{artist.name}</h1>
            {artist.bio && (
              <p className="artist-profile-page__bio">{artist.bio}</p>
            )}
            {artist.socialLinks && (
              <div className="artist-profile-page__social">
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer" className="artist-profile-page__link">
                    Website
                  </a>
                )}
                {artist.socialLinks.instagram && (
                  <a href={`https://instagram.com/${artist.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="artist-profile-page__link">
                    Instagram
                  </a>
                )}
                {artist.socialLinks.twitter && (
                  <a href={`https://twitter.com/${artist.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="artist-profile-page__link">
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {artistExhibitions.length > 0 && (
          <section className="artist-profile-page__exhibitions">
            <h2 className="artist-profile-page__section-title">Exhibitions</h2>
            <div className="artist-profile-page__exhibitions-grid">
              {artistExhibitions.map((exhibition) => (
                <Link 
                  key={exhibition.id}
                  href={`/exhibition/${exhibition.id}/story`}
                  className="artist-exhibition-card"
                >
                  <h3 className="artist-exhibition-card__title">{exhibition.title}</h3>
                  {exhibition.description && (
                    <p className="artist-exhibition-card__description">
                      {exhibition.description}
                    </p>
                  )}
                  {exhibition.date && (
                    <p className="artist-exhibition-card__date">{exhibition.date}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

