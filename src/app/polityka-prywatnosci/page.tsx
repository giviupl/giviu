import Link from 'next/link';
import SectionLine from '@/components/SectionLine';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka Prywatności',
  description: 'Polityka prywatności serwisu Giviu.pl. Szczegółowe informacje o przetwarzaniu danych osobowych, Twoich prawach i zabezpieczeniach zgodnie z RODO.',
  alternates: { canonical: '/polityka-prywatnosci' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Polityka Prywatności',
    description: 'Polityka prywatności serwisu Giviu.pl. Szczegółowe informacje o przetwarzaniu danych osobowych, Twoich prawach i zabezpieczeniach zgodnie z RODO.',
    url: '/polityka-prywatnosci',
  },
};

export default function PolitykaPrywatnosciPage() {
    return (
        <main className="legal-page">
            <div className="legal-container">

                {/* Breadcrumb */}
                <nav className="breadcrumb breadcrumb--no-padding" aria-label="Ścieżka nawigacyjna">
                    <Link href="/">Strona główna</Link>
                    <span>/</span>
                    <span>Polityka prywatności</span>
                </nav>

                {/* Header */}
                <header className="legal-header">
                    <div className="legal-title-wrapper">
                        <SectionLine spacing="sm" />
                        <h1 className="legal-title">Polityka Prywatności</h1>
                    </div>
                    <p className="legal-date">Ostatnia aktualizacja: 10 lutego 2025</p>
                </header>

                {/* Content */}
                <div className="legal-content">

                    <section className="legal-section">
                        <h2>1. Administrator danych osobowych</h2>
                        <p>
                            Administratorem Twoich danych osobowych jest [Nazwa firmy] z siedzibą w [Adres],
                            wpisana do rejestru przedsiębiorców pod numerem NIP: [NIP], REGON: [REGON].
                        </p>
                        <p>
                            W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami
                            pod adresem e-mail: [email] lub telefonicznie: [telefon].
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Jakie dane zbieramy</h2>
                        <p>
                            W ramach korzystania z naszej strony internetowej możemy zbierać następujące dane:
                        </p>
                        <ul>
                            <li>Imię i nazwisko</li>
                            <li>Adres e-mail</li>
                            <li>Numer telefonu</li>
                            <li>Nazwa firmy</li>
                            <li>Adres do dostawy</li>
                            <li>NIP firmy</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. Cele przetwarzania danych</h2>
                        <p>
                            Twoje dane osobowe przetwarzamy w następujących celach:
                        </p>
                        <ul>
                            <li>Realizacja zapytań ofertowych i zamówień</li>
                            <li>Kontakt w sprawie współpracy</li>
                            <li>Wysyłka informacji handlowych (za Twoją zgodą)</li>
                            <li>Wypełnienie obowiązków prawnych (faktury, księgowość)</li>
                            <li>Analiza statystyczna i ulepszanie naszych usług</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>4. Podstawy prawne przetwarzania</h2>
                        <p>
                            Przetwarzamy Twoje dane na podstawie:
                        </p>
                        <ul>
                            <li>Art. 6 ust. 1 lit. a RODO – Twoja zgoda</li>
                            <li>Art. 6 ust. 1 lit. b RODO – wykonanie umowy</li>
                            <li>Art. 6 ust. 1 lit. c RODO – obowiązek prawny</li>
                            <li>Art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes administratora</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>5. Okres przechowywania danych</h2>
                        <p>
                            Twoje dane przechowujemy przez okres niezbędny do realizacji celów, dla których
                            zostały zebrane, a następnie przez okres wymagany przepisami prawa (np. dla celów
                            podatkowych – 5 lat od końca roku kalendarzowego).
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>6. Twoje prawa</h2>
                        <p>
                            W związku z przetwarzaniem Twoich danych osobowych przysługują Ci następujące prawa:
                        </p>
                        <ul>
                            <li>Prawo dostępu do danych</li>
                            <li>Prawo do sprostowania danych</li>
                            <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
                            <li>Prawo do ograniczenia przetwarzania</li>
                            <li>Prawo do przenoszenia danych</li>
                            <li>Prawo do sprzeciwu</li>
                            <li>Prawo do cofnięcia zgody w dowolnym momencie</li>
                        </ul>
                        <p>
                            Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem: [email].
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Pliki cookies</h2>
                        <p>
                            Nasza strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania,
                            analizy ruchu oraz personalizacji treści. Szczegółowe informacje znajdziesz w naszej
                            <Link href="/cookies"> Polityce Cookies</Link>.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Zmiany w polityce prywatności</h2>
                        <p>
                            Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.
                            O wszelkich zmianach będziemy informować poprzez aktualizację daty na górze strony.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. Kontakt</h2>
                        <p>
                            W przypadku pytań dotyczących niniejszej Polityki Prywatności lub przetwarzania
                            Twoich danych osobowych, skontaktuj się z nami:
                        </p>
                        <p>
                            <strong>[Nazwa firmy]</strong><br />
                            [Adres]<br />
                            E-mail: [email]<br />
                            Telefon: [telefon]
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}