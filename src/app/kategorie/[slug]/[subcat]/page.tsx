import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsBySubcategory } from '@/lib/queries';
import SubcategoryClient from './SubcategoryClient';

type Props = {
  params: Promise<{ slug: string; subcat: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, subcat } = await params;
  const category = await getCategoryBySlug(slug);
  const subcategory = category?.subcategories?.find(s => s.slug === subcat);

  if (!category || !subcategory) {
    return { title: 'Podkategoria nie znaleziona' };
  }

  const title = `${subcategory.name} — ${category.title} | Prezenty Firmowe`;
  const description = `${subcategory.name} do personalizacji z logo Twojej firmy. Szeroki wybór premium ${subcategory.name.toLowerCase()} od najlepszych marek. Bezpłatna wycena.`;

  return {
    title,
    description,
    alternates: { canonical: `/kategorie/${slug}/${subcat}` },
    openGraph: {
      title,
      description,
      url: `/kategorie/${slug}/${subcat}`,
      images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: `${subcategory.name} — prezenty firmowe` }],
    },
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subcat } = await params;
  const category = await getCategoryBySlug(slug);
  const subcategory = category?.subcategories?.find(s => s.slug === subcat);

  if (!category || !subcategory) notFound();

  // Pobierz produkty na serwerze
  const products = await getProductsBySubcategory(slug, subcat);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://giviu.pl' },
      { '@type': 'ListItem', position: 2, name: 'Kolekcje', item: 'https://giviu.pl/kolekcje' },
      { '@type': 'ListItem', position: 3, name: category.title || '', item: `https://giviu.pl/kategorie/${slug}` },
      { '@type': 'ListItem', position: 4, name: subcategory.name || '', item: `https://giviu.pl/kategorie/${slug}/${subcat}` },
    ],
  };

  return (
    <main className="subcategory-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="subcategory-spacer"></div>
      <SubcategoryClient
        category={category}
        subcategory={subcategory}
        products={products}
        categorySlug={slug}
      />
    </main>
  );
}
