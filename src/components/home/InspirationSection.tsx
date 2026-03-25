'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import ArticleCard from '@/components/ArticleCard';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

// ============================================
// ZMIANA: Dane z Supabase zamiast import ARTICLES
// ============================================

export default function InspirationSection() {
  const [articles, setArticles] = useState<Article[]>([]);
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

  // Fetch articles
  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
    }
    fetchArticles();
  }, []);

  const visibleCount = isMobile ? 1 : 2;
  const maxIndex = Math.max(articles.length - visibleCount, 0);
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

  if (articles.length === 0) return null;

  return (
    <section className="inspiration-section">
      <div className="inspiration-container">
        <div className="inspiration-layout">

          {/* Left - Carousel */}
          <div className="inspiration-carousel">
            <div
              className="inspiration-track-wrapper"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="inspiration-track"
                style={{
                  transform: isMobile
                    ? `translateX(-${currentIndex * 100}%)`
                    : `translateX(-${currentIndex * 50}%)`
                }}
              >
                {articles.map((article) => (
                  <div key={article.id} className="inspiration-slide">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation: arrows + dots pod karuzelą */}
            <div className="carousel-nav">
              <button
                onClick={handlePrev}
                className="carousel-nav-arrow"
                aria-label="Poprzednie inspiracje"
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
                aria-label="Następne inspiracje"
                disabled={currentIndex >= maxIndex}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right - Text column */}
          <div className="inspiration-text">
            <SectionLine spacing="md" />
            <h2 className="inspiration-title">
              Wiedza. Trendy.<br />Inspiracje.
            </h2>
            <p className="inspiration-description">
              Trendy, historie marek i praktyczna wiedza. Zobacz, jak dobierać 
              upominki, które realnie budują lojalność klientów. Postaw na produkty,
              których jakość staje się fundamentem zaufania i wzmacnia więzi
              z Twoimi odbiorcami.
            </p>
            <Link href="/inspiracje" className="inspiration-link">
              Odkryj więcej inspiracji →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
