import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import SpaceView from '@/components/views/SpaceView';

export default async function SpacePage({ params }: { params: { id: string } }) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return <SpaceView artworks={exhibition.artworks} exhibitionId={params.id} />;
}

