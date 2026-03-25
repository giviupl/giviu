'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuoteStore } from '@/stores/quoteStore';
import ColorSwatch from './ColorSwatch';

// ============================================
// ZMIANA: next/image na kartach produktów
// - Jeśli kolor ma images[] → wyświetla prawdziwe zdjęcie
// - Jeśli nie → fallback na emoji/placeholder
// ============================================

export interface ProductColor {
  name: string;
  hex: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  brand_name?: string;
  brand?: string;
  price: string;
  slug: string;
  colors?: ProductColor[];
  images?: string[];
  emoji?: string;
  views?: string[];
  image_url?: string;
}

interface ProductCardProps {
  product: Product;
  highlightColor?: string;
}

type AnimationState = 'idle' | 'adding' | 'just-added' | 'removing';

export default function ProductCard({ product, highlightColor }: ProductCardProps) {
  const { addItem, removeItem, isInQuote } = useQuoteStore();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [inQuote, setInQuote] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const colors = product.colors || [];
  const selectedColor = colors[selectedColorIndex];
  const views = product.views || [];
  const brandDisplay = product.brand_name || product.brand || '';

  // Zdjęcia dla wybranego koloru
  const colorImages = selectedColor?.images ?? [];
  const hasRealImages = colorImages.length > 0;
  const galleryCount = hasRealImages ? colorImages.length : 0;

  useEffect(() => {
    if (highlightColor && colors.length > 0) {
      const index = colors.findIndex(c => c.name === highlightColor);
      if (index !== -1) {
        setSelectedColorIndex(index);
      }
    }
  }, [highlightColor, colors]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColorIndex]);

  useEffect(() => {
    setMounted(true);
    setInQuote(isInQuote(product.id, selectedColorIndex));
  }, [isInQuote, product.id, selectedColorIndex]);

  useEffect(() => {
    if (!mounted) return;
    const unsubscribe = useQuoteStore.subscribe(() => {
      setInQuote(useQuoteStore.getState().isInQuote(product.id, selectedColorIndex));
    });
    return () => unsubscribe();
  }, [mounted, product.id, selectedColorIndex]);

  const handleToggleQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (animationState !== 'idle') return;

    if (inQuote) {
      setAnimationState('removing');
      removeItem(product.id, selectedColorIndex);
      setTimeout(() => { setAnimationState('idle'); }, 250);
    } else {
      setAnimationState('adding');
      setTimeout(() => {
        addItem({
          id: product.id,
          name: product.name,
          brand: brandDisplay,
          price: product.price,
          slug: product.slug,
          emoji: product.emoji,
          colorIndex: selectedColorIndex,
          colorName: selectedColor?.name,
          colorHex: selectedColor?.hex,
          colorImage: selectedColor?.images?.[0],
        });
        setAnimationState('just-added');
        setTimeout(() => { setAnimationState('idle'); }, 350);
      }, 150);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (galleryCount <= 1) return;

    const diff = touchStartX.current - touchEndX.current;

    if (isDragging.current && Math.abs(diff) > 50) {
      e.preventDefault();
      if (diff > 0) {
        setCurrentImageIndex((prev) => prev < galleryCount - 1 ? prev + 1 : 0);
      } else {
        setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryCount - 1);
      }
    }
    isDragging.current = false;
  };

  return (
    <div className="product-card-wrapper">
      <Link href={`/produkty/${product.slug}${selectedColorIndex > 0 ? `?color=${selectedColor?.name?.toLowerCase().replace(/\s+/g, '-')}` : ''}`} className="product-card">
        {/* Image */}
        <div
          className="product-card-image"
          style={{
            backgroundColor: hasRealImages ? '#ffffff' : (selectedColor?.hex ? `${selectedColor.hex}15` : '#f3f4f6'),
            touchAction: 'pan-y pinch-zoom'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="product-card-badge">{brandDisplay}</span>

          <button
            onClick={handleToggleQuote}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className={`product-card-cart-btn ${mounted && inQuote ? 'in-quote' : ''} ${animationState !== 'idle' ? animationState : ''}`}
            aria-label={mounted && inQuote ? `Usuń ${product.name} z wyceny` : `Dodaj ${product.name} do wyceny`}
            disabled={animationState !== 'idle'}
          >
            <span className="product-card-cart-icon">+</span>
          </button>

          {/* Zdjęcie lub fallback */}
          {hasRealImages ? (
            <Image
              src={colorImages[currentImageIndex] ?? colorImages[0]}
              alt={`${product.name} ${selectedColor?.name ?? ''}`}
              fill
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              className="product-card-photo"
            />
          ) : (
            <div className="product-card-placeholder">
              {views.length > 1 ? (
                <span className="product-card-emoji">{views[currentImageIndex]}</span>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>
          )}

          {/* Dots + Desktop Arrows */}
          {galleryCount > 1 && (
            <>
              <div className="product-card-dots">
                {Array.from({ length: galleryCount }).map((_, idx) => (
                  <span key={idx} className={`product-card-dot ${idx === currentImageIndex ? 'active' : ''}`} />
                ))}
              </div>

              {/* Strzałki desktop — widoczne na hover */}
              <button
                className="product-card-arrow product-card-arrow-left"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : galleryCount - 1);
                }}
                aria-label="Poprzednie zdjęcie"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="product-card-arrow product-card-arrow-right"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev < galleryCount - 1 ? prev + 1 : 0);
                }}
                aria-label="Następne zdjęcie"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Info */}
        <div className="product-card-info">
          <p className="product-card-brand">{brandDisplay.toUpperCase()}</p>
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-price">{product.price}</p>
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="product-card-colors">
          <ColorSwatch
            colors={colors}
            selectedIndex={selectedColorIndex}
            onSelect={setSelectedColorIndex}
            size="md"
            shape="square"
          />
        </div>
      )}
    </div>
  );
}
