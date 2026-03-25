import Link from 'next/link';

const BRANDS = [
  { name: 'Stanley', slug: 'stanley' },
  { name: 'Moleskine', slug: 'moleskine' },
  { name: 'The North Face', slug: 'the-north-face' },
  { name: 'Rituals', slug: 'rituals' },
  { name: 'Thule', slug: 'thule' },
  { name: 'Samsonite', slug: 'samsonite' },
  { name: 'Parker', slug: 'parker' },
  { name: 'Victorinox', slug: 'victorinox' },
];

export default function BrandsCarousel() {
  // Generujemy listę marek podwójnie w jednym bloku, 
  // żeby zagwarantować, że blok będzie szerszy niż 1600px
  const renderBrandsTrack = () => (
    <>
      {BRANDS.map((brand, index) => (
        <Link
          key={`a-${brand.slug}-${index}`}
          href={`/marki/${brand.slug}`}
          className="brands-item"
        >
          {brand.name}
        </Link>
      ))}
      {BRANDS.map((brand, index) => (
        <Link
          key={`b-${brand.slug}-${index}`}
          href={`/marki/${brand.slug}`}
          className="brands-item"
        >
          {brand.name}
        </Link>
      ))}
    </>
  );

  return (
    <section className="brands-section">
      <div className="brands-wrapper">
        <div className="brands-fade brands-fade-left"></div>
        
        <div className="brands-carousel">
          {/* Połowa 1: Ma 16 elementów (2x lista), na pewno wystarczy na 1600px */}
          <div className="brands-half">
            {renderBrandsTrack()}
          </div>
          
          {/* Połowa 2: Idealny klon, ładuje się bez szwu dzięki paddingowi */}
          <div className="brands-half">
            {renderBrandsTrack()}
          </div>
        </div>

        <div className="brands-fade brands-fade-right"></div>
      </div>
    </section>
  );
}