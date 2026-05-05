import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Rubik } from 'next/font/google';

import Header from '@/components/Header';
import ConditionalFooter from '@/components/ConditionalFooter';
import CookieBanner from '@/components/CookieBanner';
import ScrollToTop from '@/components/ScrollToTop';

const rubik = Rubik({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-rubik',
});

const SITE_URL = 'https://giviu.pl';
const SITE_NAME = 'Giviu';
const SITE_DESCRIPTION = 'Prezenty firmowe premium od najlepszych marek. Stanley, Moleskine, Thule — z personalizacją i doradztwem. Zamów bezpłatną wycenę.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Giviu | Prezenty Firmowe Premium',
    template: '%s | Giviu',
  },
  description: SITE_DESCRIPTION,
  keywords: ['prezenty firmowe', 'gadżety reklamowe premium', 'upominki biznesowe', 'personalizacja', 'Stanley', 'Moleskine', 'The North Face'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Giviu | Prezenty Firmowe Premium',
    description: SITE_DESCRIPTION,
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'Giviu — Prezenty Firmowe Premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Giviu | Prezenty Firmowe Premium',
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`no-overflow-x ${rubik.variable}`}>
      <body className="no-overflow-x">
        <a href="#main-content" className="skip-to-content">
          Przejdź do treści
        </a>
        <ScrollToTop />
        <Header />
          <Suspense fallback={<div className="page-loading">Ładowanie...</div>}>
            <div id="main-content">
              {children}
            </div>
          </Suspense>
        <CookieBanner />
        <ConditionalFooter />
      </body>
    </html>
  );
}

