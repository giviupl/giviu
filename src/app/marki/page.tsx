'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/CategoryPages.module.css';
import type { Brand } from '@/types';

const CATEGORY_NAMES = [
  'ODZIEŻ', 'KUBKI I BUTELKI', 'PLECAKI I TORBY', 'ELEKTRONIKA',
  'PARASOLE', 'DOM I WYPOCZYNEK', 'BIURO I NOTATNIKI',
];

export default function MarkiPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchBrands() {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (!error && data) setBrands(data);
      setLoading(false);
    }
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(
    (brand) => categoryFilter === 'all' || (brand.categories ?? []).includes(categoryFilter)
  );

  return (
    <main className={styles['brands-page']}>
      <div className="brands-spacer"></div>
      <div className={styles['brands-container']}>
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span>Marki</span>
        </nav>

        <header className={styles['brands-header']}>
          <div className={styles['brands-title-wrapper']}>
            <SectionLine spacing="sm" />
            <h1 className={styles['brands-title']}>Marki</h1>
          </div>
          <p className={styles['brands-description']}>Odkryj produkty od najlepszych światowych marek</p>
        </header>

        <div className={styles['brands-filters']}>
          <button onClick={() => setCategoryFilter('all')} className={`${styles['brands-filter-btn']} ${categoryFilter === 'all' ? styles.active : ''}`}>WSZYSTKIE</button>
          {CATEGORY_NAMES.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`${styles['brands-filter-btn']} ${categoryFilter === cat ? styles.active : ''}`}>{cat}</button>
          ))}
        </div>

        {loading && (
          <div className={styles['brands-empty']}><div className="spinner"></div></div>
        )}

        {!loading && filteredBrands.length > 0 ? (
          <div className={styles['brands-grid']}>
            {filteredBrands.map((brand) => (
              <Link key={brand.slug} href={`/marki/${brand.slug}`} className={styles['brand-tile']}>
                <span className={styles['brand-tile-logo']}>{brand.emoji || '📦'}</span>
                <span className={styles['brand-tile-name']}>{brand.name}</span>
              </Link>
            ))}
          </div>
        ) : !loading && (
          <p className={styles['brands-empty']}>Brak marek w wybranej kategorii</p>
        )}
      </div>
    </main>
  );
}
