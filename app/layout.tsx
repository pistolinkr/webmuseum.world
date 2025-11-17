import type { Metadata } from 'next';
import './globals.css';
import Favicon from '@/components/Favicon';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';
import LandingHeaderWrapper from '@/components/landing/LandingHeaderWrapper';
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Web Museum',
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
        <AuthProviderWrapper>
          <Favicon />
          <LandingHeaderWrapper />
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
          <Footer />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

