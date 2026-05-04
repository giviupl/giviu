"use client";

import { useState, useEffect } from "react";
import ArticleCard from "@/components/ArticleCard";
import SectionLine from "@/components/SectionLine";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/types";

// ============================================
// ZMIANY:
// - Dane z Supabase (client-side fetch)
// - Usunięto import ARTICLES z data/articles.ts
// - INSPIRATION_CATEGORIES z types (statyczne — nie w bazie)
// ============================================

export default function InspiracjePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setArticles(data);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const filteredArticles = articles;

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
