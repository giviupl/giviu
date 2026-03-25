'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================
// ZMIANA: Dodane zdjęcia w hero karuzeli
// next/image automatycznie optymalizuje (WebP, lazy load, srcset)
// ============================================

const HERO_SLIDES = [
  { brandName: 'The North Face', title: 'The North Face', subtitle: 'Odzież outdoorowa premium', color: '#1f2937', image: '/images/hero/the-north-face.jpg' },
  { brandName: 'Stanley', title: 'Stanley', subtitle: 'Termosy i kubki termiczne', color: '#166534', image: '/images/hero/stanley.jpg' },
  { brandName: 'Moleskine', title: 'Moleskine', subtitle: 'Notesy i akcesoria', color: '#374151', image: '/images/hero/moleskine.jpg' },
  { brandName: 'CamelBak', title: 'CamelBak', subtitle: 'Butelki i systemy nawadniania', color: '#2563eb', image: '/images/hero/camelbak.jpg' },
  { brandName: 'Thule', title: 'Thule', subtitle: 'Torby i akcesoria podróżne', color: '#1d4ed8', image: '/images/hero/thule.jpg' },
];

const SLIDE_DURATION = 5000;

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Timer logic
  useEffect(() => {
    if (isPaused) {
      elapsedRef.current += Date.now() - startTimeRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const remaining = SLIDE_DURATION - elapsedRef.current;
    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      elapsedRef.current = 0;
      setAnimationKey((k) => k + 1);
    }, remaining);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, currentSlide]);

  const goToSlide = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentSlide(index);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    setAnimationKey((k) => k + 1);
  };

  const handlePrev = () => {
    goToSlide((currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    goToSlide((currentSlide + 1) % HERO_SLIDES.length);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) handleNext();
    else if (diff < -threshold) handlePrev();
  };

  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-grid">
        
        {/* Lewy panel - tekst */}
        <div className="hero-left">
          <div className="hero-left-inner">
            <div className="hero-spacer" />
            
            <div className="hero-text-content">
              <h1 id="hero-heading" className="hero-heading">
                <span className="hero-heading-dark">
                  Prezenty biznesowe,<br />
                  z których Twoi klienci<br />
                </span>
                <span className="hero-heading-primary">będą korzystać<br />codziennie.</span>
              </h1>
              <p className="hero-subtext">
                Markowa jakość, która przetrwa lata.
              </p>
              <Link href="/kolekcje" className="hero-cta">
                Zobacz kolekcje
              </Link>
            </div>
            
            <div className="hero-spacer" />
          </div>
        </div>

        {/* Prawy panel - slider ze zdjęciami */}
        <div className="hero-right">
          <Link 
            href={`/marki/${HERO_SLIDES[currentSlide].brandName.toLowerCase().replace(/ /g, '-')}`}
            className="hero-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Kolor tła jako fallback zanim zdjęcie się załaduje */}
            <div 
              className="hero-slide-bg"
              style={{ backgroundColor: HERO_SLIDES[currentSlide].color }}
            />

            {/* Zdjęcie — next/image z fill + object-fit cover */}
            <Image
              src={HERO_SLIDES[currentSlide].image}
              alt={`${HERO_SLIDES[currentSlide].brandName} — prezenty firmowe premium`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={currentSlide === 0}
              className="hero-slide-image"
            />
            
            {/* Overlay z tekstem */}
            <div className="hero-slide-overlay">
              <h2 className="hero-slide-title">{HERO_SLIDES[currentSlide].title}</h2>
              <p className="hero-slide-subtitle">{HERO_SLIDES[currentSlide].subtitle}</p>
              
              <div className="hero-dots" role="tablist" aria-label="Nawigacja karuzeli">
                {HERO_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSlide(index);
                    }}
                    className="hero-dot-btn"
                    aria-label={`Slajd ${index + 1}`}
                    aria-selected={currentSlide === index}
                    role="tab"
                  >
                    <span 
                      className={`hero-dot ${currentSlide === index ? 'hero-dot-active' : ''}`}
                    >
                      {currentSlide === index && (
                        <span 
                          key={animationKey}
                          className={`hero-dot-progress ${isPaused ? 'paused' : ''}`}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
