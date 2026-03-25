'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import type { Brand, Product } from '@/types';

// ============================================
// ZMIANY:
// - Props: brand + products (zamiast slug + import z data/)
// - Usunięto BRAND_DATA hardcoded
// - Usunięto martwy kod: selectedBrands / handleBrandToggle
// - Semantyczne HTML: <ul role="list"> + <li> na gridzie
// - FilterPanel owinięty w <aside>
// ============================================

interface BrandClientProps {
  brand: Brand;
  products: Product[];
}

export default function BrandClient({ brand, products }: BrandClientProps) {
  // Filter state — tylko kolory (na stronie marki nie filtrujemy po markach)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Extract unique colors with counts
  const colors = useMemo(() => {
    const colorMap = new Map<string, { hex: string; count: number }>();
    products.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: { name: string; hex: string }) => {
          if (colorMap.has(color.name)) {
            colorMap.get(color.name)!.count++;
          } else {
            colorMap.set(color.name, { hex: color.hex, count: 1 });
          }
        });
      }
    });
    return Array.from(colorMap.entries())
      .map(([name, data]) => ({ name, hex: data.hex, count: data.count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Filter products (tylko po kolorach na stronie marki)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedColors.length > 0) {
        if (!product.colors || !Array.isArray(product.colors)) {
          return false;
        }
        const productColorNames = product.colors.map((c: { name: string }) => c.name);
        if (!selectedColors.some(color => productColorNames.includes(color))) {
          return false;
        }
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
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleClearAll = () => {
    setSelectedColors([]);
  };

  return (
    <main className="brand-page">
      <div className="brand-spacer"></div>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/marki">Marki</Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>
      </div>

      <div className="brand-container">

        {/* Hero */}
        <div className="brand-hero">
          <div
            className="brand-logo"
            style={{ backgroundColor: brand.color || '#1a1a1a' }}
          >
            <span className="brand-logo-text">{brand.name.toUpperCase()}</span>
          </div>

          <div className="brand-hero-content">
            <h1 className="brand-headline">{brand.headline || brand.name}</h1>
            <p className="brand-description">{brand.description}</p>
          </div>
        </div>

        {/* Features */}
        {brand.features && brand.features.length > 0 && (
          <div className="brand-features">
            {brand.features.map((feature, index) => (
              <div key={index} className="brand-feature">
                <h2 className="brand-feature-title">{feature.title}</h2>
                <p className="brand-feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Products Section */}
        <h2 className="products-section-title">Produkty marki {brand.name}</h2>

        {/* Filter Panel — owinięty w <aside> */}
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
                <ProductCard
                  product={product}
                  highlightColor={getHighlightColor(product)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="products-empty">
            {products.length > 0 ? (
              <>
                <p>Brak produktów spełniających wybrane kryteria.</p>
                <button onClick={handleClearAll} className="back-link">
                  Wyczyść filtry →
                </button>
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
