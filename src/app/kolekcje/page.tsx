import CategoryBanner from '@/components/CategoryBanner';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kolekcje — Zestawy Prezentów Firmowych Premium',
  description: 'Gotowe kolekcje prezentów firmowych. Welcome packi, zestawy świąteczne, upominki eventowe. Sprawdzone kompozycje od Giviu.',
  alternates: { canonical: '/kolekcje' },
  openGraph: {
    title: 'Kolekcje — Zestawy Prezentów Firmowych Premium',
    description: 'Gotowe kolekcje prezentów firmowych. Welcome packi, zestawy świąteczne, upominki eventowe. Sprawdzone kompozycje od Giviu.',
    url: '/kolekcje',
    images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: 'Kolekcje prezentów firmowych' }],
  },
};

const COLLECTION_BANNERS = [
  {
    title: 'Odzież',
    description: 'Odzież premium dla Twojego zespołu',
    slug: 'odziez',
  },
  {
    title: 'Kubki i Butelki',
    description: 'Bidony, butelki i termosy premium',
    slug: 'kubki-i-butelki',
  },
  {
    title: 'Elektronika',
    description: 'Powerbanki, ładowarki i gadżety tech',
    slug: 'elektronika',
  },
  {
    title: 'Biuro i Notatniki',
    description: 'Notesy, długopisy i akcesoria biurowe',
    slug: 'biuro-i-notatniki',
  },
  {
    title: 'Plecaki i Torby',
    description: 'Plecaki, torby i akcesoria podróżne',
    slug: 'plecaki-i-torby',
  },
  {
    title: 'Dom i Wypoczynek',
    description: 'Świece, dyfuzory i produkty wellness',
    slug: 'dom-i-wypoczynek',
  },
  {
    title: 'Parasole',
    description: 'Parasole premium do personalizacji',
    slug: 'parasole',
  },
];

export default function KolekcjePage() {
  return (
    <section className="collections-page">
      <div className="collections-container">
        
        {/* Header */}
        <div className="collections-header">
          <h1 className="collections-title">
            <span className="collections-title-dark">Nie mamy wszystkiego.</span>
            <br />
            <span className="collections-title-primary">Mamy tylko to, co najlepsze.</span>
          </h1>
          <p className="collections-subtitle">
            Każdy produkt w naszej ofercie przeszedł rygorystyczną selekcję. 
            Wybieramy tylko marki, które podzielają naszą pasję do jakości, 
            zrównoważonego rozwoju i ponadczasowego designu.
          </p>
        </div>

        {/* Banners Grid */}
        <div className="collections-grid">
          {COLLECTION_BANNERS.map((banner) => (
            <CategoryBanner 
              key={banner.slug}
              title={banner.title}
              description={banner.description}
              slug={banner.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}