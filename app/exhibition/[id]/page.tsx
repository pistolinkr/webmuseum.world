import { getExhibition } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ManageLink from '@/components/exhibition/ManageLink';

export default async function ExhibitionOverviewPage({ params }: { params: { id: string } }) {
  const exhibition = await getExhibition(params.id);

  if (!exhibition) {
    notFound();
  }

  return (
    <main className="exhibition-overview-page">
      <div className="exhibition-overview-page__container">
        <div className="exhibition-overview-page__header">
          <div className="exhibition-overview-page__header-content">
            <h1 className="exhibition-overview-page__title">{exhibition.title}</h1>
            {exhibition.date && (
              <p className="exhibition-overview-page__date">{exhibition.date}</p>
            )}
          </div>
          <ManageLink exhibition={exhibition} />
        </div>

        <div className="exhibition-overview-page__content">
          <div className="exhibition-overview-page__description">
            <p className="exhibition-overview-page__text">{exhibition.description}</p>
            {exhibition.statement && (
              <div className="exhibition-overview-page__statement">
                <h2 className="exhibition-overview-page__statement-title">Exhibition Statement</h2>
                <p className="exhibition-overview-page__statement-text">{exhibition.statement}</p>
              </div>
            )}
          </div>

          <div className="exhibition-overview-page__info">
            {exhibition.curator && (
              <div className="exhibition-overview-page__info-item">
                <span className="exhibition-overview-page__info-label">Curator</span>
                <span className="exhibition-overview-page__info-value">{exhibition.curator}</span>
              </div>
            )}
            {exhibition.artworks && (
              <div className="exhibition-overview-page__info-item">
                <span className="exhibition-overview-page__info-label">Artworks</span>
                <span className="exhibition-overview-page__info-value">{exhibition.artworks.length}</span>
              </div>
            )}
          </div>
        </div>

        <div className="exhibition-overview-page__view-modes">
          <h2 className="exhibition-overview-page__view-modes-title">View Exhibition</h2>
          <div className="exhibition-overview-page__view-modes-grid">
            <Link 
              href={`/exhibition/${exhibition.id}/story`}
              className="exhibition-view-mode-card"
              prefetch={true}
            >
              <div className="exhibition-view-mode-card__icon">📖</div>
              <h3 className="exhibition-view-mode-card__title">Narrative View</h3>
              <p className="exhibition-view-mode-card__description">
                Experience the exhibition through an immersive scroll-based story
              </p>
            </Link>
            <Link 
              href={`/exhibition/${exhibition.id}/gallery`}
              className="exhibition-view-mode-card"
              prefetch={true}
            >
              <div className="exhibition-view-mode-card__icon">🖼️</div>
              <h3 className="exhibition-view-mode-card__title">Gallery View</h3>
              <p className="exhibition-view-mode-card__description">
                Browse artworks in a high-quality gallery with zoom and detail views
              </p>
            </Link>
            <Link 
              href={`/exhibition/${exhibition.id}/space`}
              className="exhibition-view-mode-card"
              prefetch={true}
            >
              <div className="exhibition-view-mode-card__icon">🌐</div>
              <h3 className="exhibition-view-mode-card__title">3D Space View</h3>
              <p className="exhibition-view-mode-card__description">
                Walk through a virtual 3D exhibition space
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

