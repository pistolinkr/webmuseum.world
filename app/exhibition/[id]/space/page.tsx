import { getExhibitionById } from '@/data/mockExhibitions';
import { notFound } from 'next/navigation';
import SpaceView from '@/components/views/SpaceView';

export default function SpacePage({ params }: { params: { id: string } }) {
  const exhibition = getExhibitionById(params.id);

  if (!exhibition) {
    notFound();
  }

  return <SpaceView artworks={exhibition.artworks} />;
}

