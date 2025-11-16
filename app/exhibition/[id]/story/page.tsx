import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import StoryView from '@/components/views/StoryView';

export default async function StoryPage({ params }: { params: { id: string } }) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return <StoryView artworks={exhibition.artworks} exhibitionId={params.id} />;
}

