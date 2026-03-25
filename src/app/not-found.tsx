'use client';

import Link from 'next/link';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-container">
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Strona nie została znaleziona</h2>
          <p className="not-found-description">
            Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
          </p>
          <Link href="/" className="not-found-button">
            WRÓĆ NA STRONĘ GŁÓWNĄ
          </Link>
        </div>
      </div>
      
      <div className="inspiration-wrapper">
        <InspirationCarouselSimple />
      </div>
    </main>
  );
}