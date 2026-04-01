'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import styles from '@/styles/CategoryPages.module.css';
import type { Brand, Product } from '@/types';

interface BrandClientProps {
  brand: Brand;
  products: Product[];
}

export default function BrandClient({ brand, products }: BrandClientProps) {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const colors = useMemo(() => {
    const colorMap = new Map<string, { hex: string; count: number }>();
    products.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: { name: string; hex: string }) => {
          if (colorMap.has(color.name)) colorMap.get(color.name)!.count++;
          else colorMap.set(color.name, { hex: color.hex, count: 1 });
        });
      }
    });
    return Array.from(colorMap.entries())
      .map(([name, data]) => ({ name, hex: data.hex, count: data.count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedColors.length > 0) {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        const productColorNames = product.colors.map((c: { name: string }) => c.name);
        if (!selectedColors.some(color => productColorNames.includes(color))) return false;
      }
      return true;
    });
  }, [products, selectedColors]);

  const getHighlightColor = (product: Product) => {
    if (selectedColors.length === 0) return undefined;
    const productColorNames = product.colors?.map((c: { name: string }) => c.name) || [];
    return selectedColors.find(color => productColorNames.includes(color));
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  const handleClearAll = () => setSelectedColors([]);

  return (
    <main className={styles['brand-page']}>
      <div className="brand-spacer"></div>

      <div className="breadcrumb-wrapper">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/marki">Marki</Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>
      </div>

      <div className={styles['brand-container']}>

        <div className={styles['brand-hero']}>
          <div className={styles['brand-logo']} style={{ backgroundColor: brand.color || '#1a1a1a' }}>
            <span className={styles['brand-logo-text']}>{brand.name.toUpperCase()}</span>
          </div>
          <div className={styles['brand-hero-content']}>
            <h1 className={styles['brand-headline']}>{brand.headline || brand.name}</h1>
            <p className={styles['brand-description']}>{brand.description}</p>
          </div>
        </div>

        {brand.features && brand.features.length > 0 && (
          <div className={styles['brand-features']}>
            {brand.features.map((feature, index) => (
              <div key={index} className={styles['brand-feature']}>
                <h2 className={styles['brand-feature-title']}>{feature.title}</h2>
                <p className={styles['brand-feature-text']}>{feature.text}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="products-section-title">Produkty marki {brand.name}</h2>

        {products.length > 0 && colors.length > 0 && (
          <aside aria-label="Filtry produktów">
            <FilterPanel
              brands={[]}
              colors={colors}
              selectedBrands={[]}
              selectedColors={selectedColors}
              onBrandToggle={() => {}}
              onColorToggle={handleColorToggle}
              onClearAll={handleClearAll}
              totalResults={filteredProducts.length}
            />
          </aside>
        )}

        {filteredProducts.length > 0 ? (
          <ul role="list" className="products-grid">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} highlightColor={getHighlightColor(product)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="products-empty">
            {products.length > 0 ? (
              <>
                <p>Brak produktów spełniających wybrane kryteria.</p>
                <button onClick={handleClearAll} className="back-link">Wyczyść filtry →</button>
              </>
            ) : (
              <p>Produkty tej marki będą wkrótce dostępne</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
