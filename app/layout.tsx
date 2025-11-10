import type { Metadata } from 'next';
import './globals.css';
import Favicon from '@/components/Favicon';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

export const metadata: Metadata = {
  title: 'WebMuseum World',
  description: 'Digital exhibition platform',
  icons: {
    icon: '/icon-dark.png', // Default to dark icon for light theme
    apple: '/icon-dark.png',
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
        <PageTransitionWrapper>{children}</PageTransitionWrapper>
      </body>
    </html>
  );
}

