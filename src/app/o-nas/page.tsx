import type { Metadata } from 'next';
import Link from 'next/link';
import ContentBlock from '@/components/ContentBlock';
import SectionLine from '@/components/SectionLine';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';
import styles from '@/styles/ContentPages.module.css';

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
    <main className={styles['o-giviu-page']}>
      <div className="o-giviu-spacer"></div>

      <ContentBlock headingAs="h1" layout="text-left" title="Nie mamy wszystkiego." titleSecondary="Mamy tylko to, co jest warte Twojej marki." paragraphs={["Nie tworzymy katalogów z tysiącami gadżetów. Wybieramy tylko te produkty, które naprawdę warto wręczyć. Światowe marki, przemyślany design i jakość, która zostaje na lata."]} />
      <ContentBlock layout="text-right" title="Selekcja bez kompromisów" paragraphs={["Nasza filozofia jest prosta: eliminujemy przeciętność. Odrzucamy przedmioty, które po chwili lądują w koszu, na rzecz tych, które stają się częścią codzienności.", "Stawiamy sprawę jasno – skoro na produkcie znajdzie się Twoje logo, musi on reprezentować najwyższy standard. Skupiamy się wyłącznie na markach funkcjonalnych, trwałych i wyróżniających się designem.", "Bo Twoja marka nie zasługuje na półśrodki."]} />
      <ContentBlock layout="text-left" title="Produkty, których się pragnie." paragraphs={["Zapomnij o gadżetach, które trafiają na dno szuflady chwilę po spotkaniu.", "Wprowadzamy do świata B2B produkty, które ludzie znają, cenią i chętnie kupują prywatnie. Nasze kryterium jest proste: czy sami chcielibyśmy to dostać? Dlatego w ofercie znajdziesz tylko przedmioty użyteczne i piękne.", "Dajemy Ci pewność, że Twój upominek zostanie zapamiętany i będzie z przyjemnością używany."]} />
      <ContentBlock layout="text-right" title="Światowi liderzy w Twoim zasięgu" paragraphs={["Nie budujemy oferty na anonimowych producentach. Sięgamy wyłącznie po ikony swoich kategorii – marki, które na swoją renomę pracowały dekadami.", "Thule, Stanley, Moleskine czy Rituals to nie tylko przedmioty. To symbole niezawodności i stylu. Współpracując z nami, wykorzystujesz ich globalną rozpoznawalność, by wzmocnić przekaz własnej firmy.", "Zobacz, czyja reputacja będzie pracować na Twój sukces:"]} />

      <section className={styles['o-giviu-facts']}>
        <div className={styles['o-giviu-facts-header']}>
          <SectionLine spacing="sm" />
          <h2 className={styles['o-giviu-facts-title']}>Decyzje oparte na faktach, nie na domysłach</h2>
          <p className={styles['o-giviu-facts-description']}>Nasze podejście to nie tylko estetyka – to czysta matematyka i odpowiedzialność. Opieramy się na globalnych standardach wyznaczanych przez ASI (Advertising Specialty Institute), PPAI (Promotional Products Association International) oraz wytycznych ONZ dotyczących zrównoważonego rozwoju.</p>
          <p className={styles['o-giviu-facts-subtitle']}>Dlaczego Giviu to najbezpieczniejszy wybór dla Twojej marki?</p>
        </div>
        <div className={styles['o-giviu-facts-grid']}>
          {[{title:'Siła Retencji (ASI)',text:'Produkty premium są używane średnio 16 miesięcy – to niemal 2x dłużej niż standardowe gadżety. Twój logotyp pracuje przez prawie półtora roku, co drastycznie obniża realny koszt dotarcia (CPI) i zwiększa skuteczność reklamy.'},{title:'Transfer Prestiżu (PPAI)',text:'Aż 72% odbiorców utożsamia jakość upominku z reputacją firmy. To kluczowy punkt styku z marką. Wręczając produkt uznanej klasy, budujesz prestiż i zaufanie, a przy tym automatycznie pozycjonujesz się w roli lidera jakości.'},{title:'Wsparcie celów ESG',text:'Wspieramy model „kupuj mniej, ale lepiej". Wybór trwałych produktów to realna realizacja celów zrównoważonego rozwoju, a nie tylko pusty slogan. Zamiast generować kolejne odpady, inwestujesz w przedmioty, które służą latami.'}].map((fact, i) => (
            <div key={i} className={styles['o-giviu-fact']}>
              <SectionLine vertical />
              <div className={styles['o-giviu-fact-content']}>
                <h3 className={styles['o-giviu-fact-title']}>{fact.title}</h3>
                <p className={styles['o-giviu-fact-text']}>{fact.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['o-giviu-cta']}>
        <div className={styles['o-giviu-cta-container']}>
          <h2 className={styles['o-giviu-cta-title']}>Przejdź od teorii do konkretów.<br />Znajdź towarzystwo godne Twojego logo.</h2>
          <p className={styles['o-giviu-cta-description']}>Zobacz pełne portfolio światowych brandów, które są gotowe pracować na Twój sukces.</p>
          <Link href="/marki" className={styles['o-giviu-cta-button']}>ODKRYJ NASZE MARKI</Link>
        </div>
      </section>

      <div className="inspiration-wrapper">
        <InspirationCarouselSimple />
      </div>
    </main>
  );
}
