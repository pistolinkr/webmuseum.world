import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import ExhibitionLayoutClient from '@/components/ExhibitionLayoutClient';

export default async function ExhibitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return (
    <ExhibitionLayoutClient exhibitionId={params.id}>
      {children}
    </ExhibitionLayoutClient>
  );
}

