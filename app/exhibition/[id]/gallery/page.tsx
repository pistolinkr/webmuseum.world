import { getExhibitionById } from '@/data/mockExhibitions';
import { notFound } from 'next/navigation';
import GalleryView from '@/components/views/GalleryView';

export default function GalleryPage({ params }: { params: { id: string } }) {
  const exhibition = getExhibitionById(params.id);

  if (!exhibition) {
    notFound();
  }

  return <GalleryView artworks={exhibition.artworks} />;
}

