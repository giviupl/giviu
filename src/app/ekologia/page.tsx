import Link from 'next/link';
import ContentBlock from '@/components/ContentBlock';
import SectionLine from '@/components/SectionLine';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';
import styles from '@/styles/ContentPages.module.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ekologia — Zrównoważone Prezenty Firmowe',
  description: 'Ekologiczne gadżety reklamowe z certyfikatami. Materiały z recyklingu, odpowiedzialna produkcja. Prezenty firmowe, które nie szkodzą planecie.',
  alternates: { canonical: '/ekologia' },
  openGraph: {
    title: 'Ekologia — Zrównoważone Prezenty Firmowe',
    description: 'Ekologiczne gadżety reklamowe z certyfikatami. Materiały z recyklingu, odpowiedzialna produkcja. Prezenty firmowe, które nie szkodzą planecie.',
    url: '/ekologia',
  },
};

const MATERIALS = [
  {
    title: 'Stal 18/8 i aluminium z recyklingu',
    description: 'Wybieramy surowce, które mogą krążyć w obiegu zamkniętym w nieskończoność. Stosujemy stal nierdzewną typu 18/8 oraz recyklingowane aluminium. To materiały klasy spożywczej, które nie wchodzą w reakcje z napojami, gwarantując sterylność, neutralność smaku i industrialną wytrzymałość.',
  },
  {
    title: 'Bawełna GOTS, rPET i wełna merino',
    description: 'Od certyfikowanych upraw po drugie życie plastiku. Stawiamy na włókna rPET, naturalną wełnę merino oraz bawełnę organiczną spełniającą standardy GOTS. To gwarancja, że tekstylia są wolne od pestycydów i metali ciężkich, a przy tym zachowują najwyższe parametry oddychalności.',
  },
  {
    title: 'Tritan™ Renew i innowacyjne tworzywa',
    description: 'Technologia w służbie ekologii. Wybieramy Eastman Tritan™ Renew – rewolucyjny materiał, który w 50% powstaje z recyklingu. Jest wolny od BPA/BPS, nie chłonie zapachów i nie mętnieje w zmywarce. To ta sama legendarna wytrzymałość co w oryginale, ale przy znacznie mniejszym śladzie węglowym.',
  },
];

export default function EkologiaPage() {
  return (
    <main className={styles['ekologia-page']}>

      <div className="ekologia-spacer"></div>

      <ContentBlock headingAs="h1"
        layout="text-left"
        title="Najbardziej ekologiczny produkt to ten, który służy latami."
        paragraphs={[
          "W erze nadmiaru i jednorazowości trwałość stała się najważniejszą walutą ekologiczną. Wierzymy, że odpowiedzialny upominek firmowy musi być długofalową inwestycją w relację i planetę, zamiast być tylko chwilowym, zapomnianym gadżetem.",
          "Dlatego w Giviu stawiamy znak równości między wysoką jakością, trwałością i ekologią.",
          "Ta filozofia definiuje nasz model działania. W świecie, gdzie dostęp do \"wszystkiego\" jest problemem, naszą kluczową usługą staje się rygorystyczna selekcja przedmiotów zaprojektowanych na lata."
        ]}
      />

      <ContentBlock
        layout="text-right"
        title="Odpowiedzialność mierzona w latach, nie w sztukach."
        paragraphs={[
          "Naszą selekcję opieramy na twardych danych. Weryfikujemy partnerów pod kątem międzynarodowych certyfikatów i standardów ESG (Environmental, Social, Governance). Świadomie odrzucamy masowe, nietrwałe gadżety, które obciążają zarówno środowisko, jak i wizerunek Twojej firmy.",
          "W relacjach B2B liczy się siła oddziaływania, a nie ilość. Pomagamy skoncentrować budżet na rozwiązaniach premium o długofalowej wartości.",
          "Jeden wysokiej klasy upominek buduje pozytywne skojarzenia z marką przez lata skuteczniej niż setki tanich przedmiotów."
        ]}
      />

      <section className={styles['ekologia-verify']}>
        <div className={styles['ekologia-verify-header']}>
          <div className={styles['ekologia-verify-title-wrapper']}>
            <SectionLine spacing="sm" />
            <h2 className={styles['ekologia-verify-title']}>Odpowiedzialność, którą można zweryfikować.</h2>
          </div>
          <p className={styles['ekologia-verify-description']}>
            W ekologii nie uznajemy półśrodków ani marketingu bez pokrycia. Zamiast wierzyć na słowo, wymagamy dowodów. Prześwietlamy certyfikaty i pochodzenie materiałów, by dać Ci pewność, że wybierasz produkty, które są odpowiedzialne naprawdę, a nie tylko z nazwy.
          </p>
        </div>

        <div className={styles['ekologia-certificates']}>
          <h3 className={styles['ekologia-certificates-title']}>Certyfikaty i standardy obecne w naszej ofercie</h3>
          <div className={styles['ekologia-certificates-grid']}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles['ekologia-certificate-placeholder']}>
                <svg className={styles['ekologia-placeholder-icon-sm']} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className={styles['ekologia-materials']}>
          <h3 className={styles['ekologia-materials-title']}>Świadomy dobór surowców</h3>
          <div className={styles['ekologia-materials-list']}>
            {MATERIALS.map((material, index) => (
              <div key={index} className={styles['ekologia-material-item']}>
                <div className={styles['ekologia-material-placeholder']}>
                  <svg className={styles['ekologia-placeholder-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className={styles['ekologia-material-content']}>
                  <h4 className={styles['ekologia-material-title']}>{material.title}</h4>
                  <p className={styles['ekologia-material-description']}>{material.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContentBlock
        layout="text-left"
        title="Odpowiedzialna logistyka i optymalizacja opakowań."
        paragraphs={[
          "Rozumiemy, że odpowiedzialność za produkt nie kończy się na jego wytworzeniu. Adresujemy wyzwania związane z emisjami w łańcuchu dostaw (Scope 3), stale optymalizując procesy pakowania i wysyłki.",
          "W naszych operacjach logistycznych kładziemy zdecydowany nacisk na minimalizację pierwotnych tworzyw sztucznych jednorazowego użytku. Naszym priorytetem jest stosowanie materiałów biodegradowalnych, kompostowalnych lub pochodzących z certyfikowanych źródeł (takich jak kartony z certyfikatem FSC®, papierowe wypełniacze i taśmy).",
          "Konsekwentnie wdrażamy rozwiązania, które pomagają redukować odpady po stronie odbiorcy końcowego i wspierają cele środowiskowe Twojej organizacji."
        ]}
      />

      <section className={styles['ekologia-cta']}>
        <div className={styles['ekologia-cta-container']}>
          <h2 className={styles['ekologia-cta-title']}>
            Odpowiedzialność się opłaca.<br />
            Postaw na produkty, które budują wizerunek Twojej marki.
          </h2>
          <Link href="/kolekcje" className={styles['ekologia-cta-button']}>
            ODKRYJ NASZE KOLEKCJE
          </Link>
        </div>
      </section>

      <div className="inspiration-wrapper">
        <InspirationCarouselSimple />
      </div>

    </main>
  );
}
