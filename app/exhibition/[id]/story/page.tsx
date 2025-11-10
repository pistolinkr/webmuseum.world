import { getExhibitionById } from '@/data/mockExhibitions';
import { notFound } from 'next/navigation';
import StoryView from '@/components/views/StoryView';

export default function StoryPage({ params }: { params: { id: string } }) {
  const exhibition = getExhibitionById(params.id);

  if (!exhibition) {
    notFound();
  }

  return <StoryView artworks={exhibition.artworks} />;
}

