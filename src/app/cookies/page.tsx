import Link from 'next/link';
import SectionLine from '@/components/SectionLine';
import styles from '@/styles/ContentPages.module.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Cookies',
  description: 'Informacje o plikach cookies używanych na stronie Giviu.pl. Rodzaje plików cookies, cele ich stosowania oraz sposoby zarządzania ustawieniami.',
  alternates: { canonical: '/cookies' },
  robots: { index: false, follow: false },
  openGraph: { title: 'Polityka Cookies', description: 'Informacje o plikach cookies używanych na stronie Giviu.pl.', url: '/cookies' },
};

export default function CookiesPage() {
  return (
    <main className={styles['legal-page']}>
      <div className={styles['legal-container']}>
        <nav className="breadcrumb breadcrumb--no-padding" aria-label="Ścieżka nawigacyjna">
          <Link href="/">Strona główna</Link>
          <span>/</span>
          <span>Polityka Cookies</span>
        </nav>
        <header className={styles['legal-header']}>
          <div className={styles['legal-title-wrapper']}>
            <SectionLine spacing="sm" />
            <h1 className={styles['legal-title']}>Polityka Cookies</h1>
          </div>
          <p className={styles['legal-date']}>Ostatnia aktualizacja: 10 lutego 2025</p>
        </header>
        <div className={styles['legal-content']}>
          <section className={styles['legal-section']}><h2>1. Czym są pliki cookies?</h2><p>Pliki cookies (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu (komputerze, tablecie, smartfonie) podczas przeglądania stron internetowych.</p><p>Cookies pozwalają stronie „zapamiętać" Twoje preferencje i działania przez określony czas, dzięki czemu nie musisz ich ponownie wprowadzać przy każdej wizycie.</p></section>
          <section className={styles['legal-section']}><h2>2. Jakich cookies używamy?</h2><p>Na naszej stronie wykorzystujemy następujące rodzaje plików cookies:</p><h3>Cookies niezbędne</h3><p>Są konieczne do prawidłowego funkcjonowania strony. Bez nich nie możesz korzystać z podstawowych funkcji, takich jak nawigacja czy dostęp do zabezpieczonych obszarów.</p><h3>Cookies funkcjonalne</h3><p>Pozwalają zapamiętać Twoje wybory i preferencje (np. język, region), aby zapewnić bardziej spersonalizowane doświadczenie.</p><h3>Cookies analityczne</h3><p>Pomagają nam zrozumieć, w jaki sposób odwiedzający korzystają z naszej strony. Zbierają anonimowe informacje o liczbie odwiedzin, czasie spędzonym na stronie i źródłach ruchu.</p></section>
          <section className={styles['legal-section']}><h2>3. Szczegółowa lista cookies</h2><p>Poniżej znajdziesz listę plików cookies używanych na naszej stronie:</p><ul><li><strong>giviu-quote</strong> — przechowuje produkty dodane do wyceny (funkcjonalne, 30 dni)</li><li><strong>giviu-recently-viewed</strong> — przechowuje ostatnio oglądane produkty (funkcjonalne, 30 dni)</li><li><strong>_ga, _gid</strong> — Google Analytics, analiza ruchu (analityczne, 2 lata / 24h)</li></ul></section>
          <section className={styles['legal-section']}><h2>4. Jak zarządzać cookies?</h2><p>Możesz kontrolować i zarządzać plikami cookies na kilka sposobów:</p><h3>Ustawienia przeglądarki</h3><p>Większość przeglądarek pozwala na blokowanie lub usuwanie cookies. Poniżej znajdziesz linki do instrukcji dla popularnych przeglądarek:</p><ul><li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li><li><a href="https://support.mozilla.org/pl/kb/ciasteczka" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li><li><a href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li><li><a href="https://support.microsoft.com/pl-pl/microsoft-edge/usuwanie-plik%C3%B3w-cookie-w-przegl%C4%85darce-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li></ul><p>Pamiętaj, że wyłączenie cookies może wpłynąć na funkcjonowanie niektórych elementów strony.</p></section>
          <section className={styles['legal-section']}><h2>5. Cookies podmiotów trzecich</h2><p>Na naszej stronie mogą być używane cookies podmiotów trzecich, w szczególności:</p><ul><li><strong>Google Analytics</strong> — do analizy ruchu na stronie</li><li><strong>Google Fonts</strong> — do wyświetlania czcionek</li></ul><p>Podmioty te mają własne polityki prywatności i cookies, z którymi zalecamy się zapoznać.</p></section>
          <section className={styles['legal-section']}><h2>6. Zmiany w polityce cookies</h2><p>Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Cookies. O wszelkich zmianach będziemy informować poprzez aktualizację daty na górze strony.</p></section>
          <section className={styles['legal-section']}><h2>7. Kontakt</h2><p>Jeśli masz pytania dotyczące naszej Polityki Cookies, skontaktuj się z nami:</p><p><strong>[Nazwa firmy]</strong><br />[Adres]<br />E-mail: [email]<br />Telefon: [telefon]</p></section>
        </div>
      </div>
    </main>
  );
}

