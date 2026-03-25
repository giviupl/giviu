'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/ArticleCard';
import SectionLine from '@/components/SectionLine';
import { INSPIRATION_CATEGORIES } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

// ============================================
// ZMIANY:
// - Dane z Supabase (client-side fetch)
// - Usunięto import ARTICLES z data/articles.ts
// - INSPIRATION_CATEGORIES z types (statyczne — nie w bazie)
// ============================================

export default function InspiracjePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(article => article.category === activeCategory);

  return (
    <section className="inspiracje-page">
      
      {/* Spacer */}
      <div className="inspiracje-spacer"></div>

      <div className="inspiracje-container">
        
        {/* Header */}
        <div className="inspiracje-header">
          <div className="inspiracje-title-wrapper">
            <SectionLine spacing="sm" /> 
            <h1 className="inspiracje-title">Inspiracje</h1>
          </div>
          <p className="inspiracje-subtitle">
            Odkryj inspirujące pomysły na prezenty biznesowe
          </p>
        </div>

        {/* Category Filters */}
        <div className="inspiracje-filters">
          <button
            onClick={() => setActiveCategory('all')}
            className={`inspiracje-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          >
            Wszystkie
          </button>
          {INSPIRATION_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`inspiracje-filter-btn ${activeCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="inspiracje-empty">
            <div className="spinner"></div>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && (
          <div className="inspiracje-grid">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredArticles.length === 0 && (
          <div className="inspiracje-empty">
            <p>Brak artykułów w tej kategorii</p>
          </div>
        )}
      </div>
    </section>
  );
}
