import Link from 'next/link';
import ContentBlock from '@/components/ContentBlock';
import SectionLine from '@/components/SectionLine';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jak Działamy — Proces Zamówienia Prezentów Firmowych',
  description: 'Od briefu do dostawy w 4 krokach. Doradztwo, personalizacja, kontrola jakości. Zamów prezenty firmowe premium bez stresu.',
  alternates: { canonical: '/jak-dzialamy' },
  openGraph: {
    title: 'Jak Działamy — Proces Zamówienia Prezentów Firmowych',
    description: 'Od briefu do dostawy w 4 krokach. Doradztwo, personalizacja, kontrola jakości. Zamów prezenty firmowe premium bez stresu.',
    url: '/jak-dzialamy',
  },
};

const PROCESS_STEPS = [
  {
    id: 1,
    title: 'Brief i Konsultacja',
    description: 'Opowiedz nam o okazji, grupie odbiorców i budżecie. Dobierzemy produkty i metody znakowania. Wycenę otrzymasz w 24h.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Wyselekcjonowana Oferta',
    description: 'Nie przeszukujesz tysięcy produktów. Przygotujemy starannie dobraną propozycję — tylko sprawdzone marki i produkty, które przeszły naszą weryfikację jakości.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Personalizacja i Produkcja',
    description: 'Zatwierdzasz wizualizację logo na produkcie. Po akceptacji uruchamiamy znakowanie z pełną kontrolą jakości.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Dostawa i Wręczenie',
    description: 'Dostarczymy do siedziby firmy lub wyślemy indywidualnie do każdego odbiorcy. Estetyczne pakowanie gotowe do wręczenia.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

const BRANDING_METHODS = [
  {
    title: 'Grawer Laserowy',
    description: 'Najtrwalsza i najbardziej szlachetna metoda znakowania. Wiązka lasera precyzyjnie usuwa wierzchnią warstwę materiału, odsłaniając jego strukturę.',
    application: 'Metal (kubki termiczne, długopisy), drewno, bambus',
    effect: 'Niezniszczalny, dyskretny, elegancki',
  },
  {
    title: 'Tłoczenie',
    description: 'Technika dedykowana produktom skórzanym i skóropodobnym. Matryca pod wpływem nacisku i temperatury trwale odkształca materiał, tworząc trójwymiarowy wzór.',
    application: 'Notatniki, kalendarze, galanteria skórzana',
    effect: 'Prestiżowy, wyczuwalny pod palcami, minimalistyczny',
  },
  {
    title: 'Haft Komputerowy',
    description: 'Klasyka znakowania tekstyliów. Sterowane cyfrowo igły nanoszą wzór bezpośrednio na materiał, używając nici o wysokiej wytrzymałości.',
    application: 'Polary, kurtki softshell, czapki, ręczniki, torby',
    effect: 'Trójwymiarowa faktura, najwyższa odporność na pranie',
  },
  {
    title: 'Druk DTF',
    description: 'Nowoczesna technologia cyfrowa, pozwalająca na odwzorowanie skomplikowanych grafik i przejść tonalnych. Nadruk jest najpierw nanoszony na specjalną folię, a następnie transferowany na materiał.',
    application: 'Odzież bawełniana i syntetyczna, gdzie wymagana jest wysoka szczegółowość',
    effect: 'Elastyczny, gładki w dotyku nadruk o wysokiej rozdzielczości i trwałości',
  },
  {
    title: 'Druk UV',
    description: 'Bezpośredni druk cyfrowy utwardzany światłem UV. Pozwala na uzyskanie fotograficznej jakości i pełnego nasycenia kolorów (CMYK) na twardych powierzchniach.',
    application: 'Gadżety elektroniczne, notesy, płaskie powierzchnie z tworzyw',
    effect: 'Żywe kolory, idealne odwzorowanie gradientów, natychmiastowe utrwalenie',
  },
  {
    title: 'Sitodruk',
    description: 'Tradycyjna, przemysłowa technika druku bezpośredniego. Farba jest przetłaczana przez specjalnie przygotowaną matrycę (sito). Idealna przy większych nakładach.',
    application: 'Odzież (T-shirty, torby bawełniane), papier, tworzywa',
    effect: 'Głębokie nasycenie koloru, bardzo wysoka trwałość i odporność',
  },
  {
    title: 'Termotransfer',
    description: 'Technika polegająca na wgrzaniu logotypu w materiał za pomocą prasy termicznej. Pozwala na precyzyjne odwzorowanie drobnych elementów, których nie da się wykonać haftem.',
    application: 'Odzież sportowa, plecaki, parasole, trudnodostępne miejsca',
    effect: 'Gładka powierzchnia, precyzyjne krawędzie, wysoka estetyka detalu',
  },
  {
    title: 'Tampodruk',
    description: 'Technika druku, wykorzystująca elastyczny silikonowy stempel ("tampon"). Dzięki swojej plastyczności dopasowuje się on do kształtu podłoża, umożliwiając znakowanie powierzchni zakrzywionych, wklęsłych lub wypukłych.',
    application: 'Długopisy, kubki, drobna elektronika, breloki, elementy o nieregularnych kształtach',
    effect: 'Precyzyjne odwzorowanie drobnych detali na trudnych powierzchniach, czyste krawędzie',
  },
];

const COOPERATION_TILES = [
  {
    title: 'Weryfikacja jakości',
    description: 'Żadne zdjęcie nie zastąpi fizycznego kontaktu. Udostępniamy wzory produktów, abyś mógł wziąć je do ręki, poczuć fakturę materiału i ocenić detale wykończenia. Decyzję podejmujesz w oparciu o realne odczucia i pewność, a nie tylko cyfrowy obrazek na ekranie.',
  },
  {
    title: 'Akceptacja wizualizacji',
    description: 'Eliminujemy ryzyko błędu. Przed startem produkcji otrzymujesz od nas wierną wizualizację. Widzisz dokładnie, jak logotyp prezentuje się na gotowym produkcie. To czas na Twój spokój i pewność, że finalny efekt będzie perfekcyjnym odwzorowaniem Twojej wizji.',
  },
  {
    title: 'Komfort wręczania',
    description: 'Szanujemy Twój czas, dlatego omijasz żmudny etap logistyki. Otrzymujesz estetycznie spakowane produkty, które wręczysz swoim klientom z prawdziwą przyjemnością. Na życzenie zadbamy też o detale, takie jak personalizowane bileciki czy ozdobne owijki.',
  },
];

export default function JakDzialamyPage() {
  return (
    <main className="jak-dzialamy-page">

      {/* Spacer */}
      <div className="jak-dzialamy-spacer"></div>

      {/* Hero Section */}
      <ContentBlock headingAs="h1"
        layout="text-right"
        title="Obsługa tej samej klasy co nasze produkty"
        paragraphs={[
          "Zapewniamy model współpracy, który jest równie niezawodny i dopracowany, tak jak produkty w naszej ofercie.",
          "Od selekcji, przez dyskretny branding, aż po bezpieczną dostawę – precyzyjnie, terminowo i bez zbędnych formalności.",
          "Dopinamy wszystko na ostatni guzik, abyś Ty mógł skupić się na swoich celach, mając gwarancję spokoju i terminowości."
        ]}
      />

      {/* Section 2: Proces realizacji */}
      <section className="jak-dzialamy-process">
        <div className="jak-dzialamy-process-header">
          <div className="jak-dzialamy-process-title-wrapper">
            <SectionLine spacing="sm" />
            <h2 className="jak-dzialamy-process-title">Proces realizacji</h2>
          </div>
        </div>

        <div className="jak-dzialamy-process-grid">
          {PROCESS_STEPS.map((step) => (
            <div key={step.id} className="jak-dzialamy-process-card">
              <div className="jak-dzialamy-process-card-header">
                <span className="jak-dzialamy-process-number">0{step.id}</span>
                <span className="jak-dzialamy-process-icon">{step.icon}</span>
              </div>
              <h3 className="jak-dzialamy-process-card-title">{step.title}</h3>
              <p className="jak-dzialamy-process-card-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Znakowanie */}
      <section className="jak-dzialamy-branding">
        <div className="jak-dzialamy-branding-header">
          <div className="jak-dzialamy-branding-title-wrapper">
            <SectionLine spacing="sm" />
            <h2 className="jak-dzialamy-branding-title">Znakowanie, które uszlachetnia produkt.</h2>
          </div>
          <p className="jak-dzialamy-branding-description">
            Wierzymy, że branding powinien być dyskretny i elegancki. Korzystamy z technologii, które pozwalają zachować unikalny charakter materiałów, jednocześnie trwale eksponując Twoją markę.
          </p>
        </div>

        <div className="jak-dzialamy-branding-grid">
          {BRANDING_METHODS.map((method, index) => (
            <div key={index} className="jak-dzialamy-branding-item">
              <div className="jak-dzialamy-branding-placeholder">
                <svg className="jak-dzialamy-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="jak-dzialamy-branding-content">
                <h3 className="jak-dzialamy-branding-method-title">{method.title}</h3>
                <p className="jak-dzialamy-branding-method-desc">{method.description}</p>
                <p className="jak-dzialamy-branding-method-info">
                  <strong>Zastosowanie:</strong> {method.application}
                </p>
                <p className="jak-dzialamy-branding-method-info">
                  <strong>Efekt:</strong> {method.effect}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Bezpieczeństwo i łatwość współpracy */}
      <section className="jak-dzialamy-cooperation">
        <div className="jak-dzialamy-cooperation-header">
          <div className="jak-dzialamy-cooperation-title-wrapper">
            <SectionLine spacing="sm" />
            <h2 className="jak-dzialamy-cooperation-title">Bezpieczeństwo i łatwość współpracy</h2>
          </div>
        </div>

        <div className="jak-dzialamy-cooperation-grid">
          {COOPERATION_TILES.map((tile, index) => (
            <div key={index} className="jak-dzialamy-cooperation-tile">
              <SectionLine vertical />
              <div className="jak-dzialamy-cooperation-content">
                <h3 className="jak-dzialamy-cooperation-tile-title">{tile.title}</h3>
                <p className="jak-dzialamy-cooperation-tile-desc">{tile.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="jak-dzialamy-cta">
        <div className="jak-dzialamy-cta-container">
          <h2 className="jak-dzialamy-cta-title">
            Czas wybrać produkt godny Twojej marki.
          </h2>
          <p className="jak-dzialamy-cta-description">
            Znasz nasze standardy logistyki i znakowania.<br />
            Zobacz, jak łączymy je z ofertą premium.<br />
            Zainspiruj się, skompletuj listę faworytów i wyślij jedno, zbiorcze zapytanie do wyceny.
          </p>
          <Link href="/kolekcje" className="jak-dzialamy-cta-button">
            ZOBACZ KOLEKCJE
          </Link>
        </div>
      </section>

      {/* Inspiracje */}
      <div className="inspiration-wrapper">
        <InspirationCarouselSimple />
      </div>

    </main>
  );
}
