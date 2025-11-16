import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import ArtworkManager from '@/components/exhibition/ArtworkManager';
import ExhibitionManageGuard from '@/components/exhibition/ExhibitionManageGuard';

export default async function ExhibitionManagePage({ params }: { params: { id: string } }) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return (
    <ExhibitionManageGuard exhibition={exhibition}>
      <main className="exhibition-manage-page">
        <div className="exhibition-manage-page__container">
          <div className="exhibition-manage-page__header">
            <h1 className="exhibition-manage-page__title">Manage: {exhibition.title}</h1>
          </div>

          <ArtworkManager exhibition={exhibition} />
        </div>
      </main>
    </ExhibitionManageGuard>
  );
}

