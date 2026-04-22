'use client';

import '@/styles/Carousels.module.css';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import ProductCard, { Product } from '@/components/ProductCard';

interface RecommendationProduct extends Product {
  category: string;
  category_slug: string;
}

interface Props {
  products: RecommendationProduct[];
}

export default function RecommendationsClient({ products }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(products.length - visibleCount, 0);
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

  return (
    <section className="recommendations-section">
      <div className="recommendations-container">
        <div className="recommendations-layout">

          {/* Left - Text column */}
          <div className="recommendations-text">
            <SectionLine spacing="md" />
            <h2 className="recommendations-title">Nasze rekomendacje</h2>
            <p className="recommendations-description">
              Markowe upominki na każdą okazję. Wybraliśmy te produkty, bo sami
              chcielibyśmy je otrzymać. To selekcja sprawdzona w najbardziej
              wymagających projektach – idealna niezależnie od branży i stanowiska.
            </p>
          </div>

          {/* Right - Carousel */}
          <div className="recommendations-carousel">
            <div
              className="recommendations-track-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="recommendations-track"
                style={{
                  transform: isMobile
                    ? `translateX(-${currentIndex * 100}%)`
                    : `translateX(-${currentIndex * 33.333}%)`
                }}
              >
                {products.map((product) => (
                  <div key={product.id} className="recommendations-slide">
                    <ProductCard product={product} />
                    <Link
                      href={`/kategorie/${product.category_slug}`}
                      className="recommendations-category-link"
                    >
                      Przeglądaj {product.category} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation: arrows + dots */}
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
          </div>
        </div>
      </div>
    </section>
  );
}

