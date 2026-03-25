'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import { supabase } from '@/lib/supabase';
import type { Brand } from '@/types';

// ============================================
// ZMIANY:
// - Dane marek z Supabase (zamiast hardcoded BRAND_TILES)
// - Kategorie do filtrowania z pola categories (JSONB) w brands
// - Usunięto import CATEGORIES z data/navigation.ts
// ============================================

// Nawigacja kategorii — statyczna (używana w headerze, tu, i w kolekcjach)
const CATEGORY_NAMES = [
  'ODZIEŻ',
  'KUBKI I BUTELKI',
  'PLECAKI I TORBY',
  'ELEKTRONIKA',
  'PARASOLE',
  'DOM I WYPOCZYNEK',
  'BIURO I NOTATNIKI',
];

export default function MarkiPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchBrands() {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (!error && data) {
        setBrands(data);
      }
      setLoading(false);
    }
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(
    (brand) => categoryFilter === 'all' || (brand.categories ?? []).includes(categoryFilter)
  );

  return (
    <main className="brands-page">
      {/* Spacer */}
      <div className="brands-spacer"></div>

      <div className="brands-container">
        
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span>Marki</span>
        </nav>

        {/* Header */}
        <header className="brands-header">
          <div className="brands-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="brands-title">Marki</h1>
          </div>
          <p className="brands-description">
            Odkryj produkty od najlepszych światowych marek
          </p>
        </header>

        {/* Category Filter Pills */}
        <div className="brands-filters">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`brands-filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          >
            WSZYSTKIE
          </button>
          {CATEGORY_NAMES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`brands-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="brands-empty">
            <div className="spinner"></div>
          </div>
        )}

        {/* Brands Grid */}
        {!loading && filteredBrands.length > 0 ? (
          <div className="brands-grid">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/marki/${brand.slug}`}
                className="brand-tile"
              >
                <span className="brand-tile-logo">{brand.emoji || '📦'}</span>
                <span className="brand-tile-name">{brand.name}</span>
              </Link>
            ))}
          </div>
        ) : !loading && (
          <p className="brands-empty">Brak marek w wybranej kategorii</p>
        )}
      </div>
    </main>
  );
}
