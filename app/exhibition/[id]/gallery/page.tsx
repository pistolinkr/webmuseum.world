import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import GalleryView from '@/components/views/GalleryView';

export default async function GalleryPage({ params }: { params: { id: string } }) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return <GalleryView artworks={exhibition.artworks} exhibitionId={params.id} />;
}

