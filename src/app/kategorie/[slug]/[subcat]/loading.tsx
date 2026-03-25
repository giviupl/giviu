import { ProductGridSkeleton } from '@/components/ProductCardSkeleton';

export default function Loading() {
  return (
    <main className="subcategory-page">
      <div className="subcategory-spacer"></div>
      
      {/* Banner skeleton */}
      <div className="category-banner">
        <div className="category-banner-content">
          <div className="skeleton subcategory-skeleton-banner-title" />
          <div className="skeleton subcategory-skeleton-banner-desc" />
        </div>
      </div>

      <div className="subcategory-container">
        {/* Breadcrumb skeleton */}
        <div className="breadcrumb-wrapper">
          <div className="skeleton subcategory-skeleton-breadcrumb" />
        </div>

        <div className="subcategory-content">
          {/* Filters skeleton */}
          <aside className="filter-sidebar">
            <div className="skeleton subcategory-skeleton-filters" />
          </aside>

          {/* Products grid skeleton */}
          <div className="subcategory-products">
            <div className="skeleton subcategory-skeleton-count" />
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    </main>
  );
}
