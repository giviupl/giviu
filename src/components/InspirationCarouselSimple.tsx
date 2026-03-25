'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

export default function InspirationCarouselSimple() {
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
        .order('created_at', { ascending: false })
        .limit(6);

      if (!error && data) {
        setArticles(data);
      }
    }
    fetchArticles();
  }, []);

  const visibleCount = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, articles.length - visibleCount);
  const totalPages = maxIndex + 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

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
    <div className="inspiration-simple">
      <h3 className="inspiration-simple-title">Inspiracje</h3>

      <div className="inspiration-simple-carousel">
        <div
          className="inspiration-simple-track-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="inspiration-simple-track"
            style={{
              transform: isMobile
                ? `translateX(-${currentIndex * 100}%)`
                : `translateX(-${currentIndex * 33.333}%)`
            }}
          >
            {articles.map((article) => (
              <div key={article.id} className="inspiration-simple-slide">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation: arrows + dots pod karuzelą */}
        {articles.length > visibleCount && (
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
        )}
      </div>

      <div className="inspiration-simple-footer">
        <Link href="/inspiracje" className="inspiration-simple-link">
          Zobacz wszystkie inspiracje →
        </Link>
      </div>
    </div>
  );
}
