import { getExhibitionById } from '@/data/mockExhibitions';
import { notFound } from 'next/navigation';
import ExhibitionLayoutClient from '@/components/ExhibitionLayoutClient';

export default function ExhibitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const exhibition = getExhibitionById(params.id);

  if (!exhibition) {
    notFound();
  }

  return (
    <ExhibitionLayoutClient exhibitionId={params.id}>
      {children}
    </ExhibitionLayoutClient>
  );
}

