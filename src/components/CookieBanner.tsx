'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <p className="cookie-text">
          Używamy plików cookies, aby zapewnić najlepsze doświadczenia na naszej stronie.{' '}
          <Link href="/cookies" className="cookie-link">
            Dowiedz się więcej
          </Link>
        </p>
        <div className="cookie-buttons">
          <button onClick={handleDecline} className="cookie-btn-decline">
            Odrzuć
          </button>
          <button onClick={handleAccept} className="cookie-btn-accept">
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  );
}