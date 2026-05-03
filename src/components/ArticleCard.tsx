import Link from 'next/link';
import type { Article } from '@/types';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/inspiracje/${article.slug}`}
      className="article-card"
    >
      {/* Image */}
      <div className="article-card-image">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="article-card-content">
        <span className="article-card-category">{article.category}</span>
        <h3 className="article-card-title">{article.title}</h3>
        <p className="article-card-excerpt">{article.excerpt}</p>
      </div>
    </Link>
  );
}
