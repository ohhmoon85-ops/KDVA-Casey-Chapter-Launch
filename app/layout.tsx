import type { Metadata, Viewport } from 'next';
import { PosterHeader } from '@/components/PosterHeader';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'RSVP — KDVA Casey Chapter Launch',
  description:
    'Live K-POP at the Warrior Club, Camp Casey. Wednesday 16 September 2026, 1730—1930. Free food, two live sets.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d1626',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Loaded by link tag rather than next/font: Google renamed the family
          to "Big Shoulders" and next/font no longer knows the Display name,
          but the CSS2 endpoint still serves it. This is the face on the
          printed poster, so we ask for it by its printed name.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wrap">
          <PosterHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
