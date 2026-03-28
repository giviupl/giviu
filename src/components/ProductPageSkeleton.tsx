import styles from '@/app/produkty/[slug]/ProductClient.module.css';

export default function ProductPageSkeleton() {
  return (
    <main className={styles['product-page']}>
      <div className="product-spacer"></div>
      
      {/* Breadcrumb skeleton */}
      <div className="breadcrumb-wrapper">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <div className="skeleton product-page-skeleton-breadcrumb" />
        </nav>
      </div>

      <div className={styles['product-container']}>
        <div className="product-page-skeleton-hero">
          
          {/* Gallery skeleton */}
          <div className="product-page-skeleton-gallery">
            <div className="product-page-skeleton-thumbs">
              <div className="skeleton product-page-skeleton-thumb" />
              <div className="skeleton product-page-skeleton-thumb" />
              <div className="skeleton product-page-skeleton-thumb" />
            </div>
            <div className="skeleton product-page-skeleton-main-image" />
          </div>

          {/* Info skeleton */}
          <div className="product-page-skeleton-info">
            <div className="skeleton product-page-skeleton-brand" />
            <div className="skeleton product-page-skeleton-title" />
            <div className="skeleton product-page-skeleton-desc" />
            
            <div className="skeleton product-page-skeleton-colors-label" />
            <div className="product-page-skeleton-colors-row">
              <div className="skeleton product-page-skeleton-color-swatch" />
              <div className="skeleton product-page-skeleton-color-swatch" />
              <div className="skeleton product-page-skeleton-color-swatch" />
              <div className="skeleton product-page-skeleton-color-swatch" />
            </div>

            <div className="skeleton product-page-skeleton-price" />
            <div className="skeleton product-page-skeleton-btn" />
          </div>
          
        </div>
      </div>
    </main>
  );
}
