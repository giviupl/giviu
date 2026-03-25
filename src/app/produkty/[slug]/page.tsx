import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import ProductClient from './ProductClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Produkt nie znaleziony' };
  }

  const title = `${product.name} ${product.brand_name} — Prezent Firmowy z Personalizacją`;
  const description = `${product.name} od ${product.brand_name}. ${product.description?.slice(0, 120) || 'Prezent firmowy premium z personalizacją.'} Zamów bezpłatną wycenę w Giviu.`;
  const ogImage = product.image_url || 'https://giviu.pl/og-default.jpg';

  return {
    title,
    description,
    alternates: { canonical: `/produkty/${slug}` },
    openGraph: {
      title,
      description,
      url: `/produkty/${slug}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${product.name} ${product.brand_name}` }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  // Pobierz powiązane produkty na serwerze — nie w kliencie
  const relatedProducts = await getRelatedProducts(product.id, product.category_slug, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.code || product.sku,
    image: product.image_url || 'https://giviu.pl/og-default.jpg',
    brand: {
      '@type': 'Brand',
      name: product.brand_name,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PLN',
      lowPrice: product.price?.replace(/[^0-9.,]/g, '') || '0',
      availability: 'https://schema.org/InStock',
      offerCount: 1,
      seller: {
        '@type': 'Organization',
        name: 'Giviu',
      },
    },
    category: product.category,
    ...(product.material && { material: product.material }),
    ...(product.weight && { weight: product.weight }),
    // Dynamiczne daty z bazy
    ...(product.created_at && { datePublished: product.created_at }),
    ...(product.updated_at && { dateModified: product.updated_at }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://giviu.pl' },
      { '@type': 'ListItem', position: 2, name: product.category, item: `https://giviu.pl/kategorie/${product.category_slug}` },
      { '@type': 'ListItem', position: 3, name: product.subcategory, item: `https://giviu.pl/kategorie/${product.category_slug}/${product.subcategory_slug}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `https://giviu.pl/produkty/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
