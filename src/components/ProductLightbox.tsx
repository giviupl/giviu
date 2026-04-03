'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ProductLightboxProps {
  images: string[];
  currentIndex: number;
  productName: string;
  colorName?: string;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export default function ProductLightbox({
  images,
  currentIndex,
  productName,
  colorName,
  onClose,
  onChangeIndex,
}: ProductLightboxProps) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handlePrev = useCallback(() => {
    onChangeIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  }, [currentIndex, images.length, onChangeIndex]);

  const handleNext = useCallback(() => {
    onChangeIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, images.length, onChangeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, handlePrev, handleNext]);

  // Click on overlay (outside image) closes lightbox
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Click on image — left half = prev, right half = next
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="lightbox-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria zdjęć: ${productName}`}
    >
      {/* Close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Zamknij galerię"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="lightbox-counter">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous arrow */}
      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-left"
          onClick={handlePrev}
          aria-label="Poprzednie zdjęcie"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Main image — left half = prev, right half = next */}
      <div
        className="lightbox-image-wrapper"
        onClick={handleImageClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left/right cursor zones */}
        {images.length > 1 && (
          <>
            <div className="lightbox-zone-left" />
            <div className="lightbox-zone-right" />
          </>
        )}
        <Image
          src={images[currentIndex]}
          alt={`${productName} ${colorName ?? ''} — zdjęcie ${currentIndex + 1}`}
          fill
          sizes="90vw"
          priority
          className="lightbox-image"
        />
      </div>

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-right"
          onClick={handleNext}
          aria-label="Następne zdjęcie"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
