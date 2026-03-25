'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';

export default function RecentlyViewedCarousel() {
  const { products } = useRecentlyViewedStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted || products.length === 0) {
    return null;
  }

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, products.length - visibleCount);
  const totalPages = maxIndex + 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - touchEndX.current;
    if (isDragging.current && Math.abs(diff) > 50) {
      e.preventDefault();
      if (diff > 0) handleNext();
      else handlePrev();
    }
    isDragging.current = false;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const getTransform = () => {
    if (isMobile) {
      return `translateX(-${currentIndex * 100}%)`;
    }
    return `translateX(-${currentIndex * 33.333}%)`;
  };

  const shouldCenter = products.length < 3 && !isMobile;

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-container">
        <h2 className="recently-viewed-title">Ostatnio oglądane</h2>

        <div className="recently-viewed-carousel">
          <div
            className="recently-viewed-track-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Karuzela ostatnio oglądanych produktów"
          >
            <div
              className="recently-viewed-track"
              style={{
                transform: shouldCenter ? 'none' : getTransform(),
                justifyContent: shouldCenter ? 'center' : 'flex-start',
              }}
            >
              {products.map((product) => (
                <div key={`recent-${product.id}`} className="recently-viewed-slide">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation: arrows + dots pod karuzelą */}
          {products.length > visibleCount && (
            <div className="carousel-nav">
              <button
                onClick={handlePrev}
                className="carousel-nav-arrow"
                aria-label="Poprzednie produkty"
                disabled={currentIndex === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="carousel-nav-dots">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`carousel-nav-dot ${idx === currentIndex ? 'active' : ''}`}
                    aria-label={`Strona ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="carousel-nav-arrow"
                aria-label="Następne produkty"
                disabled={currentIndex >= maxIndex}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
