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

export default function BrandsCarousel() {
  const renderBrandsTrack = () => (
    <>
      {BRANDS.map((brand, index) => (
        <Link
          key={`a-${brand.slug}-${index}`}
          href={`/marki/${brand.slug}`}
          className="brands-item"
          title={brand.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/brands/${brand.slug}.svg`}
            alt={brand.name}
            className="brands-logo"
          />
        </Link>
      ))}
      {BRANDS.map((brand, index) => (
        <Link
          key={`b-${brand.slug}-${index}`}
          href={`/marki/${brand.slug}`}
          className="brands-item"
          title={brand.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/brands/${brand.slug}.svg`}
            alt={brand.name}
            className="brands-logo"
          />
        </Link>
      ))}
    </>
  );

  return (
    <section className="brands-section">
      <div className="brands-wrapper">
        <div className="brands-fade brands-fade-left"></div>
        
        <div className="brands-carousel">
          <div className="brands-half">
            {renderBrandsTrack()}
          </div>
          
          <div className="brands-half">
            {renderBrandsTrack()}
          </div>
        </div>

        <div className="brands-fade brands-fade-right"></div>
      </div>
    </section>
  );
}
