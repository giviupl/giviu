export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton product-card-skeleton-image" />
      <div className="skeleton product-card-skeleton-badge" />
      <div className="skeleton product-card-skeleton-name" />
      <div className="skeleton product-card-skeleton-price" />
      <div className="product-card-skeleton-colors">
        <div className="skeleton product-card-skeleton-color" />
        <div className="skeleton product-card-skeleton-color" />
        <div className="skeleton product-card-skeleton-color" />
      </div>
    </div>
  );
}

// Grid of skeleton cards for loading states
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

