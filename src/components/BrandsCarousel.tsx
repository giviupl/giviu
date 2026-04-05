import '@/styles/Carousels.module.css';
import Link from 'next/link';

const BRANDS = [
  { name: 'Stanley', slug: 'stanley' },
  { name: 'Moleskine', slug: 'moleskine' },
  { name: 'Thule', slug: 'thule' },
  { name: 'Parker', slug: 'parker' },
  { name: 'Rituals', slug: 'rituals' },
  { name: 'CamelBak', slug: 'camelbak' },
  { name: 'Herschel', slug: 'herschel' },
  { name: 'LARQ', slug: 'larq' },
  { name: 'Ocean Bottle', slug: 'oceanbottle' },
  { name: 'Doppler', slug: 'doppler' },
  { name: 'Knirps', slug: 'knirps' },
  { name: 'Waterman', slug: 'waterman' },
  { name: 'Sagaform', slug: 'sagaform' },
  { name: 'Xtorm', slug: 'xtorm' },
  { name: 'SCX Design', slug: 'scx' },
  { name: 'Cutter & Buck', slug: 'cutterandbuck' },
  { name: 'Harvest & Frost', slug: 'harvestfrost' },
  { name: 'James Harvest', slug: 'jamesharvest' },
  { name: 'ID Identity', slug: 'id' },
  { name: 'Tenson', slug: 'tenson' },
];

/* JSON-LD: Organization + lista marek → Google widzi relację Giviu ↔ Brand */
const brandsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Giviu',
  url: 'https://giviu.pl',
  brand: BRANDS.map((b) => ({
    '@type': 'Brand',
    name: b.name,
    url: `https://giviu.pl/marki/${b.slug}`,
    logo: `https://giviu.pl/brands/${b.slug}.svg`,
  })),
};

export default function BrandsCarousel() {
  /* Jeden zestaw 20 linków — prefix + czy ukryty dla SEO/a11y */
  const renderBrands = (prefix: string, hidden: boolean) =>
    BRANDS.map((brand, index) => (
      <Link
        key={`${prefix}-${brand.slug}-${index}`}
        href={`/marki/${brand.slug}`}
        className="brands-item"
        title={brand.name}
        {...(hidden ? { 'aria-hidden': true as const, tabIndex: -1 } : {})}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/brands/${brand.slug}.svg`}
          alt={hidden ? '' : brand.name}
          className="brands-logo"
        />
      </Link>
    ));

  return (
    <section className="brands-section" aria-label="Marki partnerskie">
      {/* JSON-LD — widoczny tylko dla Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandsJsonLd) }}
      />

      <div className="brands-wrapper">
        <div className="brands-fade brands-fade-left" />

        <nav aria-label="Marki partnerskie">
          <div className="brands-carousel">
            {/* ── Pierwsza połowa ── */}
            <div className="brands-half">
              {/* ✅ Jedyny zestaw widoczny dla SEO — 20 unikalnych linków */}
              {renderBrands('seo', false)}
              {/* Duplikat dla płynnej pętli — ukryty */}
              {renderBrands('dup-a', true)}
            </div>

            {/* ── Druga połowa — cała ukryta ── */}
            <div className="brands-half" aria-hidden="true">
              {renderBrands('dup-b', true)}
              {renderBrands('dup-c', true)}
            </div>
          </div>
        </nav>

        <div className="brands-fade brands-fade-right" />
      </div>
    </section>
  );
}
