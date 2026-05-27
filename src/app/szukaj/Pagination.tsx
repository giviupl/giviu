import Link from 'next/link';
import styles from './SearchPage.module.css';

interface Props {
  currentPage: number;
  totalPages: number;
  buildUrl: (page: number) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  buildUrl,
}: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis-l' | 'ellipsis-r')[] = [];
  const window = 1;

  pages.push(1);

  const windowStart = Math.max(2, currentPage - window);
  const windowEnd = Math.min(totalPages - 1, currentPage + window);

  if (windowStart > 2) pages.push('ellipsis-l');
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < totalPages - 1) pages.push('ellipsis-r');

  if (totalPages > 1) pages.push(totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginacja wyników">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className={styles.paginationBtn}
          aria-label="Poprzednia strona"
          rel="prev"
        >
          <span aria-hidden="true">←</span>
          <span className={styles.paginationLabel}>Poprzednia</span>
        </Link>
      )}

      {pages.map((p, idx) =>
        typeof p === 'string' ? (
          <span key={p + idx} className={styles.paginationEllipsis}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildUrl(p)}
            className={`${styles.paginationBtn} ${
              p === currentPage ? styles.paginationBtnActive : ''
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Strona ${p}`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className={styles.paginationBtn}
          aria-label="Następna strona"
          rel="next"
        >
          <span className={styles.paginationLabel}>Następna</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </nav>
  );
}
