'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import ProductCard from '@/components/ProductCard';
import FilterPanel from '@/components/FilterPanel';
import Pagination from './Pagination';
import styles from '@/styles/CategoryPages.module.css';
import searchStyles from './SearchPage.module.css';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductShape = any;

interface Props {
  query: string;
  brandsWithCounts: { name: string; count: number }[];
  colorsWithCounts: { name: string; hex: string; count: number }[];
  selectedBrands: string[];
  selectedColors: string[];
  products: ProductShape[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  suggestions: { query: string; count: number }[];
}

// ============================================
// SearchClient — UI dla /szukaj
// URL state = source of truth
// "Did you mean?" w empty state (Algolia best practice)
// ============================================
export default function SearchClient({
  query,
  brandsWithCounts,
  colorsWithCounts,
  selectedBrands,
  selectedColors,
  products,
  totalCount,
  currentPage,
  totalPages,
  suggestions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(query);
  const [isPending, startTransition] = useTransition();

  const buildUrl = (updates: Record<string, string | null>): string => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    const str = params.toString();
    return `/szukaj${str ? `?${str}` : ''}`;
  };

  const navigateWithFilters = (brands: string[], colors: string[]) => {
    startTransition(() => {
      router.push(
        buildUrl({
          brand: brands.length ? brands.join(',') : null,
          color: colors.length ? colors.join(',') : null,
          page: null,
        }),
      );
    });
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    navigateWithFilters(next, selectedColors);
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    navigateWithFilters(selectedBrands, next);
  };

  const clearAll = () => navigateWithFilters([], []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    startTransition(() => {
      router.push(
        buildUrl({
          q: trimmed || null,
          brand: null,
          color: null,
          page: null,
        }),
      );
    });
  };

  const goToSuggestion = (newQuery: string) => {
    setSearchInput(newQuery);
    startTransition(() => {
      router.push(
        buildUrl({
          q: newQuery,
          brand: null,
          color: null,
          page: null,
        }),
      );
    });
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedColors.length > 0;
  const showFilters =
    query && (brandsWithCounts.length > 0 || colorsWithCounts.length > 0);

  return (
    <div className={styles['subcategory-container']}>
      <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
        <Link href="/">Strona główna</Link>
        <span>/</span>
        <span>Wyszukiwanie{query ? `: ${query}` : ''}</span>
      </nav>

      <header className={styles['subcategory-header']}>
        <div className={styles['subcategory-title-wrapper']}>
          <SectionLine spacing="sm" />
          <h1 className={styles['subcategory-title']}>
            {query ? <>Wyniki dla „{query}"</> : 'Wyszukiwanie produktów'}
          </h1>
        </div>
        <p className={styles['subcategory-description']}>
          {query
            ? `Wyszukaj wśród naszej kolekcji premium prezentów firmowych. Doprecyzuj wynik przy pomocy filtrów poniżej.`
            : 'Wpisz frazę aby znaleźć produkty z naszej kolekcji.'}
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className={searchStyles.searchForm}
          role="search"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Szukaj produktów, marek, kategorii..."
            className={searchStyles.searchInput}
            disabled={isPending}
            aria-label="Wyszukaj produkty"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            className={searchStyles.searchSubmit}
            disabled={isPending}
          >
            {isPending ? 'Szukam…' : 'Szukaj'}
          </button>
        </form>
      </header>

      {showFilters && (
        <aside aria-label="Filtry produktów">
          <FilterPanel
            brands={brandsWithCounts}
            colors={colorsWithCounts}
            selectedBrands={selectedBrands}
            selectedColors={selectedColors}
            onBrandToggle={toggleBrand}
            onColorToggle={toggleColor}
            onClearAll={clearAll}
            totalResults={totalCount}
          />
        </aside>
      )}

      {products.length > 0 ? (
        <>
          <ul role="list" className={styles['subcategory-grid']}>
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              buildUrl={(page) =>
                buildUrl({ page: page === 1 ? null : String(page) })
              }
            />
          )}
        </>
      ) : (
        <div className={styles['subcategory-empty']}>
          <p className={styles['subcategory-empty-text']}>
            {query
              ? hasActiveFilters
                ? `Brak produktów dla „${query}" z wybranymi filtrami.`
                : `Brak produktów dla „${query}".`
              : 'Wpisz frazę powyżej, aby zacząć wyszukiwanie.'}
          </p>

          {/* "Did you mean?" — sugestie pojedynczych słów które MAJĄ wyniki */}
          {query && !hasActiveFilters && suggestions.length > 0 && (
            <div className={searchStyles.suggestions}>
              <p className={searchStyles.suggestionsLabel}>Spróbuj:</p>
              <div className={searchStyles.suggestionsList}>
                {suggestions.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => goToSuggestion(s.query)}
                    className={searchStyles.suggestionBtn}
                    disabled={isPending}
                  >
                    {s.query}{' '}
                    <span className={searchStyles.suggestionCount}>
                      ({s.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasActiveFilters ? (
            <button
              onClick={clearAll}
              className={styles['subcategory-back-btn']}
              disabled={isPending}
            >
              Wyczyść filtry
            </button>
          ) : query && suggestions.length === 0 ? (
            <Link href="/" className={styles['subcategory-back-btn']}>
              Wróć na stronę główną
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
