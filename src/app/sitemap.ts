import type { MetadataRoute } from 'next';
import { getAllProducts, getAllBrands, getAllArticles, getAllCategories } from '@/lib/queries';

const SITE_URL = 'https://giviu.pl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Pobierz dane z Supabase równolegle
  const [products, brands, articles, categories] = await Promise.all([
    getAllProducts(),
    getAllBrands(),
    getAllArticles(),
    getAllCategories(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/o-nas`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/jak-dzialamy`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/ekologia`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/kontakt`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/kolekcje`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/marki`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/nowosci`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/inspiracje`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/kategorie/${cat.slug}`,
    lastModified: cat.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Subcategory pages
  const subcategoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    (cat.subcategories ?? []).map((subcat) => ({
      url: `${SITE_URL}/kategorie/${cat.slug}/${subcat.slug}`,
      lastModified: cat.updated_at || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  // Product pages — z dynamicznym lastModified!
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/produkty/${product.slug}`,
    lastModified: product.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Brand pages
  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${SITE_URL}/marki/${brand.slug}`,
    lastModified: brand.updated_at || now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Article pages
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/inspiracje/${article.slug}`,
    lastModified: article.updated_at || now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...subcategoryPages,
    ...productPages,
    ...brandPages,
    ...articlePages,
  ];
}
