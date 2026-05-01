import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/queries";
import FAQSection from "@/components/FAQSection";
import { FAQ_BY_CATEGORY, FAQ_DEFAULT } from "@/data/faq";
import SectionLine from "@/components/SectionLine";
import styles from "@/styles/CategoryPages.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategoria nie znaleziona" };
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
      images: [
        {
          url: "https://giviu.pl/og-default.jpg",
          width: 1200,
          height: 630,
          alt: `${category.title} — prezenty firmowe`,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const faqData =
    FAQ_BY_CATEGORY[slug as keyof typeof FAQ_BY_CATEGORY] || FAQ_DEFAULT;
  const subcategories = category.subcategories ?? [];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: "https://giviu.pl",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Kolekcje",
        item: "https://giviu.pl/kolekcje",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.title,
        item: `https://giviu.pl/kategorie/${slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.title,
    numberOfItems: subcategories.length,
    itemListElement: subcategories.map((subcat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: subcat.name,
      url: `https://giviu.pl/kategorie/${slug}/${subcat.slug}`,
    })),
  };

  return (
    <main className={styles["category-page"]}>
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
      <div className={styles["category-container"]}>
        <nav className="breadcrumb" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <Link href="/kolekcje">Kolekcje</Link>
          <span>/</span>
          <span>{category.title}</span>
        </nav>
        <header className={styles["category-header"]}>
          <div className={styles["category-title-wrapper"]}>
            <SectionLine spacing="sm" />
            <h1 className={styles["category-title"]}>{category.title}</h1>
          </div>
          <p className={styles["category-description"]}>
            {category.description}
          </p>
        </header>
        <div className={styles["subcategories-grid"]}>
          {subcategories.map((subcat) => (
            <Link
              key={subcat.slug}
              href={`/kategorie/${slug}/${subcat.slug}`}
              className={styles["subcategory-tile"]}
            >
              {subcat.image ? (
                <img
                  src={subcat.image}
                  alt={subcat.name}
                  className={styles["subcategory-img"]}
                />
              ) : (
                <span className={styles["subcategory-emoji"]}>
                  {subcat.emoji}
                </span>
              )}
              <span className={styles["subcategory-name"]}>{subcat.name}</span>
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
