import { notFound } from 'next/navigation';
import { getArtist, getAllExhibitions } from '@/lib/firestore';
import { Artist } from '@/types';
import ArtistProfileHeader from '@/components/artist/ArtistProfileHeader';
import ArtistInfoCard from '@/components/artist/ArtistInfoCard';
import ArtistStoryCard from '@/components/artist/ArtistStoryCard';
import ExhibitionGridCard from '@/components/artist/ExhibitionGridCard';

export default async function ArtistProfilePage({ params }: { params: { id: string } }) {
  // Try to get artist from Firestore first
  let artist = await getArtist(params.id);
  
  // Get all exhibitions (needed for filtering artist exhibitions)
  const allExhibitions = await getAllExhibitions();
  
  // If artist not found in Firestore, try to extract from artworks (fallback)
  if (!artist) {
    for (const ex of allExhibitions) {
      const artwork = ex.artworks.find(art => art.artistId === params.id);
      if (artwork) {
        artist = {
          id: artwork.artistId || params.id,
          name: artwork.artist,
          bio: artwork.description,
          category: artwork.genre?.[0],
          profileImageUrl: artwork.imageUrl,
          socialLinks: {
            website: undefined,
            instagram: undefined,
            twitter: undefined,
          },
        };
        break;
      }
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
      <ArtistProfileHeader 
        artist={artist}
        isFollowing={false}
        onFollow={() => {
          // TODO: Implement follow functionality
          console.log('Follow artist');
        }}
        onSubscribe={() => {
          // TODO: Implement subscribe functionality
          console.log('Subscribe to artist');
        }}
      />
      
      <div className="artist-profile-page__container">
        <div className="artist-profile-page__content">
          <div className="artist-profile-page__sidebar">
            <ArtistInfoCard artist={artist} />
            <ArtistStoryCard artist={artist} />
        </div>

          <div className="artist-profile-page__main">
            {artistExhibitions.length > 0 ? (
          <section className="artist-profile-page__exhibitions">
                <div className="artist-profile-page__section-header">
                  <h2 className="artist-profile-page__section-title">
                    Exhibitions
                    <span className="artist-profile-page__section-count">
                      ({artistExhibitions.length})
                    </span>
                  </h2>
                </div>
            <div className="artist-profile-page__exhibitions-grid">
              {artistExhibitions.map((exhibition) => (
                    <ExhibitionGridCard 
                  key={exhibition.id}
                      exhibition={exhibition}
                    />
              ))}
            </div>
          </section>
            ) : (
              <section className="artist-profile-page__exhibitions">
                <div className="artist-profile-page__empty">
                  <p>No exhibitions available yet.</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

