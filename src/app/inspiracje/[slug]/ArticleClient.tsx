'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RecommendedCarousel from '@/components/RecommendedCarousel';
import type { Article, Product } from '@/types';

// ============================================
// ZMIANY:
// - Props: article + recommendedProducts (zamiast slug + import)
// - Semantyczne: <article> zamiast <div>, <time datetime>
// - Usunięto import ARTICLES, getRecommendedProducts
// ============================================

interface ArticleClientProps {
  article: Article;
  recommendedProducts: Product[];
}

export default function ArticleClient({ article, recommendedProducts }: ArticleClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatuj datę do czytelnej formy
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const publishedDate = formatDate(article.created_at);

  return (
    <main className="article-page">
      <div className="article-spacer"></div>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/inspiracje">Inspiracje</Link>
          <span>/</span>
          <span>{article.title}</span>
        </nav>
      </div>

      {/* Semantyczne <article> zamiast <div> */}
      <article className="article-container">
        {/* Hero Image */}
        <div className="article-hero-image">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>

        {/* Article Header */}
        <div className="article-header">
          <span className="article-category-badge">{article.category}</span>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>
          {/* Data publikacji z <time> */}
          {publishedDate && article.created_at && (
            <time dateTime={article.created_at} className="article-date">
              {publishedDate}
            </time>
          )}
        </div>

        {/* Article Content */}
        <div className="article-content">
          <div className="article-content-placeholder">
            <p>Treść artykułu zostanie uzupełniona później</p>
          </div>
        </div>
      </article>

      {/* Recommended Products Carousel */}
      {mounted && <RecommendedCarousel products={recommendedProducts} />}

      {/* Back Link */}
      <div className="article-back-wrapper">
        <Link href="/inspiracje" className="article-back-link">
          ← Wróć do inspiracji
        </Link>
      </div>
    </main>
  );
}
