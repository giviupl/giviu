import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getRecommendedProducts } from '@/lib/queries';
import ArticleClient from './ArticleClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Artykuł nie znaleziony' };
  }

  const title = article.title;
  const description = article.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/inspiracje/${slug}` },
    openGraph: {
      title,
      description,
      url: `/inspiracje/${slug}`,
      type: 'article',
      images: [{ url: article.image_url || 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Pobierz rekomendowane produkty na serwerze
  const recommendedProducts = await getRecommendedProducts(4);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://giviu.pl' },
      { '@type': 'ListItem', position: 2, name: 'Inspiracje', item: 'https://giviu.pl/inspiracje' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://giviu.pl/inspiracje/${slug}` },
    ],
  };

  // Dynamiczne daty z bazy (zamiast hardcoded)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.image_url || 'https://giviu.pl/og-default.jpg',
    datePublished: article.created_at || '2026-01-15',
    dateModified: article.updated_at || article.created_at || '2026-03-01',
    author: { '@type': 'Organization', name: 'Giviu' },
    publisher: { '@type': 'Organization', name: 'Giviu' },
    mainEntityOfPage: `https://giviu.pl/inspiracje/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleClient article={article} recommendedProducts={recommendedProducts} />
    </>
  );
}
