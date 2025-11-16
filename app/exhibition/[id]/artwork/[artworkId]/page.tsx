import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArtworkDetailContent from '@/components/artwork/ArtworkDetailContent';

export default async function ArtworkDetailPage({ 
  params 
}: { 
  params: { id: string; artworkId: string } 
}) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  const artwork = exhibition.artworks.find(art => art.id === params.artworkId);
  
  if (!artwork) {
    notFound();
  }

  // Find artwork index for navigation
  const artworkIndex = exhibition.artworks.findIndex(art => art.id === params.artworkId);
  const prevArtwork = artworkIndex > 0 ? exhibition.artworks[artworkIndex - 1] : null;
  const nextArtwork = artworkIndex < exhibition.artworks.length - 1 
    ? exhibition.artworks[artworkIndex + 1] 
    : null;

  return (
    <main className="artwork-detail-page">
      <div className="artwork-detail-page__container">
        <div className="artwork-detail-page__header">
          <Link 
            href={`/exhibition/${exhibition.id}/gallery`}
            className="artwork-detail-page__back"
            prefetch={true}
          >
            ← Back to Gallery
          </Link>
        </div>

        <ArtworkDetailContent artwork={artwork} exhibitionId={exhibition.id} />

        {(prevArtwork || nextArtwork) && (
          <div className="artwork-detail-page__navigation">
            {prevArtwork && (
              <Link 
                href={`/exhibition/${exhibition.id}/artwork/${prevArtwork.id}`}
                className="artwork-detail-page__nav-link"
                prefetch={true}
              >
                ← Previous: {prevArtwork.title}
              </Link>
            )}
            {nextArtwork && (
              <Link 
                href={`/exhibition/${exhibition.id}/artwork/${nextArtwork.id}`}
                className="artwork-detail-page__nav-link artwork-detail-page__nav-link--next"
                prefetch={true}
              >
                Next: {nextArtwork.title} →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

