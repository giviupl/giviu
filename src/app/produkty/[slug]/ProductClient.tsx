'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import ColorSwatch from '@/components/ColorSwatch';
import ProductCard from '@/components/ProductCard';
import ProductLightbox from '@/components/ProductLightbox';
import type { Product } from '@/types';
import styles from './ProductClient.module.css';

// ============================================
// ZMIANA: next/image galeria zdjęć per kolor
// - Jeśli kolor ma images[] → wyświetla prawdziwe zdjęcia
// - Jeśli nie ma → fallback na emoji/placeholder (backward compat)
// ============================================

interface ProductClientProps {
  product: Product;
  relatedProducts: Product[];
}

const MARKING_METHODS: Record<string, { name: string; description: string; icon: string }> = {
  'N2': { name: 'Nadruk', description: 'Tampodruk lub sitodruk — idealne dla wielokolorowych logo', icon: '🖨️' },
  'G5': { name: 'Grawer laserowy', description: 'Trwałe, eleganckie znakowanie na metalach i skórze', icon: '✨' },
  'T1': { name: 'Tłoczenie', description: 'Klasyczne wytłoczenie logo — premium wygląd', icon: '🔖' },
  'U1': { name: 'Nadruk UV', description: 'Pełnokolorowy druk z efektem wypukłości', icon: '🌈' },
  'S2': { name: 'Sitodruk', description: 'Ekonomiczna metoda dla dużych nakładów', icon: '🎨' },
  'D1': { name: 'DTF', description: 'Druk transferowy — idealne na tekstylia', icon: '👕' },
  'H1': { name: 'Haft', description: 'Trwałe, eleganckie znakowanie na tkaninach', icon: '🧵' },
};

const MAX_DESCRIPTION_LENGTH = 300;

type TabType = 'opis' | 'specyfikacja' | 'personalizacja' | 'dostawa';
type AnimationState = 'idle' | 'adding' | 'just-added' | 'removing';

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Odczytaj kolor z URL (?color=dried-pine)
  const getInitialColorIndex = () => {
    const colorParam = searchParams.get('color');
    if (colorParam && product?.colors) {
      const index = product.colors.findIndex(
        c => c.name.toLowerCase().replace(/\s+/g, '-') === colorParam.toLowerCase()
      );
      if (index !== -1) return index;
    }
    return 0;
  };

  const [selectedColor, setSelectedColor] = useState(getInitialColorIndex);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('specyfikacja');
  const [mounted, setMounted] = useState(false);
  const [inQuote, setInQuote] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const { addItem, removeItem, isInQuote } = useQuoteStore();

  const isLongDescription = product.description.length > MAX_DESCRIPTION_LENGTH;
  const shortDescription = isLongDescription
    ? product.description.slice(0, MAX_DESCRIPTION_LENGTH).trim() + '...'
    : product.description;

  // Zdjęcia dla wybranego koloru
  const currentColorImages = product.colors[selectedColor]?.images ?? [];
  const hasRealImages = currentColorImages.length > 0;
  // Fallback na stary system views (emoji) jeśli brak zdjęć
  const views = product.views ?? [];

  // Ile elementów w galerii (zdjęcia lub emoji)
  const galleryCount = hasRealImages ? currentColorImages.length : views.length;

  // Hydration fix + zapisz do ostatnio oglądanych + kategoria dla Headera
  useEffect(() => {
    setMounted(true);
    setInQuote(isInQuote(product.id, selectedColor));

    // Zapisz kategorię produktu w sessionStorage — Header odczyta to do podświetlenia
    sessionStorage.setItem('giviu-product-category', product.category_slug);

    useRecentlyViewedStore.getState().addProduct({
      id: product.id,
      name: product.name,
      brand: product.brand_name,
      price: product.price,
      slug: product.slug,
      colors: product.colors,
    });
  }, [isInQuote, product, selectedColor]);

  // Subskrybuj zmiany w store
  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = useQuoteStore.subscribe(() => {
      setInQuote(useQuoteStore.getState().isInQuote(product.id, selectedColor));
    });

    return () => unsubscribe();
  }, [mounted, product, selectedColor]);

  // Reset image index when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor]);

  const handleToggleQuote = () => {
    if (animationState !== 'idle') return;

    if (inQuote) {
      setAnimationState('removing');
      removeItem(product.id, selectedColor);
      setTimeout(() => { setAnimationState('idle'); }, 250);
    } else {
      setAnimationState('adding');
      setTimeout(() => {
        addItem({
          id: product.id,
          name: product.name,
          brand: product.brand_name,
          price: product.price,
          slug: product.slug,
          emoji: product.emoji,
          colorIndex: selectedColor,
          colorName: product.colors[selectedColor]?.name,
          colorHex: product.colors[selectedColor]?.hex,
          colorImage: product.colors[selectedColor]?.images?.[0],
        });
        setAnimationState('just-added');
        setTimeout(() => { setAnimationState('idle'); }, 400);
      }, 150);
    }
  };

  const getMarkingMethods = () => {
    if (!product.marking) return [];
    return product.marking
      .split(',')
      .map(code => code.trim())
      .filter(code => MARKING_METHODS[code])
      .map(code => ({ code, ...MARKING_METHODS[code] }));
  };

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const tabs: TabType[] = isLongDescription
      ? ['opis', 'specyfikacja', 'personalizacja', 'dostawa']
      : ['specyfikacja', 'personalizacja', 'dostawa'];
    const currentIndex = tabs.indexOf(activeTab);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(tabs[tabs.length - 1]);
    }
  };

  // Swipe na głównym zdjęciu
  const handleImageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleImageTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isDragging.current = true;
    }
  };

  const handleImageTouchEnd = () => {
    if (galleryCount === 0) return;
    const diff = touchStartX.current - touchEndX.current;

    if (isDragging.current && Math.abs(diff) > 50) {
      if (diff > 0) {
        setSelectedImageIndex((prev) => prev < galleryCount - 1 ? prev + 1 : 0);
      } else {
        setSelectedImageIndex((prev) => prev > 0 ? prev - 1 : galleryCount - 1);
      }
    }
    isDragging.current = false;
  };

  const markingMethods = getMarkingMethods();

  return (
    <main className={styles['product-page']}>
      <div className="product-spacer"></div>

      {/* Breadcrumb */}
      <div className="breadcrumb-wrapper">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/kolekcje">Kolekcje</Link>
          <span>/</span>
          <Link href={`/kategorie/${product.category_slug}`}>{product.category}</Link>
          <span>/</span>
          <Link href={`/kategorie/${product.category_slug}/${product.subcategory_slug}`}>
            {product.subcategory}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
      </div>

      <div className={styles['product-container']}>

        {/* Hero Section */}
        <div className={styles['product-hero']}>

          {/* Left - Thumbnails */}
          <div className={styles['product-thumbnails']} role="group" aria-label="Widoki produktu">
            {hasRealImages ? (
              // Prawdziwe zdjęcia jako thumbnails
              currentColorImages.map((imgSrc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`${styles['product-thumbnail']} ${selectedImageIndex === idx ? styles.active : ''}`}
                  aria-label={`Zdjęcie ${idx + 1}${selectedImageIndex === idx ? ' (aktywne)' : ''}`}
                  aria-pressed={selectedImageIndex === idx}
                >
                  <Image
                    src={imgSrc}
                    alt={`${product.name} — widok ${idx + 1}`}
                    width={80}
                    height={80}
                    className={styles['product-thumbnail-image']}
                  />
                </button>
              ))
            ) : (
              // Fallback: emoji thumbnails
              views.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`${styles['product-thumbnail']} ${selectedImageIndex === idx ? styles.active : ''}`}
                  style={{ backgroundColor: product.colors[selectedColor]?.hex ? `${product.colors[selectedColor].hex}20` : '#f3f4f6' }}
                  aria-label={`Widok ${idx + 1}${selectedImageIndex === idx ? ' (aktywny)' : ''}`}
                  aria-pressed={selectedImageIndex === idx}
                >
                  <span className={styles['product-thumbnail-emoji']}>{emoji}</span>
                </button>
              ))
            )}
          </div>

          {/* Center - Main Image */}
          <div className={styles['product-main-image-wrapper']}>
            <div
              ref={imageRef}
              className={styles['product-main-image']}
              style={{ backgroundColor: hasRealImages ? '#ffffff' : (product.colors[selectedColor]?.hex ? `${product.colors[selectedColor].hex}15` : '#f3f4f6') }}
              onTouchStart={handleImageTouchStart}
              onTouchMove={handleImageTouchMove}
              onTouchEnd={handleImageTouchEnd}
            >
              <span className={styles['product-image-badge']}>{product.brand_name}</span>

              <button
                onClick={handleToggleQuote}
                className={`${styles['product-image-cart-btn']} ${mounted && inQuote ? styles['in-quote'] : ''}`}
                aria-label={mounted && inQuote ? 'Usuń z wyceny' : 'Dodaj do wyceny'}
              >
                <span className={styles['product-image-cart-icon']}>+</span>
              </button>

              {hasRealImages ? (
                // Prawdziwe zdjęcie — kliknięcie otwiera lightbox
                <div
                  className={styles['product-main-photo-wrapper']}
                  onClick={() => setLightboxOpen(true)}
                  style={{ cursor: 'zoom-in' }}
                >
                  <Image
                    src={currentColorImages[selectedImageIndex] ?? currentColorImages[0]}
                    alt={`${product.name} ${product.colors[selectedColor]?.name ?? ''}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={selectedImageIndex === 0}
                    className={styles['product-main-photo']}
                  />
                </div>
              ) : (
                // Fallback: placeholder SVG
                <div className={styles['product-main-placeholder']}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}


            </div>
          </div>

          {/* Right - Product Info */}
          <div className={styles['product-info']}>
            <div className={styles['product-info-content']}>
              <p className={styles['product-brand']}>{product.brand_name.toUpperCase()}</p>
              <h1 className={styles['product-title']}>{product.name}</h1>
              <p className={styles['product-code']}>Kod: {product.code}</p>

              <p className={styles['product-description']}>
                {shortDescription}
                {isLongDescription && (
                  <button
                    className={styles['product-description-more']}
                    onClick={() => {
                      setActiveTab('opis');
                      setTimeout(() => {
                        const element = tabsRef.current;
                        if (element) {
                          const offset = 450;
                          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
                        }
                      }, 50);
                    }}
                  >
                    więcej
                  </button>
                )}
              </p>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className={styles['product-colors']}>
                  <h2 className={styles['product-colors-label']}>Dostępne kolory</h2>
                  <ColorSwatch
                    colors={product.colors}
                    selectedIndex={selectedColor}
                    onSelect={(index: number) => {
                      setSelectedColor(index);
                      const colorSlug = product.colors[index]?.name.toLowerCase().replace(/\s+/g, '-');
                      if (colorSlug) {
                        router.replace(`/produkty/${product.slug}?color=${colorSlug}`, { scroll: false });
                      }
                    }}
                    size="lg"
                    shape="square"
                  />
                  <p className={styles['product-color-name']} aria-live="polite">
                    Wybrany: <span>{product.colors[selectedColor]?.name}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Personalizacja — skrót nad ceną */}
            {product.marking && (
              <div className={styles['product-marking-summary']}>
                <span className={styles['product-marking-summary-label']}>Personalizacja: </span>
                <span className={styles['product-marking-summary-methods']}>
                  {product.marking.split(',').map(code => {
                    const method: Record<string, string> = {
                      'N2': 'Nadruk', 'G5': 'Grawer', 'T1': 'Tłoczenie',
                      'U1': 'Nadruk UV', 'S2': 'Sitodruk', 'D1': 'DTF', 'H1': 'Haft'
                    };
                    return method[code.trim()];
                  }).filter(Boolean).join(' · ')}
                </span>
              </div>
            )}

            {/* CTA Wrapper */}
            <div className={styles['product-cta-wrapper']}>
              <div className={styles['product-price-wrapper']} aria-live="polite">
                <span className={styles['product-price']}>{product.price}</span>
                <span className={styles['product-price-note']}>netto / szt.</span>
              </div>

              <button
                onClick={handleToggleQuote}
                className={`${styles['product-cta-btn']} ${mounted && inQuote ? styles['in-quote'] : ''} ${animationState !== 'idle' ? styles[animationState] : ''}`}
                disabled={animationState !== 'idle'}
              >
                {mounted && inQuote && (
                  <svg className={styles['cta-checkmark']} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                )}
                {mounted && inQuote ? 'Dodano' : 'Dodaj do wyceny'}
              </button>
            </div>
          </div>

        </div>

        {/* Tabs Section */}
        <div className={styles['product-tabs-section']} ref={tabsRef}>
          <div className={styles['product-tabs']} role="tablist" aria-label="Informacje o produkcie" onKeyDown={handleTabKeyDown}>
            {isLongDescription && (
              <button role="tab" id="tab-opis" aria-selected={activeTab === 'opis'} aria-controls="tabpanel-opis" className={`${styles['product-tab']} ${activeTab === 'opis' ? styles.active : ''}`} onClick={() => setActiveTab('opis')} tabIndex={activeTab === 'opis' ? 0 : -1}>Opis</button>
            )}
            <button role="tab" id="tab-specyfikacja" aria-selected={activeTab === 'specyfikacja'} aria-controls="tabpanel-specyfikacja" className={`${styles['product-tab']} ${activeTab === 'specyfikacja' ? styles.active : ''}`} onClick={() => setActiveTab('specyfikacja')} tabIndex={activeTab === 'specyfikacja' ? 0 : -1}>Specyfikacja</button>
            <button role="tab" id="tab-personalizacja" aria-selected={activeTab === 'personalizacja'} aria-controls="tabpanel-personalizacja" className={`${styles['product-tab']} ${activeTab === 'personalizacja' ? styles.active : ''}`} onClick={() => setActiveTab('personalizacja')} tabIndex={activeTab === 'personalizacja' ? 0 : -1}>Personalizacja</button>
            <button role="tab" id="tab-dostawa" aria-selected={activeTab === 'dostawa'} aria-controls="tabpanel-dostawa" className={`${styles['product-tab']} ${activeTab === 'dostawa' ? styles.active : ''}`} onClick={() => setActiveTab('dostawa')} tabIndex={activeTab === 'dostawa' ? 0 : -1}>Dostawa</button>
          </div>

          <div className={styles['product-tab-content']}>
            {activeTab === 'opis' && (
              <div role="tabpanel" id="tabpanel-opis" aria-labelledby="tab-opis" className={styles['product-full-description']}>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'specyfikacja' && (
              <div role="tabpanel" id="tabpanel-specyfikacja" aria-labelledby="tab-specyfikacja" className={styles['product-spec']}>
                <div className={styles['product-spec-grid']}>
                  {product.material && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Materiał</span><span className={styles['product-spec-value']}>{product.material}</span></div>)}
                  {product.dimensions && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Wymiary</span><span className={styles['product-spec-value']}>{product.dimensions}</span></div>)}
                  {product.weight && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Waga</span><span className={styles['product-spec-value']}>{product.weight}</span></div>)}
                  {product.moq && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Min. zamówienie</span><span className={styles['product-spec-value']}>{product.moq} szt.</span></div>)}
                  {product.colors && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Warianty kolorów</span><span className={styles['product-spec-value']}>{product.colors.length}</span></div>)}
                  {product.origin && (<div className={styles['product-spec-item']}><span className={styles['product-spec-label']}>Pochodzenie</span><span className={styles['product-spec-value']}>{product.origin}</span></div>)}
                </div>
              </div>
            )}
            {activeTab === 'personalizacja' && (
              <div role="tabpanel" id="tabpanel-personalizacja" aria-labelledby="tab-personalizacja" className={styles['product-personalization']}>
                {markingMethods.length > 0 ? (
                  <>
                    <div className={styles['product-marking-grid']}>
                      {markingMethods.map(method => (
                        <div key={method.code} className={styles['product-marking-card']}>
                          <span className={styles['product-marking-icon']}>{method.icon}</span>
                          <h3 className={styles['product-marking-name']}>{method.name}</h3>
                          <p className={styles['product-marking-desc']}>{method.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className={styles['product-personalization-note']}>
                      <span>Potrzebujesz pomocy w wyborze metody znakowania?<Link href="/kontakt"> Skontaktuj się z nami</Link></span>
                    </div>
                  </>
                ) : (
                  <p className={styles['product-no-marking']}>Informacje o metodach znakowania dostępne na zapytanie.</p>
                )}
              </div>
            )}
            {activeTab === 'dostawa' && (
              <div role="tabpanel" id="tabpanel-dostawa" aria-labelledby="tab-dostawa" className={styles['product-delivery']}>
                <div className={styles['product-delivery-grid']}>
                  <div className={styles['product-delivery-card']}><div className={styles['product-delivery-icon']}>📦</div><strong className={styles['product-info-label']}>Czas realizacji</strong><p>Standard: <strong>10-14 dni roboczych</strong></p><p className={styles['product-delivery-note']}>Od zatwierdzenia projektu</p></div>
                  <div className={styles['product-delivery-card']}><div className={styles['product-delivery-icon']}>🚚</div><strong className={styles['product-info-label']}>Wysyłka</strong><p>Kurier: <strong>DPD / DHL</strong></p><p className={styles['product-delivery-note']}>Darmowa dostawa od 500 zł</p></div>
                  <div className={styles['product-delivery-card']}><div className={styles['product-delivery-icon']}>⚡</div><strong className={styles['product-info-label']}>Ekspres</strong><p>Dostępna opcja: <strong>5-7 dni</strong></p><p className={styles['product-delivery-note']}>Dodatkowa opłata</p></div>
                </div>
                <div className={styles['product-delivery-info']}><p>Dokładny termin realizacji zależy od nakładu, metody znakowania oraz dostępności produktu. Szczegóły uzgadniamy indywidualnie po otrzymaniu zapytania.</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="product-related">
            <h2 className="product-related-title">Podobne produkty</h2>
            <ul role="list" className="product-related-grid">
              {relatedProducts.map(relatedProduct => (
                <li key={relatedProduct.id}>
                  <ProductCard product={relatedProduct} />
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>

      {/* Sticky CTA - mobile only */}
      <div className={styles['product-sticky-cta']}>
        <button
          onClick={handleToggleQuote}
          className={`${styles['product-sticky-btn']} ${mounted && inQuote ? styles['in-quote'] : ''} ${animationState !== 'idle' ? styles[animationState] : ''}`}
          disabled={animationState !== 'idle'}
        >
          {mounted && inQuote && (
            <svg className={styles['cta-checkmark']} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,8 7,12 13,4" />
            </svg>
          )}
          {mounted && inQuote ? 'Dodano' : 'Dodaj do wyceny'}
        </button>
      </div>
      {/* Lightbox — pełnoekranowa galeria */}
      {lightboxOpen && hasRealImages && (
        <ProductLightbox
          images={currentColorImages}
          currentIndex={selectedImageIndex}
          productName={product.name}
          colorName={product.colors[selectedColor]?.name}
          onClose={() => setLightboxOpen(false)}
          onChangeIndex={setSelectedImageIndex}
        />
      )}
    </main>
  );
}
