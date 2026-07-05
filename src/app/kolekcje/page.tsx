import CategoryBanner from '@/components/CategoryBanner';
import styles from '@/styles/CategoryPages.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kolekcje — Zestawy Prezentów Firmowych Premium',
  description: 'Gotowe kolekcje prezentów firmowych. Welcome packi, zestawy świąteczne, upominki eventowe. Sprawdzone kompozycje od Giviu.',
  alternates: { canonical: '/kolekcje' },
  openGraph: { title: 'Kolekcje — Zestawy Prezentów Firmowych Premium', description: 'Gotowe kolekcje prezentów firmowych. Welcome packi, zestawy świąteczne, upominki eventowe. Sprawdzone kompozycje od Giviu.', url: '/kolekcje', images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: 'Kolekcje prezentów firmowych' }] },
};

const COLLECTION_BANNERS = [
  { title: 'Odzież', description: '...', slug: 'odziez', imageUrl: '/images/kolekcje/odziez.webp' },
  { title: 'Kubki i Butelki', description: '...', slug: 'kubki-i-butelki', imageUrl: '/images/kolekcje/kubki-i-butelki.webp' },
  { title: 'Elektronika', description: '...', slug: 'elektronika', imageUrl: '/images/kolekcje/elektronika.webp' },
  { title: 'Biuro i Notatniki', description: 'Notesy, długopisy i akcesoria biurowe', slug: 'biuro-i-notatniki' },
  { title: 'Plecaki i Torby', description: 'Plecaki, torby i akcesoria podróżne', slug: 'plecaki-i-torby' },
  { title: 'Dom i Wypoczynek', description: 'Świece, dyfuzory i produkty wellness', slug: 'dom-i-wypoczynek' },
  { title: 'Parasole', description: 'Parasole premium do personalizacji', slug: 'parasole' },
];

export default function KolekcjePage() {
  return (
    <section className={styles['collections-page']}>
      <div className={styles['collections-container']}>
        <div className={styles['collections-header']}>
          <h1 className={styles['collections-title']}>
            <span className={styles['collections-title-dark']}>Nie mamy wszystkiego.</span><br />
            <span className={styles['collections-title-primary']}>Mamy tylko to, co najlepsze.</span>
          </h1>
          <p className={styles['collections-subtitle']}>Każdy produkt w naszej ofercie przeszedł rygorystyczną selekcję. Wybieramy tylko marki, które podzielają naszą pasję do jakości, zrównoważonego rozwoju i ponadczasowego designu.</p>
        </div>
        <div className={styles['collections-grid']}>
          {COLLECTION_BANNERS.map((banner) => (
            <CategoryBanner key={banner.slug} title={banner.title} description={banner.description} slug={banner.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}

