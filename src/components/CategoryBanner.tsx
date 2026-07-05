import Link from 'next/link';

interface CategoryBannerProps {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
}

export default function CategoryBanner({ title, description, slug, imageUrl }: CategoryBannerProps) {
  return (
    <Link href={`/kategorie/${slug}`} className="category-banner">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="category-banner-img"
        />
      ) : (
        <div className="category-banner-bg" />
      )}
      <div className="category-banner-content">
        <span className="category-banner-label">Kolekcja</span>
        <h2 className="category-banner-title">{title}</h2>
        <p className="category-banner-desc">{description}</p>
        <span className="category-banner-link">
          Odkryj kolekcję
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </Link>
  );
}
