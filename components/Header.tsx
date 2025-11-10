import Link from 'next/link';

export default function Header() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem 2rem',
        zIndex: 1000,
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <Link href="/">
        <h1 style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
          WebMuseum World
        </h1>
      </Link>
    </header>
  );
}

