import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getProductsByBrand } from '@/lib/queries';
import BrandClient from './BrandClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: 'Marka nie znaleziona' };
  }

  const title = `${brand.name} — Prezenty Firmowe Premium z Personalizacją`;
  const description = brand.description
    ? brand.description.slice(0, 155)
    : `Produkty ${brand.name} z personalizacją dla firm. Prezenty firmowe premium od Giviu.`;

  return {
    title,
    description,
    alternates: { canonical: `/marki/${slug}` },
    openGraph: {
      title,
      description,
      url: `/marki/${slug}`,
      images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: `${brand.name} — prezenty firmowe` }],
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) notFound();

  // Pobierz produkty marki na serwerze
  const products = await getProductsByBrand(brand.name);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://giviu.pl' },
      { '@type': 'ListItem', position: 2, name: 'Marki', item: 'https://giviu.pl/marki' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://giviu.pl/marki/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BrandClient brand={brand} products={products} />
    </>
  );
}
