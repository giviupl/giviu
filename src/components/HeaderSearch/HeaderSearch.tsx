'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  searchHeaderProductsAction,
  type HeaderSearchResult,
} from './actions';
import styles from './HeaderSearch.module.css';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;
const DROPDOWN_MIN_WIDTH = 380;

// ============================================
// HeaderSearch — autocomplete produktów dla giviu.pl
// Dropdown renderowany w portalu (document.body) z position: fixed,
// żeby ominąć stacking context hero / parent kontenerów.
// ============================================
export default function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HeaderSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Mark mounted (portal SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const data = await searchHeaderProductsAction(q);
      setResults(data);
      setLoading(false);
      setActiveIdx(-1);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Outside click → close (uwzględnia portal)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Recalc dropdown position (on open, scroll, resize)
  const q = query.trim();
  const showDropdown = open && q.length >= MIN_QUERY;

  useEffect(() => {
    if (!showDropdown) return;

    const update = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, DROPDOWN_MIN_WIDTH);
      // Trzymaj w viewport: jeśli za prawo, dosuń do prawej krawędzi
      const viewportWidth = window.innerWidth;
      let left = rect.left;
      if (left + width > viewportWidth - 12) {
        left = Math.max(12, viewportWidth - width - 12);
      }
      setDropdownPos({
        top: rect.bottom + 8,
        left,
        width,
      });
    };

    update();
    window.addEventListener('scroll', update, true); // capture — wewnętrzne scroll-containery też
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [showDropdown]);

  const goToProduct = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery('');
      setResults([]);
      router.push(`/produkty/${slug}`);
    },
    [router],
  );

  const goToSearchPage = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/szukaj?q=${encodeURIComponent(trimmed)}`);
  }, [query, router]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!open || results.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        goToSearchPage();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        goToProduct(results[activeIdx].slug);
      } else {
        goToSearchPage();
      }
    }
  };

  const noResults = !loading && showDropdown && results.length === 0;

  const dropdownNode =
    showDropdown && mounted ? (
      <div
        ref={dropdownRef}
        className={styles.dropdown}
        role="listbox"
        style={{
          position: 'fixed',
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          zIndex: 99999,
        }}
      >
        {loading && <div className={styles.hint}>Szukam…</div>}

        {noResults && (
          <div className={styles.hint}>Brak produktów dla „{q}"</div>
        )}

        {!loading && results.length > 0 && (
          <>
            <ul className={styles.list}>
              {results.map((p, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => goToProduct(p.slug)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`${styles.row} ${
                        isActive ? styles.rowActive : ''
                      }`}
                      role="option"
                      aria-selected={isActive}
                    >
                      <div className={styles.thumb}>
                        {p.thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumb}
                            alt=""
                            className={styles.thumbImg}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.thumbPlaceholder}>📦</div>
                        )}
                      </div>
                      <div className={styles.info}>
                        <div className={styles.name}>{p.name}</div>
                        <div className={styles.meta}>
                          {p.brand_name}
                          {p.price ? ` · ${p.price}` : ''}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={goToSearchPage}
              className={styles.viewAll}
            >
              Zobacz wszystkie wyniki dla „{q}" →
            </button>
          </>
        )}
      </div>
    ) : null;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrap}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="Szukaj prezentów, marek..."
          className={styles.input}
          aria-label="Szukaj produktów"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className={styles.clearBtn}
            aria-label="Wyczyść"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>

      {/* Portal: dropdown renderowany w document.body */}
      {dropdownNode && createPortal(dropdownNode, document.body)}
    </div>
  );
}
