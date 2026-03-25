'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-container">
          <h1 className="not-found-code">Ups!</h1>
          <h2 className="not-found-title">Coś poszło nie tak</h2>
          <p className="not-found-description">
            Przepraszamy, wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.
          </p>
          <button onClick={() => reset()} className="not-found-button">
            SPRÓBUJ PONOWNIE
          </button>
          <Link href="/" className="not-found-button" style={{ marginTop: '12px', background: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
            WRÓĆ NA STRONĘ GŁÓWNĄ
          </Link>
        </div>
      </div>
    </main>
  );
}
