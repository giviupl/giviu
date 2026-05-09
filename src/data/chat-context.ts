// src/data/chat-context.ts
// ============================================================
// Baza wiedzy asystenta AI Giviu.
// Czat czyta z tego pliku przez tool get_page_content(slug).
//
// JAK EDYTOWAĆ: zmień tekst → commit → push → Vercel redeploy.
// Treści powinny odzwierciedlać aktualny stan stron Giviu.
// AI parafrazuje — nie kopiuje 1:1 do klienta.
// ============================================================

export interface ChatContextPage {
    title: string;
    summary: string;
    content: string;
  }
  
  export const CHAT_CONTEXT: Record<string, ChatContextPage> = {
  
    // ============================================================
    // EKOLOGIA
    // ============================================================
    'ekologia': {
      title: 'Ekologia i zrównoważony rozwój',
      summary: 'Filozofia trwałości Giviu, certyfikaty (B Corp, FSC, OEKO-TEX, GOTS, bluesign), materiały (stal 18/8, rPET, Tritan Renew), logistyka.',
      content: `Najbardziej ekologiczny produkt to ten, który służy latami.
  
  W erze nadmiaru i jednorazowości trwałość stała się najważniejszą walutą ekologiczną. Wierzymy, że odpowiedzialny upominek firmowy musi być długofalową inwestycją w relację i planetę, zamiast być tylko chwilowym, zapomnianym gadżetem.
  
  Dlatego w Giviu stawiamy znak równości między wysoką jakością, trwałością i ekologią. Ta filozofia definiuje nasz model działania. W świecie, gdzie dostęp do "wszystkiego" jest problemem, naszą kluczową usługą staje się rygorystyczna selekcja przedmiotów zaprojektowanych na lata.
  
  Odpowiedzialność mierzona w latach, nie w sztukach.
  
  Naszą selekcję opieramy na twardych danych. Weryfikujemy partnerów pod kątem międzynarodowych certyfikatów i standardów ESG (Environmental, Social, Governance). Świadomie odrzucamy masowe, nietrwałe gadżety, które obciążają zarówno środowisko, jak i wizerunek Twojej firmy.
  
  W relacjach B2B liczy się siła oddziaływania, a nie ilość. Pomagamy skoncentrować budżet na rozwiązaniach premium o długofalowej wartości. Jeden wysokiej klasy upominek buduje pozytywne skojarzenia z marką przez lata skuteczniej niż setki tanich przedmiotów.
  
  Certyfikaty i standardy obecne w naszej ofercie:
  - B Corp — certyfikat potwierdzający wysokie standardy społecznej i środowiskowej odpowiedzialności
  - FSC — drewno i papier z odpowiedzialnie zarządzanych lasów
  - OEKO-TEX Standard 100 — tekstylia wolne od szkodliwych substancji chemicznych
  - GOTS — organiczna bawełna w ekologicznej produkcji
  - bluesign — zrównoważona produkcja tekstyliów minimalizująca zużycie wody, energii i chemikaliów
  
  Świadomy dobór surowców:
  
  Stal 18/8 i aluminium z recyklingu — surowce krążące w obiegu zamkniętym w nieskończoność. Stal nierdzewna typu 18/8 oraz recyklingowane aluminium to materiały klasy spożywczej, które nie wchodzą w reakcje z napojami, gwarantując sterylność, neutralność smaku i industrialną wytrzymałość.
  
  Bawełna GOTS, rPET i wełna merino — od certyfikowanych upraw po drugie życie plastiku. Włókna rPET, naturalna wełna merino oraz bawełna organiczna spełniająca standardy GOTS. Gwarancja, że tekstylia są wolne od pestycydów i metali ciężkich, zachowując najwyższe parametry oddychalności.
  
  Tritan Renew i innowacyjne tworzywa — Eastman Tritan Renew to materiał w 50% z recyklingu, wolny od BPA/BPS, nie chłonie zapachów i nie mętnieje w zmywarce. Ta sama legendarna wytrzymałość co w oryginale, ale przy znacznie mniejszym śladzie węglowym.
  
  Odpowiedzialna logistyka i optymalizacja opakowań:
  
  Odpowiedzialność za produkt nie kończy się na jego wytworzeniu. Adresujemy wyzwania związane z emisjami w łańcuchu dostaw (Scope 3), stale optymalizując procesy pakowania i wysyłki. Nacisk na minimalizację pierwotnych tworzyw sztucznych jednorazowego użytku. Priorytet: materiały biodegradowalne, kompostowalne lub z certyfikowanych źródeł (kartony FSC, papierowe wypełniacze i taśmy). Wdrażamy rozwiązania redukujące odpady po stronie odbiorcy końcowego.`,
    },
  
    // ============================================================
    // JAK DZIAŁAMY
    // ============================================================
    'jak-dzialamy': {
      title: 'Jak działamy — proces zamówienia',
      summary: 'Proces realizacji w 4 krokach, obsługa, weryfikacja jakości, akceptacja wizualizacji, dostawa.',
      content: `Obsługa tej samej klasy co nasze produkty.
  
  Zapewniamy model współpracy, który jest równie niezawodny i dopracowany, tak jak produkty w naszej ofercie. Od selekcji, przez dyskretny branding, aż po bezpieczną dostawę — precyzyjnie, terminowo i bez zbędnych formalności. Dopinamy wszystko na ostatni guzik, abyś Ty mógł skupić się na swoich celach, mając gwarancję spokoju i terminowości.
  
  Proces realizacji — 4 kroki:
  
  1. Brief i Konsultacja — Opowiedz nam o okazji, grupie odbiorców i budżecie. Dobierzemy produkty i metody znakowania. Wycenę otrzymasz w 24h.
  
  2. Wyselekcjonowana Oferta — Nie przeszukujesz tysięcy produktów. Przygotujemy starannie dobraną propozycję — tylko sprawdzone marki i produkty, które przeszły naszą weryfikację jakości.
  
  3. Personalizacja i Produkcja — Zatwierdzasz wizualizację logo na produkcie. Po akceptacji uruchamiamy znakowanie z pełną kontrolą jakości.
  
  4. Dostawa i Wręczenie — Dostarczymy do siedziby firmy lub wyślemy indywidualnie do każdego odbiorcy. Estetyczne pakowanie gotowe do wręczenia.
  
  Bezpieczeństwo i łatwość współpracy:
  
  Weryfikacja jakości — żadne zdjęcie nie zastąpi fizycznego kontaktu. Udostępniamy wzory produktów, abyś mógł wziąć je do ręki, poczuć fakturę materiału i ocenić detale wykończenia. Decyzję podejmujesz w oparciu o realne odczucia.
  
  Akceptacja wizualizacji — eliminujemy ryzyko błędu. Przed startem produkcji otrzymujesz wierną wizualizację. Widzisz dokładnie, jak logotyp prezentuje się na gotowym produkcie. To czas na spokój i pewność, że finalny efekt będzie perfekcyjnym odwzorowaniem wizji.
  
  Komfort wręczania — szanujemy Twój czas, dlatego omijasz żmudny etap logistyki. Otrzymujesz estetycznie spakowane produkty, które wręczysz swoim klientom z prawdziwą przyjemnością. Na życzenie zadbamy też o detale, takie jak personalizowane bileciki czy ozdobne owijki.`,
    },
  
    // ============================================================
    // ZNAKOWANIE (metody personalizacji)
    // ============================================================
    'znakowanie': {
      title: 'Znakowanie i personalizacja',
      summary: 'Metody personalizacji: grawer laserowy, tłoczenie, haft komputerowy, druk DTF, druk UV, sitodruk, termotransfer, tampondruk.',
      content: `Znakowanie, które uszlachetnia produkt.
  
  Wierzymy, że branding powinien być dyskretny i elegancki. Korzystamy z technologii, które pozwalają zachować unikalny charakter materiałów, jednocześnie trwale eksponując markę klienta.
  
  Grawer Laserowy
  Najtrwalsza i najbardziej szlachetna metoda znakowania. Wiązka lasera precyzyjnie usuwa wierzchnią warstwę materiału, odsłaniając jego strukturę.
  Zastosowanie: Metal (kubki termiczne, długopisy), drewno, bambus
  Efekt: Niezniszczalny, dyskretny, elegancki
  
  Tłoczenie
  Technika dedykowana produktom skórzanym i skóropodobnym. Matryca pod wpływem nacisku i temperatury trwale odkształca materiał, tworząc trójwymiarowy wzór.
  Zastosowanie: Notatniki, kalendarze, galanteria skórzana
  Efekt: Prestiżowy, wyczuwalny pod palcami, minimalistyczny
  
  Haft Komputerowy
  Klasyka znakowania tekstyliów. Sterowane cyfrowo igły nanoszą wzór bezpośrednio na materiał, używając nici o wysokiej wytrzymałości.
  Zastosowanie: Polary, kurtki softshell, czapki, ręczniki, torby
  Efekt: Trójwymiarowa faktura, najwyższa odporność na pranie
  
  Druk DTF (Direct to Film)
  Nowoczesna technologia cyfrowa, pozwalająca na odwzorowanie skomplikowanych grafik i przejść tonalnych. Nadruk jest najpierw nanoszony na specjalną folię, a następnie transferowany na materiał.
  Zastosowanie: Odzież bawełniana i syntetyczna, gdzie wymagana jest wysoka szczegółowość
  Efekt: Elastyczny, gładki w dotyku nadruk o wysokiej rozdzielczości i trwałości
  
  Druk UV
  Bezpośredni druk cyfrowy utwardzany światłem UV. Pozwala na uzyskanie fotograficznej jakości i pełnego nasycenia kolorów (CMYK) na twardych powierzchniach.
  Zastosowanie: Gadżety elektroniczne, notesy, płaskie powierzchnie z tworzyw
  Efekt: Żywe kolory, idealne odwzorowanie gradientów, natychmiastowe utrwalenie
  
  Sitodruk
  Tradycyjna, przemysłowa technika druku bezpośredniego. Farba jest przetłaczana przez specjalnie przygotowaną matrycę (sito). Idealna przy większych nakładach.
  Zastosowanie: Odzież (T-shirty, torby bawełniane), papier, tworzywa
  Efekt: Głębokie nasycenie koloru, bardzo wysoka trwałość i odporność
  
  Termotransfer
  Technika polegająca na wgrzaniu logotypu w materiał za pomocą prasy termicznej. Pozwala na precyzyjne odwzorowanie drobnych elementów, których nie da się wykonać haftem.
  Zastosowanie: Odzież sportowa, plecaki, parasole, trudnodostępne miejsca
  Efekt: Gładka powierzchnia, precyzyjne krawędzie, wysoka estetyka detalu
  
  Tampondruk
  Technika druku wykorzystująca elastyczny silikonowy stempel ("tampon"). Dzięki plastyczności dopasowuje się do kształtu podłoża, umożliwiając znakowanie powierzchni zakrzywionych, wklęsłych lub wypukłych.
  Zastosowanie: Długopisy, kubki, drobna elektronika, breloki, elementy o nieregularnych kształtach
  Efekt: Precyzyjne odwzorowanie drobnych detali na trudnych powierzchniach, czyste krawędzie`,
    },
  
    // ============================================================
    // O NAS
    // ============================================================
    'o-nas': {
      title: 'O Giviu',
      summary: 'Filozofia selekcji, podejście premium, fakty branżowe (ASI, PPAI, ESG).',
      content: `Nie mamy wszystkiego. Mamy tylko to, co jest warte Twojej marki.
  
  Nie tworzymy katalogów z tysiącami gadżetów. Wybieramy tylko te produkty, które naprawdę warto wręczyć. Światowe marki, przemyślany design i jakość, która zostaje na lata.
  
  Selekcja bez kompromisów — nasza filozofia jest prosta: eliminujemy przeciętność. Odrzucamy przedmioty, które po chwili lądują w koszu, na rzecz tych, które stają się częścią codzienności. Skoro na produkcie znajdzie się logo klienta, musi on reprezentować najwyższy standard. Skupiamy się wyłącznie na markach funkcjonalnych, trwałych i wyróżniających się designem.
  
  Produkty, których się pragnie — zapomnij o gadżetach, które trafiają na dno szuflady chwilę po spotkaniu. Wprowadzamy do świata B2B produkty, które ludzie znają, cenią i chętnie kupują prywatnie. Nasze kryterium jest proste: czy sami chcielibyśmy to dostać? Dlatego w ofercie znajdziesz tylko przedmioty użyteczne i piękne.
  
  Światowi liderzy w Twoim zasięgu — nie budujemy oferty na anonimowych producentach. Sięgamy wyłącznie po ikony swoich kategorii — marki, które na swoją renomę pracowały dekadami. Thule, Stanley, Moleskine czy Rituals to nie tylko przedmioty. To symbole niezawodności i stylu.
  
  Fakty branżowe:
  
  Siła Retencji (ASI) — produkty premium są używane średnio 16 miesięcy, to niemal 2x dłużej niż standardowe gadżety. Logotyp pracuje przez prawie półtora roku, co drastycznie obniża realny koszt dotarcia (CPI).
  
  Transfer Prestiżu (PPAI) — aż 72% odbiorców utożsamia jakość upominku z reputacją firmy. To kluczowy punkt styku z marką. Wręczając produkt uznanej klasy, budujesz prestiż i zaufanie.
  
  Wsparcie celów ESG — model "kupuj mniej, ale lepiej". Wybór trwałych produktów to realna realizacja celów zrównoważonego rozwoju. Zamiast generować kolejne odpady, inwestujesz w przedmioty, które służą latami.`,
    },
  
    // ============================================================
    // FAQ — OGÓLNE
    // ============================================================
    'faq': {
      title: 'FAQ — najczęściej zadawane pytania',
      summary: 'Ogólne pytania o minimalny nakład, czas realizacji, próbki, metody znakowania, faktury VAT, dostawy, wizualizacje.',
      content: `Pytanie: Jaki jest minimalny nakład zamówienia?
  Odpowiedź: Minimalne zamówienie zależy od produktu i metody znakowania. Dla większości produktów to 10-50 sztuk. Skontaktuj się z nami, aby uzyskać szczegóły dla konkretnego produktu.
  
  Pytanie: Jak długo trwa realizacja zamówienia?
  Odpowiedź: Standardowy czas realizacji to 2-3 tygodnie od akceptacji wizualizacji. W przypadku pilnych zamówień oferujemy tryb ekspresowy.
  
  Pytanie: Czy mogę zamówić próbki produktów?
  Odpowiedź: Tak, udostępniamy próbki produktów do oceny jakości przed złożeniem zamówienia. Koszt próbek jest odliczany od wartości finalnego zamówienia.
  
  Pytanie: Jakie metody znakowania oferujecie?
  Odpowiedź: Oferujemy grawer laserowy, tłoczenie, haft komputerowy, druk DTF, druk UV, sitodruk, termotransfer i tampodruk. Dobieramy metodę do materiału i efektu, jaki chcesz osiągnąć.
  
  Pytanie: Czy wystawiacie faktury VAT?
  Odpowiedź: Tak, do każdego zamówienia wystawiamy fakturę VAT. Możemy również wystawić fakturę proforma przed realizacją zamówienia.
  
  Pytanie: Czy oferujecie dostawę pod wiele adresów?
  Odpowiedź: Tak, realizujemy wysyłki pod wiele adresów w ramach jednego zamówienia. To idealne rozwiązanie dla firm z rozproszonymi zespołami.
  
  Pytanie: Jak wygląda proces akceptacji wizualizacji?
  Odpowiedź: Po ustaleniu szczegółów przygotowujemy wizualizację produktu z logo klienta. Jest możliwość wprowadzenia poprawek przed akceptacją i startem produkcji.`,
    },
  
    // ============================================================
    // FAQ — ODZIEŻ
    // ============================================================
    'faq-odziez': {
      title: 'FAQ — odzież firmowa',
      summary: 'Pytania o rozmiary, materiały, haft, DTF, certyfikaty ekologiczne odzieży.',
      content: `Pytanie: Jakie rozmiary odzieży oferujecie?
  Odpowiedź: Pełna rozmiarówka od XS do 5XL. Dla niektórych modeli dostępne rozmiary dziecięce. Każdy produkt ma szczegółową tabelę rozmiarów.
  
  Pytanie: Czy mogę zamówić mieszane rozmiary w jednym zamówieniu?
  Odpowiedź: Tak, można dowolnie komponować rozmiary w ramach jednego zamówienia.
  
  Pytanie: Jakie metody znakowania są dostępne dla odzieży?
  Odpowiedź: Haft komputerowy, druk DTF, sitodruk i termotransfer. Metoda dobierana w zależności od materiału i efektu.
  
  Pytanie: Czy haft jest trwalszy od nadruku?
  Odpowiedź: Haft jest najbardziej trwałą metodą — przetrwa setki prań. Nadruki DTF i sitodruk również bardzo wytrzymałe przy odpowiedniej pielęgnacji.
  
  Pytanie: Jakie materiały są używane w odzieży?
  Odpowiedź: Bawełna organiczna (GOTS), poliester z recyklingu (rPET), mieszanki bawełna-poliester oraz wełna merino. Wszystkie materiały posiadają certyfikaty jakości.
  
  Pytanie: Jaki jest minimalny nakład dla odzieży z haftem?
  Odpowiedź: Zazwyczaj 10-20 sztuk. Dla większych zamówień atrakcyjniejsze ceny jednostkowe.
  
  Pytanie: Jak długo trwa realizacja?
  Odpowiedź: 2-3 tygodnie. Dla zamówień z haftem może być nieco dłuższy ze względu na digitalizację wzoru.`,
    },
  
    // ============================================================
    // FAQ — KUBKI I BUTELKI
    // ============================================================
    'faq-kubki': {
      title: 'FAQ — kubki i butelki',
      summary: 'Pytania o zmywarkę, izolację, grawer, materiały, pojemności kubków termicznych.',
      content: `Pytanie: Czy kubki termiczne można myć w zmywarce?
  Odpowiedź: Większość kubków termicznych jest zmywarkoodporna. Szczegóły w opisie każdego produktu.
  
  Pytanie: Jak długo kubki utrzymują temperaturę?
  Odpowiedź: Napoje gorące do 12 godzin, zimne do 24 godzin. Dokładne parametry zależą od modelu.
  
  Pytanie: Jakie metody znakowania są dostępne dla kubków?
  Odpowiedź: Grawer laserowy, druk UV i tampodruk. Grawer najbardziej trwały i elegancki na metalowych powierzchniach.
  
  Pytanie: Czy grawer laserowy jest trwały?
  Odpowiedź: Tak, grawer laserowy jest niezniszczalny — nie ściera się, nie blaknie i nie łuszczy. Najtrwalsza metoda znakowania na metalu.
  
  Pytanie: Z jakich materiałów są wykonane butelki?
  Odpowiedź: Stal nierdzewna 18/8, aluminium z recyklingu oraz Tritan Renew. Wszystkie bezpieczne dla zdrowia i wolne od BPA.
  
  Pytanie: Jakie pojemności są dostępne?
  Odpowiedź: Od 350ml do 1,2L. Najpopularniejsze to 500ml i 750ml.
  
  Pytanie: Czy butelki są szczelne?
  Odpowiedź: Tak, wszystkie butelki i kubki są w 100% szczelne.
  
  Pytanie: Jaki jest minimalny nakład dla kubków z grawerem?
  Odpowiedź: Zazwyczaj 25-50 sztuk, w zależności od modelu.`,
    },
  
    // ============================================================
    // FAQ — PLECAKI I TORBY
    // ============================================================
    'faq-plecaki': {
      title: 'FAQ — plecaki i torby',
      summary: 'Pytania o materiały, pojemności, kieszeń na laptopa, haft, wodoodporność plecaków.',
      content: `Pytanie: Z jakich materiałów są wykonane plecaki?
  Odpowiedź: Poliester z recyklingu (rPET), nylon, bawełna organiczna oraz materiały wodoodporne. Wytrzymałe i łatwe w czyszczeniu.
  
  Pytanie: Czy plecaki mają kieszeń na laptopa?
  Odpowiedź: Większość plecaków biznesowych ma dedykowaną kieszeń na laptopa do 15,6". Niektóre modele mieszczą laptopy do 17".
  
  Pytanie: Jakie pojemności plecaków?
  Odpowiedź: Od 15L (miejskie) do 40L (podróżne). Najpopularniejsze to 20-25L.
  
  Pytanie: Jakie metody znakowania dla plecaków?
  Odpowiedź: Haft komputerowy, termotransfer i sitodruk. Haft najbardziej elegancki i trwały.
  
  Pytanie: Jaki minimalny nakład dla plecaków z haftem?
  Odpowiedź: Zazwyczaj 20-30 sztuk.
  
  Pytanie: Czy plecaki mają gwarancję?
  Odpowiedź: Plecaki premium (Thule, The North Face) mają gwarancję producenta.`,
    },
  
    // ============================================================
    // FAQ — ELEKTRONIKA
    // ============================================================
    'faq-elektronika': {
      title: 'FAQ — elektronika',
      summary: 'Pytania o powerbanki, słuchawki, ładowarki, głośniki, certyfikaty CE/RoHS.',
      content: `Pytanie: Jakie pojemności powerbanków?
  Odpowiedź: Od 5000mAh do 20000mAh. Najpopularniejsze 10000mAh — wystarczają na 2-3 pełne ładowania smartfona.
  
  Pytanie: Czy powerbanki można zabrać do samolotu?
  Odpowiedź: Tak, wszystkie powerbanki do 20000mAh (100Wh) można zabrać w bagażu podręcznym zgodnie z przepisami lotniczymi.
  
  Pytanie: Jakie metody znakowania dla elektroniki?
  Odpowiedź: Grawer laserowy, druk UV i tampodruk. Grawer najbardziej elegancki na metalowych obudowach.
  
  Pytanie: Czy elektronika ma certyfikaty bezpieczeństwa?
  Odpowiedź: Tak, wszystkie produkty elektroniczne posiadają certyfikaty CE i RoHS.
  
  Pytanie: Czy oferujecie ładowarki indukcyjne?
  Odpowiedź: Tak, ładowarki indukcyjne zgodne ze standardem Qi — działają ze wszystkimi nowoczesnymi smartfonami.
  
  Pytanie: Jaki minimalny nakład dla elektroniki z grawerem?
  Odpowiedź: Zazwyczaj 25-50 sztuk.`,
    },
  
    // ============================================================
    // FAQ — PARASOLE
    // ============================================================
    'faq-parasole': {
      title: 'FAQ — parasole',
      summary: 'Pytania o rodzaje parasoli, wiatroszczelność, sublimację, średnice.',
      content: `Pytanie: Jakie rodzaje parasoli oferujecie?
  Odpowiedź: Automatyczne, półautomatyczne, składane, golfowe i premium. Też parasole odwrócone z innowacyjnym mechanizmem.
  
  Pytanie: Czy parasole są wiatroszczelne?
  Odpowiedź: Większość ma wzmocnioną konstrukcję odporną na wiatr. Modele premium wytrzymują podmuchy do 100 km/h.
  
  Pytanie: Czy mogę zamówić parasol z własnym wzorem na całej czaszy?
  Odpowiedź: Tak, nadruk sublimacyjny na całej powierzchni czaszy. Minimalny nakład 50-100 sztuk.
  
  Pytanie: Jakie metody znakowania dla parasoli?
  Odpowiedź: Sitodruk na czaszy, haft na pokrowcu oraz sublimacja dla pełnokolorowych wzorów.
  
  Pytanie: Jakie średnice parasoli?
  Odpowiedź: Od 90cm (kompaktowe) do 130cm (golfowe). Najpopularniejsze 100-105cm.`,
    },
  
    // ============================================================
    // FAQ — DOM I WYPOCZYNEK
    // ============================================================
    'faq-dom': {
      title: 'FAQ — dom i wypoczynek',
      summary: 'Pytania o koce, świece, zestawy piknikowe, materiały, opakowania.',
      content: `Pytanie: Jakie produkty w kategorii Dom i wypoczynek?
  Odpowiedź: Koce, poduszki, świece, zestawy piknikowe, hamaki, leżaki plażowe i akcesoria do grillowania.
  
  Pytanie: Z jakich materiałów są koce?
  Odpowiedź: Wełna merino, polar, bawełna i materiały z recyklingu. Miękkie i trwałe.
  
  Pytanie: Czy świece są z naturalnych składników?
  Odpowiedź: Tak, świece premium z wosku sojowego lub rzepakowego, z naturalnymi olejkami eterycznymi.
  
  Pytanie: Czy mogę zamówić świece z własnym zapachem?
  Odpowiedź: Dla zamówień powyżej 200 sztuk — indywidualnie dobrana kompozycja zapachowa.
  
  Pytanie: Czy produkty są w eleganckich opakowaniach?
  Odpowiedź: Tak, większość dostępna w eleganckich pudełkach prezentowych.`,
    },
  
    // ============================================================
    // FAQ — BIURO I NOTATNIKI
    // ============================================================
    'faq-biuro': {
      title: 'FAQ — biuro i notatniki',
      summary: 'Pytania o notatniki Moleskine, tłoczenie, długopisy, kalendarze, formaty.',
      content: `Pytanie: Jakie marki notatników?
  Odpowiedź: Moleskine i Karst — notatniki premium z możliwością personalizacji (tłoczenie, grawer, sitodruk).
  
  Pytanie: Jakie metody znakowania dla notatników?
  Odpowiedź: Tłoczenie (debossing/embossing), grawer laserowy i sitodruk. Tłoczenie najbardziej eleganckie.
  
  Pytanie: Czy mogę zamówić notatnik z własnymi stronami?
  Odpowiedź: Dla zamówień powyżej 250 sztuk — notatniki z indywidualnie zaprojektowanymi stronami.
  
  Pytanie: Jakie formaty notatników?
  Odpowiedź: A4, A5, A6 oraz niestandardowe (pocket, reporter).
  
  Pytanie: Czy długopisy mają wymienne wkłady?
  Odpowiedź: Tak, wszystkie długopisy premium mają wymienne wkłady.
  
  Pytanie: Jakie metody znakowania dla długopisów?
  Odpowiedź: Grawer laserowy, tampodruk i druk UV. Grawer najtrwalszy na metalowych długopisach.
  
  Pytanie: Jaki minimalny nakład dla notatników z tłoczeniem?
  Odpowiedź: Zazwyczaj 50-100 sztuk.`,
    },
  };
  
  /** Lista slugów — używana przez route.ts do wstrzykiwania do system prompta. */
  export const CHAT_CONTEXT_SLUGS = Object.entries(CHAT_CONTEXT).map(
    ([slug, page]) => ({ slug, title: page.title, summary: page.summary })
  );