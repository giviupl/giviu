import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/queries';
import FAQSection from '@/components/FAQSection';
import { FAQ_BY_CATEGORY, FAQ_DEFAULT } from '@/data/faq';
import SectionLine from '@/components/SectionLine';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: 'Kategoria nie znaleziona' };
  }

  const title = `${category.title} — Prezenty Firmowe Premium`;
  const description = `${category.description} Szeroki wybór z personalizacją dla firm. Sprawdź podkategorie i zamów bezpłatną wycenę.`;

  return {
    title,
    description,
    alternates: { canonical: `/kategorie/${slug}` },
    openGraph: {
      title,
      description,
      url: `/kategorie/${slug}`,
      images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: `${category.title} — prezenty firmowe` }],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  // FAQ nadal z pliku statycznego — nie ma sensu trzymać w bazie
  const faqData = FAQ_BY_CATEGORY[slug as keyof typeof FAQ_BY_CATEGORY] || FAQ_DEFAULT;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://giviu.pl' },
      { '@type': 'ListItem', position: 2, name: 'Kolekcje', item: 'https://giviu.pl/kolekcje' },
      { '@type': 'ListItem', position: 3, name: category.title, item: `https://giviu.pl/kategorie/${slug}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  const subcategories = category.subcategories ?? [];

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category.title,
    numberOfItems: subcategories.length,
    itemListElement: subcategories.map((subcat, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: subcat.name,
      url: `https://giviu.pl/kategorie/${slug}/${subcat.slug}`,
    })),
  };

  return (
    <main className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="category-spacer"></div>
      <div className="category-container">
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/kolekcje">Kolekcje</Link>
          <span>/</span>
          <span>{category.title}</span>
        </nav>

        <header className="category-header">
          <div className="category-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="category-title">{category.title}</h1>
          </div>
          <p className="category-description">{category.description}</p>
        </header>

        <div className="subcategories-grid">
          {subcategories.map((subcat) => (
            <Link
              key={subcat.slug}
              href={`/kategorie/${slug}/${subcat.slug}`}
              className="subcategory-tile"
            >
              <span className="subcategory-emoji">{subcat.emoji}</span>
              <span className="subcategory-name">{subcat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="category-faq">
        <FAQSection
          title={faqData.title}
          description={faqData.description}
          items={faqData.items}
        />
      </div>
    </main>
  );
}
