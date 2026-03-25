'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import type { Category, Subcategory, Product } from '@/types';

// ============================================
// ZMIANY:
// - Props: category + subcategory + products (zamiast slug + import z data/)
// - Usunięto import CATEGORIES_DATA, getProductsBySubcategory
// - Semantyczne: <aside> wokół filtrów, <ul role="list"> + <li>
// ============================================

interface SubcategoryClientProps {
  category: Category;
  subcategory: Subcategory;
  products: Product[];
  categorySlug: string;
}

export default function SubcategoryClient({ category, subcategory, products, categorySlug }: SubcategoryClientProps) {
  const brandsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const brand = p.brand_name;
      if (brand) {
        counts[brand] = (counts[brand] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const colorsWithCounts = useMemo(() => {
    const counts: Record<string, { count: number; hex: string }> = {};
    products.forEach(p => {
      p.colors?.forEach(c => {
        if (!counts[c.name]) {
          counts[c.name] = { count: 0, hex: c.hex };
        }
        counts[c.name].count += 1;
      });
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, hex: data.hex, count: data.count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand_name);
      const matchesColor = selectedColors.length === 0 ||
        product.colors?.some(c => selectedColors.includes(c.name));
      return matchesBrand && matchesColor;
    });
  }, [products, selectedBrands, selectedColors]);

  const getHighlightColor = (product: Product) => {
    if (selectedColors.length === 0) return undefined;
    const productColorNames = product.colors?.map(c => c.name) || [];
    return selectedColors.find(color => productColorNames.includes(color));
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
  };

  return (
    <>
      <div className="subcategory-container">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/kolekcje">Kolekcje</Link>
          <span>/</span>
          <Link href={`/kategorie/${categorySlug}`}>{category.title}</Link>
          <span>/</span>
          <span>{subcategory.name}</span>
        </nav>

        <header className="subcategory-header">
          <div className="subcategory-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="subcategory-title">{subcategory.name}</h1>
          </div>
          <p className="subcategory-description">
            Odkryj naszą kolekcję {subcategory.name.toLowerCase()} do personalizacji z logo Twojej firmy
          </p>
        </header>

        {products.length > 0 && (
          <aside aria-label="Filtry produktów">
            <FilterPanel
              brands={brandsWithCounts}
              colors={colorsWithCounts}
              selectedBrands={selectedBrands}
              selectedColors={selectedColors}
              onBrandToggle={toggleBrand}
              onColorToggle={toggleColor}
              onClearAll={clearAllFilters}
              totalResults={filteredProducts.length}
            />
          </aside>
        )}

        {filteredProducts.length > 0 ? (
          <ul role="list" className="subcategory-grid">
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
          <div className="subcategory-empty">
            <p className="subcategory-empty-text">
              {products.length > 0
                ? 'Brak produktów spełniających wybrane kryteria'
                : 'Produkty w tej kategorii pojawią się wkrótce'
              }
            </p>
            {products.length > 0 ? (
              <button onClick={clearAllFilters} className="subcategory-back-btn">
                Wyczyść filtry
              </button>
            ) : (
              <Link href={`/kategorie/${categorySlug}`} className="subcategory-back-btn">
                Wróć do {category.title}
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
