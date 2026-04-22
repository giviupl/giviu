import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import styles from '@/styles/ContentPages.module.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin',
  description: 'Regulamin korzystania z serwisu Giviu.pl. Warunki składania zapytań ofertowych, zasady współpracy B2B oraz prawa i obowiązki użytkowników.',
  alternates: { canonical: '/regulamin' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Regulamin',
    description: 'Regulamin korzystania z serwisu Giviu.pl. Warunki składania zapytań ofertowych, zasady współpracy B2B oraz prawa i obowiązki użytkowników.',
    url: '/regulamin',
  },
};

export default function RegulaminPage() {
  return (
    <main className={styles['legal-page']}>
      <div className={styles['legal-container']}>

        <nav className="breadcrumb breadcrumb--no-padding" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span>Regulamin</span>
        </nav>

        <header className={styles['legal-header']}>
          <div className={styles['legal-title-wrapper']}>
            <SectionLine spacing="sm" />
            <h1 className={styles['legal-title']}>Regulamin</h1>
          </div>
          <p className={styles['legal-date']}>Ostatnia aktualizacja: 10 lutego 2025</p>
        </header>

        <div className={styles['legal-content']}>

          <section className={styles['legal-section']}>
            <h2>1. Postanowienia ogólne</h2>
            <p>Niniejszy Regulamin określa zasady korzystania ze strony internetowej [adres strony], prowadzonej przez [Nazwa firmy] z siedzibą w [Adres], NIP: [NIP], REGON: [REGON].</p>
            <p>Korzystanie ze strony oznacza akceptację niniejszego Regulaminu.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>2. Definicje</h2>
            <ul>
              <li><strong>Usługodawca</strong> – [Nazwa firmy] z siedzibą w [Adres]</li>
              <li><strong>Użytkownik</strong> – osoba korzystająca ze strony internetowej</li>
              <li><strong>Strona</strong> – serwis internetowy dostępny pod adresem [adres]</li>
              <li><strong>Zapytanie ofertowe</strong> – formularz umożliwiający przesłanie zapytania o wycenę produktów</li>
            </ul>
          </section>

          <section className={styles['legal-section']}>
            <h2>3. Rodzaj i zakres usług</h2>
            <p>Za pośrednictwem Strony Usługodawca świadczy następujące usługi:</p>
            <ul>
              <li>Prezentacja oferty produktów promocyjnych i upominków firmowych</li>
              <li>Możliwość składania zapytań ofertowych</li>
              <li>Kontakt z działem obsługi klienta</li>
              <li>Newsletter z informacjami o nowościach i promocjach</li>
            </ul>
            <p>Strona nie jest sklepem internetowym. Prezentowane ceny mają charakter orientacyjny i nie stanowią oferty handlowej w rozumieniu Kodeksu Cywilnego.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>4. Zapytania ofertowe</h2>
            <p>Użytkownik może złożyć zapytanie ofertowe poprzez formularz dostępny na Stronie. Złożenie zapytania nie jest równoznaczne z zawarciem umowy.</p>
            <p>Po otrzymaniu zapytania, Usługodawca przygotuje indywidualną ofertę i skontaktuje się z Użytkownikiem w ciągu 24 godzin roboczych.</p>
            <p>Warunki realizacji zamówienia, w tym ceny, terminy i warunki dostawy, są ustalane indywidualnie dla każdego zamówienia.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>5. Obowiązki Użytkownika</h2>
            <p>Użytkownik zobowiązuje się do:</p>
            <ul>
              <li>Korzystania ze Strony zgodnie z jej przeznaczeniem</li>
              <li>Podawania prawdziwych danych w formularzach</li>
              <li>Niepodejmowania działań mogących zakłócić funkcjonowanie Strony</li>
              <li>Przestrzegania przepisów prawa i dobrych obyczajów</li>
            </ul>
          </section>

          <section className={styles['legal-section']}>
            <h2>6. Własność intelektualna</h2>
            <p>Wszelkie treści zamieszczone na Stronie, w tym teksty, grafiki, logotypy, zdjęcia i elementy interaktywne, są własnością Usługodawcy lub podmiotów, z którymi Usługodawca współpracuje, i są chronione prawem autorskim.</p>
            <p>Kopiowanie, rozpowszechnianie lub wykorzystywanie materiałów ze Strony bez zgody Usługodawcy jest zabronione.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>7. Odpowiedzialność</h2>
            <p>Usługodawca dokłada wszelkich starań, aby informacje zamieszczone na Stronie były aktualne i zgodne ze stanem faktycznym. Nie ponosi jednak odpowiedzialności za ewentualne błędy lub nieścisłości.</p>
            <p>Usługodawca nie ponosi odpowiedzialności za przerwy w dostępie do Strony wynikające z przyczyn technicznych lub okoliczności niezależnych od Usługodawcy.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>8. Ochrona danych osobowych</h2>
            <p>Zasady przetwarzania danych osobowych Użytkowników określa <Link href="/polityka-prywatnosci">Polityka Prywatności</Link>.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>9. Zmiany Regulaminu</h2>
            <p>Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. Zmiany wchodzą w życie z chwilą ich publikacji na Stronie.</p>
            <p>Korzystanie ze Strony po wprowadzeniu zmian oznacza akceptację nowego Regulaminu.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>10. Postanowienia końcowe</h2>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.</p>
            <p>Wszelkie spory wynikające z korzystania ze Strony będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy.</p>
          </section>

          <section className={styles['legal-section']}>
            <h2>11. Kontakt</h2>
            <p>W przypadku pytań dotyczących Regulaminu, prosimy o kontakt:</p>
            <p><strong>[Nazwa firmy]</strong><br />[Adres]<br />E-mail: [email]<br />Telefon: [telefon]</p>
          </section>

        </div>
      </div>
    </main>
  );
}

