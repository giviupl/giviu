export interface FAQItem {
  question: string;
  answer: string;
}

export interface CategoryFAQ {
  title: string;
  description: string;
  items: FAQItem[];
}

// FAQ dla strony głównej FAQ
export const FAQ_GENERAL: FAQItem[] = [
  {
    question: "Jaki jest minimalny nakład zamówienia?",
    answer: "Minimalne zamówienie zależy od produktu i metody znakowania. Dla większości produktów to 10-50 sztuk. Skontaktuj się z nami, aby uzyskać szczegóły dla konkretnego produktu."
  },
  {
    question: "Jak długo trwa realizacja zamówienia?",
    answer: "Standardowy czas realizacji to 2-3 tygodnie od akceptacji wizualizacji. W przypadku pilnych zamówień oferujemy tryb ekspresowy – skontaktuj się z nami."
  },
  {
    question: "Czy mogę zamówić próbki produktów?",
    answer: "Tak, udostępniamy próbki produktów do oceny jakości przed złożeniem zamówienia. Koszt próbek jest odliczany od wartości finalnego zamówienia."
  },
  {
    question: "Jakie metody znakowania oferujecie?",
    answer: "Oferujemy grawer laserowy, tłoczenie, haft komputerowy, druk DTF, druk UV, sitodruk, termotransfer i tampodruk. Dobieramy metodę do materiału i efektu, jaki chcesz osiągnąć."
  },
  {
    question: "Czy wystawiacie faktury VAT?",
    answer: "Tak, do każdego zamówienia wystawiamy fakturę VAT. Możemy również wystawić fakturę proforma przed realizacją zamówienia."
  },
  {
    question: "Czy oferujecie dostawę pod wiele adresów?",
    answer: "Tak, realizujemy wysyłki pod wiele adresów w ramach jednego zamówienia. To idealne rozwiązanie dla firm z rozproszonymi zespołami."
  },
  {
    question: "Jak wygląda proces akceptacji wizualizacji?",
    answer: "Po ustaleniu szczegółów przygotowujemy wizualizację produktu z Twoim logo. Masz możliwość wprowadzenia poprawek przed akceptacją i startem produkcji."
  },
];

// FAQ dla kategorii
export const FAQ_BY_CATEGORY: Record<string, CategoryFAQ> = {
  'odziez': {
    title: 'Najczęściej zadawane pytania — Odzież',
    description: 'Wszystko o rozmiarach, materiałach i personalizacji odzieży firmowej.',
    items: [
      {
        question: "Jakie rozmiary odzieży oferujecie?",
        answer: "Oferujemy pełną rozmiarówkę od XS do 5XL. Dla niektórych modeli dostępne są również rozmiary dziecięce. Każdy produkt ma szczegółową tabelę rozmiarów."
      },
      {
        question: "Czy mogę zamówić mieszane rozmiary w jednym zamówieniu?",
        answer: "Tak, możesz dowolnie komponować rozmiary w ramach jednego zamówienia. Wystarczy podać ilości dla każdego rozmiaru."
      },
      {
        question: "Jakie metody znakowania są dostępne dla odzieży?",
        answer: "Dla odzieży oferujemy haft komputerowy, druk DTF, sitodruk i termotransfer. Dobieramy metodę w zależności od materiału i efektu, jaki chcesz osiągnąć."
      },
      {
        question: "Czy haft jest trwalszy od nadruku?",
        answer: "Haft jest najbardziej trwałą metodą znakowania — przetrwa setki prań. Nadruki DTF i sitodruk również są bardzo wytrzymałe przy odpowiedniej pielęgnacji."
      },
      {
        question: "Jakie materiały są używane w odzieży?",
        answer: "Oferujemy odzież z bawełny organicznej (GOTS), poliestru z recyklingu (rPET), mieszanek bawełna-poliester oraz wełny merino. Wszystkie materiały posiadają certyfikaty jakości."
      },
      {
        question: "Czy mogę zamówić próbkę odzieży przed zamówieniem?",
        answer: "Tak, udostępniamy próbki do przymiarki i oceny jakości. Koszt próbek jest odliczany od wartości finalnego zamówienia."
      },
      {
        question: "Jaki jest minimalny nakład dla odzieży z haftem?",
        answer: "Minimalny nakład dla odzieży z haftem to zazwyczaj 10-20 sztuk. Dla większych zamówień oferujemy atrakcyjniejsze ceny jednostkowe."
      },
      {
        question: "Czy oferujecie odzież z certyfikatami ekologicznymi?",
        answer: "Tak, większość naszej odzieży posiada certyfikaty GOTS, OEKO-TEX lub jest wykonana z materiałów z recyklingu."
      },
      {
        question: "Jak długo trwa realizacja zamówienia na odzież?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla zamówień z haftem może być nieco dłuższy ze względu na proces digitalizacji wzoru."
      },
      {
        question: "Czy mogę zobaczyć wizualizację haftu przed produkcją?",
        answer: "Tak, przed rozpoczęciem produkcji przygotowujemy wizualizację haftu do Twojej akceptacji. Możesz wprowadzić poprawki bez dodatkowych kosztów."
      },
    ]
  },
  'kubki-i-butelki': {
    title: 'Najczęściej zadawane pytania — Kubki i butelki',
    description: 'Informacje o materiałach, pojemnościach, izolacji i metodach znakowania.',
    items: [
      {
        question: "Czy kubki termiczne można myć w zmywarce?",
        answer: "Większość naszych kubków termicznych jest zmywarkoodporna. Szczegółowe informacje znajdziesz w opisie każdego produktu."
      },
      {
        question: "Jak długo kubki utrzymują temperaturę?",
        answer: "Nasze kubki termiczne utrzymują napoje gorące do 12 godzin, a zimne do 24 godzin. Dokładne parametry zależą od modelu."
      },
      {
        question: "Jakie metody znakowania są dostępne dla kubków?",
        answer: "Dla kubków oferujemy grawer laserowy, druk UV i tampodruk. Grawer jest najbardziej trwały i elegancki na metalowych powierzchniach."
      },
      {
        question: "Czy grawer laserowy jest trwały?",
        answer: "Tak, grawer laserowy jest niezniszczalny — nie ściera się, nie blaknie i nie łuszczy. To najtrwalsza metoda znakowania na metalu."
      },
      {
        question: "Z jakich materiałów są wykonane butelki?",
        answer: "Oferujemy butelki ze stali nierdzewnej 18/8, aluminium z recyklingu oraz Tritanu™ Renew. Wszystkie materiały są bezpieczne dla zdrowia i wolne od BPA."
      },
      {
        question: "Jakie pojemności są dostępne?",
        answer: "Oferujemy kubki i butelki o pojemnościach od 350ml do 1,2L. Najpopularniejsze to 500ml i 750ml."
      },
      {
        question: "Czy butelki są szczelne?",
        answer: "Tak, wszystkie nasze butelki i kubki są w 100% szczelne. Możesz je bezpiecznie nosić w torbie czy plecaku."
      },
      {
        question: "Jaki jest minimalny nakład dla kubków z grawerem?",
        answer: "Minimalny nakład dla kubków z grawerem to zazwyczaj 25-50 sztuk, w zależności od modelu."
      },
      {
        question: "Czy mogę zamówić kubki w różnych kolorach?",
        answer: "Tak, większość modeli jest dostępna w kilku wariantach kolorystycznych. Możesz mieszać kolory w ramach jednego zamówienia."
      },
      {
        question: "Czy oferujecie kubki z certyfikatami ekologicznymi?",
        answer: "Tak, wiele naszych kubków posiada certyfikaty takie jak B Corp czy Climate Neutral. Materiały pochodzą z odpowiedzialnych źródeł."
      },
    ]
  },
  'plecaki-i-torby': {
    title: 'Najczęściej zadawane pytania — Plecaki i torby',
    description: 'Wszystko o materiałach, pojemnościach i opcjach personalizacji plecaków i toreb.',
    items: [
      {
        question: "Z jakich materiałów są wykonane plecaki?",
        answer: "Oferujemy plecaki z poliestru z recyklingu (rPET), nylonu, bawełny organicznej oraz materiałów wodoodpornych. Wszystkie są wytrzymałe i łatwe w czyszczeniu."
      },
      {
        question: "Jakie metody znakowania są dostępne dla plecaków?",
        answer: "Dla plecaków oferujemy haft komputerowy, termotransfer i sitodruk. Haft jest najbardziej elegancki i trwały."
      },
      {
        question: "Czy plecaki mają kieszeń na laptopa?",
        answer: "Większość naszych plecaków biznesowych ma dedykowaną kieszeń na laptopa do 15,6\". Niektóre modele mieszczą laptopy do 17\"."
      },
      {
        question: "Czy torby są wodoodporne?",
        answer: "Oferujemy zarówno torby wodoodporne, jak i wodoodporne. Szczegółowe informacje znajdziesz w opisie każdego produktu."
      },
      {
        question: "Jakie pojemności plecaków oferujecie?",
        answer: "Oferujemy plecaki o pojemnościach od 15L (miejskie) do 40L (podróżne). Najpopularniejsze to plecaki 20-25L."
      },
      {
        question: "Czy mogę zamówić torby z własnym wzorem tkaniny?",
        answer: "Dla zamówień powyżej 500 sztuk możemy wyprodukować torby z indywidualnie zadrukowaną tkaniną."
      },
      {
        question: "Jaki jest minimalny nakład dla plecaków z haftem?",
        answer: "Minimalny nakład dla plecaków z haftem to zazwyczaj 20-30 sztuk, w zależności od modelu."
      },
      {
        question: "Czy plecaki mają gwarancję?",
        answer: "Tak, wszystkie nasze plecaki premium (Thule, The North Face) mają gwarancję producenta. Szczegóły w opisie produktu."
      },
      {
        question: "Czy oferujecie torby ekologiczne?",
        answer: "Tak, mamy szeroki wybór toreb z materiałów ekologicznych: bawełna organiczna, rPET, juta i materiały z recyklingu."
      },
      {
        question: "Jak długo trwa realizacja zamówienia na plecaki?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla zamówień z haftem lub większych ilości może być nieco dłuższy."
      },
    ]
  },
  'elektronika': {
    title: 'Najczęściej zadawane pytania — Elektronika',
    description: 'Informacje o powerbanach, słuchawkach, głośnikach i innych gadżetach elektronicznych.',
    items: [
      {
        question: "Jakie pojemności powerbanków oferujecie?",
        answer: "Oferujemy powerbanki od 5000mAh do 20000mAh. Najpopularniejsze to modele 10000mAh — wystarczają na 2-3 pełne ładowania smartfona."
      },
      {
        question: "Czy powerbanki można zabrać do samolotu?",
        answer: "Tak, wszystkie nasze powerbanki do 20000mAh (100Wh) można zabrać w bagażu podręcznym zgodnie z przepisami lotniczymi."
      },
      {
        question: "Jakie metody znakowania są dostępne dla elektroniki?",
        answer: "Dla elektroniki oferujemy grawer laserowy, druk UV i tampodruk. Grawer jest najbardziej elegancki na metalowych obudowach."
      },
      {
        question: "Czy słuchawki mają gwarancję?",
        answer: "Tak, wszystkie nasze słuchawki i głośniki mają gwarancję producenta od 12 do 24 miesięcy."
      },
      {
        question: "Czy oferujecie ładowarki indukcyjne?",
        answer: "Tak, mamy ładowarki indukcyjne zgodne ze standardem Qi — działają ze wszystkimi nowoczesnymi smartfonami."
      },
      {
        question: "Jaki jest minimalny nakład dla elektroniki z grawerem?",
        answer: "Minimalny nakład dla elektroniki z grawerem to zazwyczaj 25-50 sztuk, w zależności od produktu."
      },
      {
        question: "Czy głośniki Bluetooth są wodoodporne?",
        answer: "Oferujemy głośniki z różnymi klasami wodoodporności — od IPX4 (odporność na zachlapanie) do IPX7 (zanurzenie w wodzie)."
      },
      {
        question: "Czy elektronika ma certyfikaty bezpieczeństwa?",
        answer: "Tak, wszystkie nasze produkty elektroniczne posiadają wymagane certyfikaty CE i RoHS."
      },
      {
        question: "Czy mogę zamówić elektronikę w firmowych kolorach?",
        answer: "Niektóre modele są dostępne w różnych kolorach. Dla większych zamówień możemy przygotować produkty w kolorze zbliżonym do firmowego."
      },
      {
        question: "Jak długo trwa realizacja zamówienia na elektronikę?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla produktów z grawerem lub większych ilości może być nieco dłuższy."
      },
    ]
  },
  'parasole': {
    title: 'Najczęściej zadawane pytania — Parasole',
    description: 'Informacje o rodzajach parasoli, materiałach i opcjach brandingu.',
    items: [
      {
        question: "Jakie rodzaje parasoli oferujecie?",
        answer: "Oferujemy parasole automatyczne, półautomatyczne, składane, golfowe i premium. Mamy też parasole odwrócone z innowacyjnym mechanizmem."
      },
      {
        question: "Jakie metody znakowania są dostępne dla parasoli?",
        answer: "Dla parasoli oferujemy sitodruk na czaszy, haft na pokrowcu oraz sublimację dla pełnokolorowych wzorów na całej powierzchni."
      },
      {
        question: "Czy parasole są wiatroszczelne?",
        answer: "Tak, większość naszych parasoli ma wzmocnioną konstrukcję odporną na wiatr. Modele premium wytrzymują podmuchy do 100 km/h."
      },
      {
        question: "Czy mogę zamówić parasol z własnym wzorem na całej czaszy?",
        answer: "Tak, oferujemy parasole z nadrukiem sublimacyjnym na całej powierzchni czaszy. Minimalny nakład to 50-100 sztuk."
      },
      {
        question: "Z jakich materiałów są wykonane czasze?",
        answer: "Czasze są wykonane z poliestru Pongee lub wysokiej jakości nylonu. Oferujemy też parasole z materiałów z recyklingu."
      },
      {
        question: "Jaki jest minimalny nakład dla parasoli z nadrukiem?",
        answer: "Minimalny nakład dla parasoli z nadrukiem to zazwyczaj 25-50 sztuk, w zależności od metody znakowania."
      },
      {
        question: "Czy parasole mają gwarancję?",
        answer: "Tak, nasze parasole premium mają gwarancję producenta. Standardowe modele są objęte gwarancją jakości Giviu."
      },
      {
        question: "Jakie średnice parasoli są dostępne?",
        answer: "Oferujemy parasole od 90cm (kompaktowe) do 130cm (golfowe). Najpopularniejsze to parasole 100-105cm."
      },
      {
        question: "Czy oferujecie parasole ekologiczne?",
        answer: "Tak, mamy parasole z materiałów z recyklingu oraz z bambusowymi rączkami — idealne dla firm dbających o środowisko."
      },
      {
        question: "Jak długo trwa realizacja zamówienia na parasole?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla parasoli z sublimacją lub większych ilości może być dłuższy."
      },
    ]
  },
  'dom-i-wypoczynek': {
    title: 'Najczęściej zadawane pytania — Dom i wypoczynek',
    description: 'Informacje o kocach, świecach, zestawach piknikowych i innych produktach lifestyle.',
    items: [
      {
        question: "Jakie produkty znajdę w kategorii Dom i wypoczynek?",
        answer: "Oferujemy koce, poduszki, świece, zestawy piknikowe, hamaki, leżaki plażowe i akcesoria do grillowania."
      },
      {
        question: "Z jakich materiałów są wykonane koce?",
        answer: "Oferujemy koce z wełny merino, polarowe, bawełniane i z materiałów z recyklingu. Wszystkie są miękkie i trwałe."
      },
      {
        question: "Jakie metody znakowania są dostępne dla koców?",
        answer: "Dla koców oferujemy haft komputerowy i naszywki. Haft jest elegancki i bardzo trwały."
      },
      {
        question: "Czy świece są wykonane z naturalnych składników?",
        answer: "Tak, nasze świece premium są wykonane z wosku sojowego lub rzepakowego, z naturalnymi olejkami eterycznymi."
      },
      {
        question: "Czy mogę zamówić świece z własnym zapachem?",
        answer: "Dla zamówień powyżej 200 sztuk możemy przygotować świece z indywidualnie dobraną kompozycją zapachową."
      },
      {
        question: "Jaki jest minimalny nakład dla produktów z tej kategorii?",
        answer: "Minimalny nakład zależy od produktu — od 20 sztuk dla koców do 50-100 sztuk dla świec i akcesoriów."
      },
      {
        question: "Czy zestawy piknikowe zawierają sztućce?",
        answer: "Tak, nasze zestawy piknikowe są kompletnie wyposażone — zawierają sztućce, talerze, kieliszki i otwieracz."
      },
      {
        question: "Czy produkty są pakowane w eleganckie opakowania?",
        answer: "Tak, większość produktów z tej kategorii jest dostępna w eleganckich pudełkach prezentowych."
      },
      {
        question: "Czy oferujecie produkty ekologiczne?",
        answer: "Tak, mamy koce z materiałów z recyklingu, świece sojowe i akcesoria z bambusa."
      },
      {
        question: "Jak długo trwa realizacja zamówienia?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla produktów z personalizacją może być nieco dłuższy."
      },
    ]
  },
  'biuro-i-notatniki': {
    title: 'Najczęściej zadawane pytania — Biuro i notatniki',
    description: 'Informacje o notatnikach, długopisach, kalendarzach i akcesoriach biurowych.',
    items: [
      {
        question: "Jakie marki notatników oferujecie?",
        answer: "Oferujemy notatniki premium marek Moleskine, Leuchtturm1917 oraz własne linie produktów w różnych przedziałach cenowych."
      },
      {
        question: "Jakie metody znakowania są dostępne dla notatników?",
        answer: "Dla notatników oferujemy tłoczenie (debossing/embossing), grawer laserowy i sitodruk. Tłoczenie jest najbardziej eleganckie."
      },
      {
        question: "Czy mogę zamówić notatnik z własnymi stronami?",
        answer: "Tak, dla zamówień powyżej 250 sztuk możemy przygotować notatniki z indywidualnie zaprojektowanymi stronami."
      },
      {
        question: "Jakie formaty notatników są dostępne?",
        answer: "Oferujemy notatniki w formatach A4, A5, A6 oraz niestandardowych rozmiarach jak pocket czy reporter."
      },
      {
        question: "Czy długopisy mają wymienne wkłady?",
        answer: "Tak, wszystkie nasze długopisy premium mają wymienne wkłady, co przedłuża ich żywotność."
      },
      {
        question: "Jakie metody znakowania są dostępne dla długopisów?",
        answer: "Dla długopisów oferujemy grawer laserowy, tampodruk i druk UV. Grawer jest najtrwalszy na metalowych długopisach."
      },
      {
        question: "Jaki jest minimalny nakład dla notatników z tłoczeniem?",
        answer: "Minimalny nakład dla notatników z tłoczeniem to zazwyczaj 50-100 sztuk, w zależności od modelu."
      },
      {
        question: "Czy oferujecie kalendarze firmowe?",
        answer: "Tak, oferujemy kalendarze książkowe, biurkowe i ścienne z możliwością pełnej personalizacji."
      },
      {
        question: "Czy notatniki mają certyfikaty ekologiczne?",
        answer: "Tak, wiele naszych notatników ma papier z certyfikatem FSC lub jest wykonanych z materiałów z recyklingu."
      },
      {
        question: "Jak długo trwa realizacja zamówienia?",
        answer: "Standardowy czas realizacji to 2-3 tygodnie. Dla notatników z indywidualnymi stronami może być dłuższy."
      },
    ]
  },
};

// Domyślne FAQ jeśli kategoria nie ma własnych pytań
export const FAQ_DEFAULT: CategoryFAQ = {
  title: 'Najczęściej zadawane pytania',
  description: 'Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące tej kategorii produktów.',
  items: [
    {
      question: "Jaki jest minimalny nakład zamówienia?",
      answer: "Minimalne zamówienie zależy od produktu i metody znakowania. Dla większości produktów to 10-50 sztuk. Skontaktuj się z nami, aby uzyskać szczegóły."
    },
    {
      question: "Jakie metody znakowania są dostępne?",
      answer: "Oferujemy różne metody znakowania w zależności od produktu: grawer laserowy, tłoczenie, haft, druk UV, sitodruk i inne."
    },
    {
      question: "Jak długo trwa realizacja zamówienia?",
      answer: "Standardowy czas realizacji to 2-3 tygodnie od akceptacji wizualizacji. W przypadku pilnych zamówień oferujemy tryb ekspresowy."
    },
  ]
};