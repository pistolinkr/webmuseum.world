import type { Metadata } from 'next';
import './globals.css';
import Favicon from '@/components/Favicon';

export const metadata: Metadata = {
  title: 'WebMuseum World',
  description: 'Digital exhibition platform',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Favicon />
        {children}
      </body>
    </html>
  );
}

