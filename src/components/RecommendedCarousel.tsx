'use client';

import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

interface RecommendedCarouselProps {
  products: Product[];
}

export default function RecommendedCarousel({ products }: RecommendedCarouselProps) {
  if (products.length === 0) return null;

  return (
    <section className="product-related-standalone">
      <h2 className="product-related-title">Polecane produkty</h2>
      <ul role="list" className="product-related-grid">
        {products.slice(0, 4).map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
