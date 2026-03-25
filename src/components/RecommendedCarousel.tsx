'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '@/components/ProductCard';

interface RecommendedCarouselProps {
  products: any[];
}

export default function RecommendedCarousel({ products }: RecommendedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (products.length === 0) return null;

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, products.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Swipe handlers - rozróżnienie tap vs swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diff = Math.abs(touchStartX.current - touchEndX.current);
    
    if (diff > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - touchEndX.current;

    if (isDragging.current && Math.abs(diff) > 50) {
      e.preventDefault();
      
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
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
    <section className="recommended-section">
      <div className="recommended-container">
        <h2 className="recommended-title">Polecane produkty</h2>

        <div className="recommended-carousel">
          {currentIndex > 0 && products.length > visibleCount && (
            <button
              onClick={handlePrev}
              className="recommended-arrow recommended-arrow-left"
              aria-label="Poprzednie produkty"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div 
            className="recommended-track-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Karuzela polecanych produktów"
          >
            <div 
              className="recommended-track"
              style={{ 
                transform: shouldCenter ? 'none' : getTransform(),
                justifyContent: shouldCenter ? 'center' : 'flex-start',
              }}
            >
              {products.map((product) => (
                <div key={product.id} className="recommended-slide">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {currentIndex < maxIndex && products.length > visibleCount && (
            <button
              onClick={handleNext}
              className="recommended-arrow recommended-arrow-right"
              aria-label="Następne produkty"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}