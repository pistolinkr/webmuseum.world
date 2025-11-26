import type { Metadata } from 'next';
import './globals.css';
import ThemeInitializer from '@/components/ThemeInitializer';
import Favicon from '@/components/Favicon';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';
import LandingHeaderWrapper from '@/components/landing/LandingHeaderWrapper';
import AuthProviderWrapper from '@/components/providers/AuthProviderWrapper';
import ConditionalFooter from '@/components/ConditionalFooter';

export const metadata: Metadata = {
  title: 'Web Museum',
  description: 'Digital exhibition platform',
  icons: {
    icon: '/logo/icon-dark.png', // Default to dark icon for light theme
    apple: '/logo/icon-dark.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.removeAttribute('data-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeInitializer />
        <AuthProviderWrapper>
          <Favicon />
          <LandingHeaderWrapper />
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
          <ConditionalFooter />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

