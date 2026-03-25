import type { Metadata } from 'next';
import Link from 'next/link';
import ContentBlock from '@/components/ContentBlock';
import SectionLine from '@/components/SectionLine';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';

export const metadata: Metadata = {
  title: 'O Giviu — Prezenty Firmowe z Pasją do Jakości',
  description: 'Poznaj Giviu — ekspercki dobór prezentów firmowych premium. Ponad 15 lat doświadczenia w branży B2B. Stanley, Moleskine, The North Face z personalizacją.',
  alternates: { canonical: '/o-nas' },
  openGraph: {
    title: 'O Giviu — Prezenty Firmowe z Pasją do Jakości',
    description: 'Poznaj Giviu — ekspercki dobór prezentów firmowych premium. Ponad 15 lat doświadczenia w branży B2B.',
    url: '/o-nas',
  },
};

export default function OGiviuPage() {
  return (
    <main className="o-giviu-page">

      {/* Spacer */}
      <div className="o-giviu-spacer"></div>



      {/* Hero Section */}
      <ContentBlock headingAs="h1"
        layout="text-left"
        title="Nie mamy wszystkiego."
        titleSecondary="Mamy tylko to, co jest warte Twojej marki."
        paragraphs={[]}
      />

      {/* Section 2 */}
      <ContentBlock
        layout="text-right"
        title="Selekcja bez kompromisów"
        paragraphs={[
          "Nasza filozofia jest prosta: eliminujemy przeciętność. Odrzucamy przedmioty, które po chwili lądują w koszu, na rzecz tych, które stają się częścią codzienności.",
          "Stawiamy sprawę jasno – skoro na produkcie znajdzie się Twoje logo, musi on reprezentować najwyższy standard. Skupiamy się wyłącznie na markach funkcjonalnych, trwałych i wyróżniających się designem.",
          "Bo Twoja marka nie zasługuje na półśrodki."
        ]}
      />

      {/* Section 3 */}
      <ContentBlock
        layout="text-left"
        title="Produkty, których się pragnie."
        paragraphs={[
          "Zapomnij o gadżetach, które trafiają na dno szuflady chwilę po spotkaniu.",
          "Wprowadzamy do świata B2B produkty, które ludzie znają, cenią i chętnie kupują prywatnie. Nasze kryterium jest proste: czy sami chcielibyśmy to dostać? Dlatego w ofercie znajdziesz tylko przedmioty użyteczne i piękne.",
          "Dajemy Ci pewność, że Twój upominek zostanie zapamiętany i będzie z przyjemnością używany."
        ]}
      />

      {/* Section 4 */}
      <ContentBlock
        layout="text-right"
        title="Światowi liderzy w Twoim zasięgu"
        paragraphs={[
          "Nie budujemy oferty na anonimowych producentach. Sięgamy wyłącznie po ikony swoich kategorii – marki, które na swoją renomę pracowały dekadami.",
          "Thule, Stanley, Moleskine czy Rituals to nie tylko przedmioty. To symbole niezawodności i stylu. Współpracując z nami, wykorzystujesz ich globalną rozpoznawalność, by wzmocnić przekaz własnej firmy.",
          "Zobacz, czyja reputacja będzie pracować na Twój sukces:"
        ]}
      />

      {/* Section 5 - Centered */}
      <section className="o-giviu-facts">
        <div className="o-giviu-facts-header">
          <SectionLine spacing="sm" />
          <h2 className="o-giviu-facts-title">
            Decyzje oparte na faktach, nie na domysłach
          </h2>
          <p className="o-giviu-facts-description">
            Nasze podejście to nie tylko estetyka – to czysta matematyka i odpowiedzialność.
            Opieramy się na globalnych standardach wyznaczanych przez ASI (Advertising Specialty Institute),
            PPAI (Promotional Products Association International) oraz wytycznych ONZ dotyczących zrównoważonego rozwoju.
          </p>
          <p className="o-giviu-facts-subtitle">
            Dlaczego Giviu to najbezpieczniejszy wybór dla Twojej marki?
          </p>
        </div>

        <div className="o-giviu-facts-grid">
          <div className="o-giviu-fact">
            <SectionLine vertical />
            <div className="o-giviu-fact-content">
              <h3 className="o-giviu-fact-title">Siła Retencji (ASI)</h3>
              <p className="o-giviu-fact-text">
                Produkty premium są używane średnio 16 miesięcy – to niemal 2x dłużej niż standardowe gadżety.
                Twój logotyp pracuje przez prawie półtora roku, co drastycznie obniża realny koszt dotarcia (CPI)
                i zwiększa skuteczność reklamy.
              </p>
            </div>
          </div>

          <div className="o-giviu-fact">
            <SectionLine vertical />
            <div className="o-giviu-fact-content">
              <h3 className="o-giviu-fact-title">Transfer Prestiżu (PPAI)</h3>
              <p className="o-giviu-fact-text">
                Aż 72% odbiorców utożsamia jakość upominku z reputacją firmy. To kluczowy punkt styku z marką.
                Wręczając produkt uznanej klasy, budujesz prestiż i zaufanie, a przy tym automatycznie pozycjonujesz
                się w roli lidera jakości.
              </p>
            </div>
          </div>

          <div className="o-giviu-fact">
            <SectionLine vertical />
            <div className="o-giviu-fact-content">
              <h3 className="o-giviu-fact-title">Wsparcie celów ESG</h3>
              <p className="o-giviu-fact-text">
                Wspieramy model „kupuj mniej, ale lepiej". Wybór trwałych produktów to realna realizacja celów
                zrównoważonego rozwoju, a nie tylko pusty slogan. Zamiast generować kolejne odpady, inwestujesz
                w przedmioty, które służą latami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="o-giviu-cta">
        <div className="o-giviu-cta-container">
          <h2 className="o-giviu-cta-title">
            Przejdź od teorii do konkretów.<br />
            Znajdź towarzystwo godne Twojego logo.
          </h2>
          <p className="o-giviu-cta-description">
            Zobacz pełne portfolio światowych brandów, które są gotowe pracować na Twój sukces.
          </p>
          <Link href="/marki" className="o-giviu-cta-button">
            ODKRYJ NASZE MARKI
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