import Link from 'next/link';
import { mockExhibitions } from '@/data/mockExhibitions';

export default function Home() {
  return (
    <main style={{ padding: '2rem', minHeight: '100vh' }}>
      <h1>WebMuseum World</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Exhibitions</h2>
        <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
          {mockExhibitions.map((exhibition) => (
            <li key={exhibition.id} style={{ marginBottom: '1rem' }}>
              <Link href={`/exhibition/${exhibition.id}/story`}>
                {exhibition.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

