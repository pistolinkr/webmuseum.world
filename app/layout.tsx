import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebMuseum World',
  description: 'Digital exhibition platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

