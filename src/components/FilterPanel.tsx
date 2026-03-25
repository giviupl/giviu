'use client';

import { useState, useEffect, useRef } from 'react';

interface BrandFilter {
  name: string;
  count: number;
}

interface ColorFilter {
  name: string;
  hex: string;
  count: number;
}

interface FilterPanelProps {
  brands: BrandFilter[];
  colors: ColorFilter[];
  selectedBrands: string[];
  selectedColors: string[];
  onBrandToggle: (brand: string) => void;
  onColorToggle: (color: string) => void;
  onClearAll: () => void;
  totalResults: number;
}

function pluralize(count: number): string {
  if (count === 1) return 'produkt';
  if (count >= 2 && count <= 4) return 'produkty';
  return 'produktów';
}

export default function FilterPanel({
  brands,
  colors,
  selectedBrands,
  selectedColors,
  onBrandToggle,
  onColorToggle,
  onClearAll,
  totalResults,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const activeFiltersCount = selectedBrands.length + selectedColors.length;
  const hasActiveFilters = activeFiltersCount > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="filter-panel-wrapper" ref={panelRef}>
      <div className="filter-header">
        <button 
          className={`filter-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="filter-panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="10" cy="18" r="2" fill="currentColor" />
          </svg>
          Filtry
          {activeFiltersCount > 0 && (
            <span className="filter-count-badge" aria-label={`${activeFiltersCount} aktywnych filtrów`}>
              {activeFiltersCount}
            </span>
          )}
          <svg 
            className={`filter-chevron ${isOpen ? 'open' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {hasActiveFilters && (
          <div className="filter-chips" role="list" aria-label="Aktywne filtry">
            {selectedBrands.map(brand => (
              <button
                key={brand}
                className="filter-chip"
                onClick={() => onBrandToggle(brand)}
                aria-label={`Usuń filtr: ${brand}`}
              >
                {brand}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
            {selectedColors.map(color => {
              const colorData = colors.find(c => c.name === color);
              return (
                <button
                  key={color}
                  className="filter-chip"
                  onClick={() => onColorToggle(color)}
                  aria-label={`Usuń filtr: ${color}`}
                >
                  <span 
                    className="filter-chip-color" 
                    style={{ backgroundColor: colorData?.hex }}
                    aria-hidden="true"
                  />
                  {color}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              );
            })}
            <button 
              className="filter-clear-all" 
              onClick={onClearAll}
              aria-label="Wyczyść wszystkie filtry"
            >
              Wyczyść wszystko
            </button>
          </div>
        )}
      </div>

      <div 
        id="filter-panel"
        className={`filter-panel ${isOpen ? 'open' : ''}`}
        role="region"
        aria-label="Panel filtrów"
      >
        <div className="filter-panel-content">
          <div className="filter-panel-inner">
            
            {brands.length > 0 && (
              <div className="filter-column">
                <h4 className="filter-column-title">Marka</h4>
                <div className="filter-options" role="group" aria-label="Filtruj po marce">
                  {brands.map(({ name, count }) => (
                    <label key={name} className="filter-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(name)}
                        onChange={() => onBrandToggle(name)}
                      />
                      <span className="filter-checkbox-text">{name}</span>
                      <span className="filter-checkbox-count">({count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="filter-column">
                <h4 className="filter-column-title">Kolor</h4>
                <div className="filter-color-options" role="group" aria-label="Filtruj po kolorze">
                  {colors.map(({ name, hex, count }) => (
                    <button
                      key={name}
                      className={`filter-color-btn ${selectedColors.includes(name) ? 'active' : ''}`}
                      onClick={() => onColorToggle(name)}
                      title={`${name} (${count})`}
                      aria-label={`${name} (${count} produktów)`}
                      aria-pressed={selectedColors.includes(name)}
                    >
                      <span 
                        className="filter-color-swatch" 
                        style={{ backgroundColor: hex }}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <p className="filter-results-count" aria-live="polite">
        Znaleziono: <strong>{totalResults}</strong> {pluralize(totalResults)}
      </p>
    </div>
  );
}