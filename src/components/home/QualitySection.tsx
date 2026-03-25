import Link from 'next/link';
import SectionLine from '@/components/SectionLine';

const QUALITY_TILES = [
  {
    title: 'Filozofia Jakości',
    description: 'Dlaczego odrzucamy 90% produktów i wybieramy tylko te, które budują prestiż.',
    linkText: 'Poznaj nasze DNA →',
    href: '/o-nas',
  },
  {
    title: 'Proces i Logistyka',
    description: 'Od wizualizacji z Twoim logo w 24h, po dostawę biurkową do pracowników.',
    linkText: 'Zobacz jak działamy →',
    href: '/jak-dzialamy',
  },
  {
    title: 'Zrównoważony Rozwój',
    description: 'Certyfikaty, materiały z recyklingu i produkty, które nie lądują w koszu.',
    linkText: 'Sprawdź standardy →',
    href: '/ekologia',
  },
];

export default function QualitySection() {
  return (
    <section className="quality-section">
      <div className="quality-container">
        
        {/* Header */}
        <div className="quality-header">
          <div className="quality-title-wrapper">
            <SectionLine spacing="md" />
            <h2 className="quality-title">
              Jakość. Trwałość. Odpowiedzialność.
            </h2>
          </div>
          <p className="quality-description">
            Rezygnujemy z tanich gadżetów reklamowych na rzecz produktów, które budują 
            prestiż Twojej firmy. Stawiamy na marki premium i zrównoważony sposób 
            produkcji. Poznaj standardy, które redefiniują jakość Twoich relacji biznesowych.
          </p>
        </div>

        {/* Tiles */}
        <div className="quality-tiles">
          {QUALITY_TILES.map((tile, index) => (
            <div key={index} className="quality-tile">
              <SectionLine vertical />
              <div className="quality-tile-content">
                <h3 className="quality-tile-title">{tile.title}</h3>
                <p className="quality-tile-description">{tile.description}</p>
                <Link href={tile.href} className="quality-tile-link">
                  {tile.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}