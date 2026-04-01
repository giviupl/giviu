'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import styles from '@/styles/CategoryPages.module.css';
import type { Product } from '@/types';
import { supabase } from '@/lib/supabase';

export default function NowosciPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*').eq('is_new', true).order('created_at', { ascending: false });
      if (!error && data) setAllProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const brands = useMemo(() => {
    const brandMap = new Map<string, number>();
    allProducts.forEach(product => { const brand = product.brand_name; if (brand) brandMap.set(brand, (brandMap.get(brand) || 0) + 1); });
    return Array.from(brandMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allProducts]);

  const colors = useMemo(() => {
    const colorMap = new Map<string, { hex: string; count: number }>();
    allProducts.forEach(product => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: { name: string; hex: string }) => {
          if (colorMap.has(color.name)) colorMap.get(color.name)!.count++;
          else colorMap.set(color.name, { hex: color.hex, count: 1 });
        });
      }
    });
    return Array.from(colorMap.entries()).map(([name, data]) => ({ name, hex: data.hex, count: data.count })).sort((a, b) => b.count - a.count);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (selectedBrands.length > 0 && (!product.brand_name || !selectedBrands.includes(product.brand_name))) return false;
      if (selectedColors.length > 0) {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        const productColorNames = product.colors.map((c: { name: string }) => c.name);
        if (!selectedColors.some(color => productColorNames.includes(color))) return false;
      }
      return true;
    });
  }, [allProducts, selectedBrands, selectedColors]);

  const getHighlightColor = (product: Product) => {
    if (selectedColors.length === 0) return undefined;
    const productColorNames = product.colors?.map((c: { name: string }) => c.name) || [];
    return selectedColors.find(color => productColorNames.includes(color));
  };

  const handleBrandToggle = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  const handleColorToggle = (color: string) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  const handleClearAll = () => { setSelectedBrands([]); setSelectedColors([]); };

  return (
    <main className={styles['nowosci-page']}>
      <div className={styles['nowosci-container']}>
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link><span>/</span><span>Nowości</span>
        </nav>
        <header className={styles['nowosci-header']}>
          <div className={styles['nowosci-title-wrapper']}><SectionLine spacing="sm" /><h1 className={styles['nowosci-title']}>Nowości</h1></div>
          <p className={styles['nowosci-description']}>Odkryj najnowsze produkty w naszej ofercie. Świeże propozycje od najlepszych marek premium.</p>
        </header>

        {loading && (<div className={styles['nowosci-empty']}><div className="spinner"></div></div>)}

        {!loading && allProducts.length > 0 && (brands.length > 0 || colors.length > 0) && (
          <aside aria-label="Filtry produktów">
            <FilterPanel brands={brands} colors={colors} selectedBrands={selectedBrands} selectedColors={selectedColors} onBrandToggle={handleBrandToggle} onColorToggle={handleColorToggle} onClearAll={handleClearAll} totalResults={filteredProducts.length} />
          </aside>
        )}

        {!loading && filteredProducts.length > 0 ? (
          <ul role="list" className={styles['nowosci-grid']}>
            {filteredProducts.map((product) => (<li key={product.id}><ProductCard product={product} highlightColor={getHighlightColor(product)} /></li>))}
          </ul>
        ) : !loading && (
          <div className={styles['nowosci-empty']}>
            {allProducts.length > 0 ? (<><p>Brak produktów spełniających wybrane kryteria.</p><button onClick={handleClearAll} className={styles['nowosci-link']}>Wyczyść filtry →</button></>) : (<><p>Brak nowych produktów. Wróć wkrótce!</p><Link href="/kolekcje" className={styles['nowosci-link']}>Zobacz wszystkie kolekcje →</Link></>)}
          </div>
        )}
      </div>
    </main>
  );
}
