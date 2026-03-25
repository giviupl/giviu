-- ============================================
-- GIVIU: Seed Data
-- Uruchom PO schema (01-schema.sql)
-- ============================================

-- ========== BRANDS ==========
INSERT INTO brands (slug, name, color, headline, description, features, categories, emoji) VALUES
(
  'stanley',
  'Stanley',
  '#2d5a27',
  'Stanley: Ikona trwałości, która buduje prestiż Twojej marki',
  'W świecie tymczasowych gadżetów Stanley jest symbolem niezmienności. To marka, która od 1913 roku udowadnia, że prawdziwa jakość nie potrzebuje wymiany. W Giviu wybraliśmy Stanleya, ponieważ to kwintesencja naszej filozofii tworzenia prezentów na lata – produktów, które wręczasz z dumą, wiedząc, że będą służyć obdarowanemu przez dekady, a nie sezony.',
  '[{"title":"1. Legendarna wytrzymałość i izolacja","text":"Stanley od ponad wieku wyznacza standardy w technologii izolacji próżniowej. Dzięki zastosowaniu najwyższej jakości stali nierdzewnej 18/8, ich produkty są niemal niezniszczalne i utrzymują idealną temperaturę napojów przez rekordowy czas. To niezawodność, która buduje autorytet Twojej firmy w rękach wymagających profesjonalistów."},{"title":"2. Globalny fenomen i pożądanie","text":"Kultowe modele, takie jak seria Quencher, to obecnie jedne z najbardziej pożądanych akcesoriów lifestylowych na świecie. Wybierając Stanleya, wręczasz prezent, który Twoi klienci autentycznie chcą posiadać i nosić przy sobie. To gwarancja, że Twój upominek biznesowy nie trafi do szuflady, lecz stanie się częścią codzienności obdarowanego."},{"title":"3. Ekologia przez długowieczność","text":"Obietnica marki „Built for Life" to fundament odpowiedzialnej konsumpcji. Produkty Stanley eliminują potrzebę stosowania tysięcy jednorazowych butelek i kubków, a ich najnowsze linie wykorzystują stal pochodzącą w 90% z recyklingu. To świadomy wybór, który realnie wspiera cele ESG Twojej firmy i promuje trwałość zamiast tymczasowości."}]'::jsonb,
  '["KUBKI I BUTELKI"]'::jsonb,
  '🥤'
),
(
  'moleskine',
  'Moleskine',
  '#1a1a1a',
  'Moleskine: Gdzie myśli stają się wizjami',
  'Moleskine to więcej niż notatnik — to narzędzie kreatywności, które od pokoleń towarzyszy artystom, pisarzom i wizjonerom. Elegancka oprawa, ikoniczny design i najwyższa jakość papierów czynią z produktów Moleskine idealny prezent firmowy, który łączy funkcjonalność z prestiżem.',
  '[{"title":"1. Dziedzictwo kreatywności","text":"Od Vincenta van Gogha po współczesnych CEO — Moleskine to notatnik, który inspiruje do wielkich rzeczy. Wręczając go jako prezent firmowy, wręczasz narzędzie, które ma historię i charakter."},{"title":"2. Personalizacja na najwyższym poziomie","text":"Tłoczenie, grawer, pełnokolorowy nadruk — Moleskine oferuje szeroki wachlarz opcji personalizacji, które pozwalają stworzyć naprawdę unikatowy upominek z logo Twojej firmy."},{"title":"3. Zrównoważona produkcja","text":"Moleskine korzysta z certyfikowanego papieru FSC i systematycznie redukuje ślad węglowy swojej produkcji. To wybór, który łączy elegancję z odpowiedzialnością."}]'::jsonb,
  '["BIURO I NOTATNIKI"]'::jsonb,
  '📓'
),
(
  'the-north-face',
  'The North Face',
  '#1a1a1a',
  'The North Face: Wydajność, którą nosi się z dumą',
  'The North Face to marka, która od 1966 roku definiuje standardy w outdoorze. Ich produkty łączą zaawansowane technologie z nowoczesnym designem, tworząc odzież i akcesoria, które sprawdzają się zarówno na szlaku, jak i w biurze.',
  '[{"title":"1. Technologia, która chroni","text":"Od ThermoBall™ po DryVent™ — The North Face nieustannie rozwija technologie, które zapewniają komfort w każdych warunkach. Prezent firmowy z The North Face to prezent, który naprawdę służy."},{"title":"2. Ikona stylu outdoorowego","text":"Logo The North Face to jeden z najbardziej rozpoznawalnych symboli na świecie. Odzież i plecaki tej marki to statement — mówią o aktywnym stylu życia i wysokich standardach."},{"title":"3. Odpowiedzialność środowiskowa","text":"Program Renewed, materiały z recyklingu, transparentny łańcuch dostaw — The North Face to marka, która realnie działa na rzecz planety."}]'::jsonb,
  '["ODZIEŻ","PLECAKI I TORBY"]'::jsonb,
  '🏔️'
),
(
  'thule',
  'Thule',
  '#005eb8',
  'Thule: Szwedzka precyzja dla aktywnych profesjonalistów',
  'Thule od 1942 roku tworzy produkty, które ułatwiają aktywny tryb życia. Od plecaków miejskich po walizki podróżne — każdy produkt Thule łączy skandynawski minimalizm z niezawodną funkcjonalnością.',
  '[{"title":"1. Skandynawski design","text":"Czyste linie, przemyślane detale, trwałe materiały — produkty Thule to kwintesencja szwedzkiego podejścia do designu, gdzie forma podąża za funkcją."},{"title":"2. Testowane w ekstremalnych warunkach","text":"Każdy produkt Thule przechodzi rygorystyczne testy wytrzymałości. To sprzęt, który nie zawodzi — idealny dla wymagających profesjonalistów."},{"title":"3. Gwarancja na lata","text":"Thule oferuje rozszerzone gwarancje na swoje produkty, co jest dowodem zaufania do własnej jakości i obietnicą długoletniej służby."}]'::jsonb,
  '["PLECAKI I TORBY"]'::jsonb,
  '🎒'
),
(
  'rituals',
  'Rituals',
  '#1a1a1a',
  'Rituals: Luksus, który angażuje zmysły',
  'Rituals przekształca codzienne rytuały w niezwykłe doświadczenia. Ich produkty — od świec zapachowych po zestawy pielęgnacyjne — tworzą atmosferę luksusu i relaksu, idealną jako prezent firmowy premium.',
  '[{"title":"1. Doświadczenie zmysłowe","text":"Każdy produkt Rituals to starannie skomponowana kompozycja zapachów, tekstur i estetyki. To prezent, który angażuje wszystkie zmysły i tworzy niezapomniane wrażenie."},{"title":"2. Filozofia slow living","text":"Rituals promuje świadome przeżywanie chwil — filozofia, która rezonuje z nowoczesnymi wartościami wellness i work-life balance."},{"title":"3. Zrównoważony luksus","text":"Rituals systematycznie przechodzi na składniki naturalne i opakowania z recyklingu, udowadniając, że luksus i odpowiedzialność mogą iść w parze."}]'::jsonb,
  '["DOM I WYPOCZYNEK"]'::jsonb,
  '🕯️'
),
(
  'camelbak',
  'CamelBak',
  '#0066cc',
  'CamelBak: Hydratacja na najwyższym poziomie',
  'CamelBak to pionier innowacyjnych rozwiązań do nawadniania. Od ponad 30 lat marka tworzy produkty, które łączą zaawansowaną technologię z wygodą użytkowania.',
  '[{"title":"1. Innowacje w hydratacji","text":"Od wynalezienia plecakowego systemu hydratacji po zaawansowane butelki filtrujące — CamelBak nieustannie przesuwa granice tego, co możliwe w nawadnianiu."},{"title":"2. Gwarancja Got Your Bak™","text":"Dożywotnia gwarancja na wszystkie produkty to dowód niezachwianej wiary w jakość własnych wyrobów."},{"title":"3. Eddy+ i Chute® Mag","text":"Opatentowane systemy zamknięć i picia to standard branżowy — intuicyjne, szczelne i trwałe."}]'::jsonb,
  '["KUBKI I BUTELKI"]'::jsonb,
  '💧'
),
(
  'columbia',
  'Columbia',
  '#1a3b5c',
  'Columbia: Outdoor od 1938 roku',
  'Columbia Sportswear to jedna z najstarszych i najbardziej szanowanych marek outdoorowych na świecie. Ich produkty łączą sprawdzone technologie z przystępnością.',
  '[]'::jsonb,
  '["ODZIEŻ","PLECAKI I TORBY"]'::jsonb,
  '🧥'
),
(
  'craft',
  'Craft',
  '#e4002b',
  'Craft: Szwedzka perfekcja sportowa',
  'Craft to szwedzka marka odzieży sportowej, która od 1977 roku tworzy produkty dla najbardziej wymagających sportowców i profesjonalistów.',
  '[]'::jsonb,
  '["ODZIEŻ"]'::jsonb,
  '🏃'
),
(
  'doppler',
  'Doppler',
  '#003366',
  'Doppler: Austriacka tradycja parasolnicza',
  'Doppler to austriacki producent parasoli z ponad 75-letnią tradycją. Ich produkty łączą europejską jakość wykonania z innowacyjnymi rozwiązaniami.',
  '[]'::jsonb,
  '["PARASOLE"]'::jsonb,
  '☂️'
),
(
  'baseus',
  'Baseus',
  '#1a1a1a',
  'Baseus: Elektronika nowej generacji',
  'Baseus to dynamiczna marka elektroniki użytkowej, która szybko zdobyła uznanie dzięki innowacyjnemu designowi i przystępnym cenom przy zachowaniu wysokiej jakości.',
  '[]'::jsonb,
  '["ELEKTRONIKA"]'::jsonb,
  '🔌'
),
(
  'bic',
  'BIC',
  '#ff6600',
  'BIC: Ikona pisania od 1950 roku',
  'BIC to marka, która zrewolucjonizowała rynek artykułów piśmienniczych. Od kultowego Cristal po nowoczesne długopisy 4-kolorowe — BIC łączy niezawodność z przystępnością.',
  '[]'::jsonb,
  '["BIURO I NOTATNIKI"]'::jsonb,
  '🖊️'
),
(
  'victorinox',
  'Victorinox',
  '#d32f2f',
  'Victorinox: Szwajcarska precyzja i wielofunkcyjność',
  'Victorinox, twórca legendarnego Szwajcarskiego Scyzoryka Oficerskiego, od 1884 roku tworzy narzędzia i akcesoria najwyższej jakości. Ich produkty to synonim niezawodności.',
  '[]'::jsonb,
  '["DOM I WYPOCZYNEK"]'::jsonb,
  '🔪'
),
(
  'samsonite',
  'Samsonite',
  '#1a1a1a',
  'Samsonite: Podróżuj z klasą',
  'Samsonite to światowy lider w produkcji bagażu premium. Od 1910 roku marka wyznacza standardy w branży, łącząc innowacyjne materiały z eleganckim designem.',
  '[]'::jsonb,
  '["PLECAKI I TORBY"]'::jsonb,
  '🧳'
);

-- ========== PRODUCTS ==========
-- Najpierw pobieramy brand_id dla Stanley
INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'quencher-h20',
  'Quencher H2.0 FlowState',
  b.id,
  'Stanley',
  'STN-QH20-001',
  'od 189 zł',
  'Kubki i butelki',
  'kubki-i-butelki',
  'Kubki termiczne',
  'kubki-termiczne',
  'Kultowy kubek termiczny Stanley Quencher H2.0 FlowState to kwintesencja nowoczesnego designu i niezawodnej funkcjonalności. Podwójna ścianka z izolacją próżniową utrzymuje napoje zimne do 12 godzin lub gorące do 7 godzin. Ergonomiczna rączka i składana słomka zapewniają wygodę użytkowania.',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Biały","hex":"#ffffff"},{"name":"Granatowy","hex":"#1e3a5f"},{"name":"Zielony","hex":"#2d5a27"},{"name":"Różowy","hex":"#e91e63"},{"name":"Niebieski","hex":"#2196f3"},{"name":"Miętowy","hex":"#4db6ac"}]'::jsonb,
  '["🥤","📦","✨","🔍"]'::jsonb,
  '🥤',
  true,
  'Stal nierdzewna 18/8',
  '95 × 95 × 270 mm',
  '425 g',
  24,
  'G5, N2, U1',
  'Chiny'
FROM brands b WHERE b.slug = 'stanley';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'classic-legendary',
  'Classic Legendary Bottle',
  b.id,
  'Stanley',
  'STN-CLB-002',
  'od 219 zł',
  'Kubki i butelki',
  'kubki-i-butelki',
  'Butelki termiczne',
  'butelki-termiczne',
  'Legendarny termos Stanley Classic to ikona wśród termosów. Podwójna izolacja próżniowa utrzymuje temperaturę napojów przez 24 godziny. Wytrzymała konstrukcja ze stali nierdzewnej 18/8 gwarantuje wieloletnią służbę.',
  '[{"name":"Zielony","hex":"#2d5a27"},{"name":"Czarny","hex":"#1a1a1a"},{"name":"Granatowy","hex":"#1e3a5f"}]'::jsonb,
  '["🍶","📦","✨","🔍"]'::jsonb,
  '🍶',
  true,
  'Stal nierdzewna 18/8',
  '94 × 94 × 355 mm',
  '680 g',
  24,
  'G5, N2',
  'Chiny'
FROM brands b WHERE b.slug = 'stanley';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'iceflow-flip',
  'IceFlow Flip Straw',
  b.id,
  'Stanley',
  'STN-IFS-003',
  'od 159 zł',
  'Kubki i butelki',
  'kubki-i-butelki',
  'Bidony sportowe',
  'bidony-sportowe',
  'Stanley IceFlow Flip Straw to nowoczesna butelka ze słomką, idealna dla aktywnych osób. Innowacyjny system FlowState zapewnia płynne picie bez rozlewania. Utrzymuje napoje zimne do 12 godzin.',
  '[{"name":"Niebieski","hex":"#2196f3"},{"name":"Biały","hex":"#ffffff"},{"name":"Czarny","hex":"#1a1a1a"},{"name":"Miętowy","hex":"#4db6ac"}]'::jsonb,
  '["🥤","📦","✨","🔍"]'::jsonb,
  '🥤',
  true,
  'Stal nierdzewna 18/8, silikon',
  '88 × 88 × 290 mm',
  '390 g',
  24,
  'G5, N2, U1',
  'Chiny'
FROM brands b WHERE b.slug = 'stanley';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'moleskine-classic',
  'Classic Notebook Large',
  b.id,
  'Moleskine',
  'MOL-CNL-001',
  'od 89 zł',
  'Biuro i notatniki',
  'biuro-i-notatniki',
  'Notesy',
  'notesy',
  'Kultowy notatnik Moleskine w formacie Large. Twarda okładka, gumka zamykająca, wstążka zakładka i kieszeń rozszerzana na dokumenty. Papier o gramaturze 70g/m² idealny do pisania i rysowania.',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Granatowy","hex":"#1e3a5f"},{"name":"Czerwony","hex":"#c41e3a"}]'::jsonb,
  '["📓","📔","📒","🔍"]'::jsonb,
  '📓',
  true,
  'Papier FSC, okładka twarda',
  '130 × 210 mm',
  '320 g',
  50,
  'T1, N2, G5',
  'Włochy'
FROM brands b WHERE b.slug = 'moleskine';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'moleskine-softcover',
  'Softcover Notebook XL',
  b.id,
  'Moleskine',
  'MOL-SNX-002',
  'od 109 zł',
  'Biuro i notatniki',
  'biuro-i-notatniki',
  'Notesy',
  'notesy',
  'Notatnik Moleskine z miękką okładką w formacie XL. Elastyczna oprawa pozwala na łatwe przenoszenie. 192 strony w linie, papier acid-free o gramaturze 70g/m².',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Szafirowy","hex":"#0f52ba"}]'::jsonb,
  '["📓","📔","📒","🔍"]'::jsonb,
  '📓',
  true,
  'Papier FSC, okładka miękka',
  '190 × 250 mm',
  '380 g',
  50,
  'T1, N2',
  'Włochy'
FROM brands b WHERE b.slug = 'moleskine';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'northface-thermoball',
  'ThermoBall Eco Jacket',
  b.id,
  'The North Face',
  'TNF-TBE-001',
  'od 599 zł',
  'Odzież',
  'odziez',
  'Kurtki',
  'kurtki',
  'Lekka kurtka ocieplana z materiałów z recyklingu. Technologia ThermoBall™ Eco zapewnia ciepło nawet w wilgotnych warunkach. Składa się do własnej kieszeni, idealna na podróże.',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Granatowy","hex":"#1e3a5f"},{"name":"Oliwkowy","hex":"#556b2f"}]'::jsonb,
  '["🧥","👕","🏷️","🔍"]'::jsonb,
  '🧥',
  true,
  '100% poliester z recyklingu',
  'Rozmiary: S–3XL',
  '450 g (rozmiar M)',
  10,
  'H1, D1, N2',
  'Wietnam'
FROM brands b WHERE b.slug = 'the-north-face';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'northface-borealis',
  'Borealis Backpack',
  b.id,
  'The North Face',
  'TNF-BOR-002',
  'od 449 zł',
  'Plecaki i torby',
  'plecaki-i-torby',
  'Plecaki',
  'plecaki',
  'Kultowy plecak miejski z kieszenią na laptopa 15". System FlexVent™ zapewnia komfort noszenia przez cały dzień. Pojemność 28 litrów, wodoodporny materiał.',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Granatowy","hex":"#1e3a5f"}]'::jsonb,
  '["🎒","💼","👜","🔍"]'::jsonb,
  '🎒',
  true,
  'Nylon 600D, poliester',
  '340 × 490 × 220 mm',
  '1250 g',
  10,
  'H1, T1, N2',
  'Wietnam'
FROM brands b WHERE b.slug = 'the-north-face';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'rituals-candle',
  'The Ritual of Karma Candle',
  b.id,
  'Rituals',
  'RIT-KAR-001',
  'od 139 zł',
  'Dom i wypoczynek',
  'dom-i-wypoczynek',
  'Świece',
  'swiece',
  'Luksusowa świeca zapachowa o orientalnym zapachu. Nuty białej herbaty i kwiatu lotosu tworzą relaksującą atmosferę. Czas palenia do 50 godzin.',
  '[{"name":"Biały","hex":"#ffffff"}]'::jsonb,
  '["🕯️","✨","🔥","🔍"]'::jsonb,
  '🕯️',
  true,
  'Wosk sojowy, szklany pojemnik',
  'Ø 85 × 105 mm',
  '290 g',
  25,
  'N2, U1',
  'Holandia'
FROM brands b WHERE b.slug = 'rituals';

INSERT INTO products (slug, name, brand_id, brand_name, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, material, dimensions, weight, moq, marking, origin)
SELECT
  'thule-subterra',
  'Subterra 2 Carry-On',
  b.id,
  'Thule',
  'THL-SUB-001',
  'od 899 zł',
  'Plecaki i torby',
  'plecaki-i-torby',
  'Walizki',
  'walizki',
  'Walizka kabinowa z twardą skorupą i systemem organizacji. Wymiary zgodne z wymaganiami linii lotniczych. Kółka 360° i teleskopowa rączka zapewniają łatwość manewrowania.',
  '[{"name":"Czarny","hex":"#1a1a1a"},{"name":"Oliwkowy","hex":"#556b2f"}]'::jsonb,
  '["🧳","💼","👜","🔍"]'::jsonb,
  '🧳',
  true,
  'Poliwęglan, nylon',
  '350 × 550 × 230 mm',
  '3200 g',
  5,
  'T1, G5',
  'Chiny'
FROM brands b WHERE b.slug = 'thule';

-- ========== ARTICLES ==========
INSERT INTO articles (slug, title, excerpt, category) VALUES
('welcome-pack-dla-nowych-pracownikow', 'Welcome Pack dla nowych pracowników', 'Jak stworzyć niezapomniany pierwszy dzień w firmie? Poznaj sprawdzone zestawy powitalne.', 'Onboarding'),
('upominki-na-konferencje', 'Upominki na konferencje i targi', 'Wyróżnij się na wydarzeniach branżowych z produktami, które zapamiętają uczestnicy.', 'Eventy'),
('prezenty-swiateczne-dla-klientow', 'Prezenty świąteczne dla klientów', 'Eleganckie zestawy upominkowe, które wzmocnią relacje biznesowe.', 'Świąteczne'),
('budowanie-marki-pracodawcy', 'Budowanie marki pracodawcy przez gadżety', 'Jak premium upominki wpływają na postrzeganie firmy przez kandydatów.', 'Employer Branding'),
('ekologiczne-upominki-firmowe', 'Ekologiczne upominki firmowe', 'Zrównoważone produkty, które pokazują wartości Twojej firmy.', 'Eko'),
('zestawy-na-workation', 'Zestawy na workation i offsites', 'Praktyczne produkty dla zespołów pracujących zdalnie i hybrydowo.', 'Eventy');

-- ========== CATEGORIES ==========
INSERT INTO categories (slug, name, title, description, gradient, subcategories) VALUES
('odziez', 'ODZIEŻ', 'Odzież', 'Odkryj naszą kolekcję odzieży premium do personalizacji', 'from-slate-800 via-slate-700 to-slate-600',
 '[{"name":"T-shirty","slug":"t-shirty","emoji":"👕"},{"name":"Polo","slug":"polo","emoji":"👔"},{"name":"Koszule","slug":"koszule","emoji":"🎽"},{"name":"Bluzy","slug":"bluzy","emoji":"🧥"},{"name":"Hoodies","slug":"hoodies","emoji":"🪭"},{"name":"Polary","slug":"polary","emoji":"🧶"},{"name":"Bezrękawniki","slug":"bezrekawniki","emoji":"🦺"},{"name":"Kurtki","slug":"kurtki","emoji":"🧥"}]'::jsonb),
('kubki-i-butelki', 'KUBKI I BUTELKI', 'Kubki i Butelki', 'Bidony, termosy i kubki termiczne najwyższej jakości', 'from-cyan-600 via-cyan-500 to-teal-400',
 '[{"name":"Kubki termiczne","slug":"kubki-termiczne","emoji":"☕"},{"name":"Butelki termiczne","slug":"butelki-termiczne","emoji":"🫖"},{"name":"Bidony sportowe","slug":"bidony-sportowe","emoji":"🍶"},{"name":"Kubki ceramiczne","slug":"kubki-ceramiczne","emoji":"🍵"},{"name":"Termosy","slug":"termosy","emoji":"🧴"}]'::jsonb),
('elektronika', 'ELEKTRONIKA', 'Elektronika', 'Nowoczesne gadżety elektroniczne z Twoim logo', 'from-violet-600 via-purple-500 to-indigo-500',
 '[{"name":"Powerbanki","slug":"powerbanki","emoji":"🔋"},{"name":"Głośniki","slug":"glosniki","emoji":"🔊"},{"name":"Słuchawki","slug":"sluchawki","emoji":"🎧"},{"name":"Kable","slug":"kable","emoji":"🔌"},{"name":"Ładowarki","slug":"ladowarki","emoji":"⚡"},{"name":"Kamery","slug":"kamery","emoji":"📷"},{"name":"Drony","slug":"drony","emoji":"🚁"},{"name":"Adaptery","slug":"adaptery","emoji":"🔗"}]'::jsonb),
('biuro-i-notatniki', 'BIURO I NOTATNIKI', 'Biuro i Notatniki', 'Eleganckie akcesoria biurowe dla profesjonalistów', 'from-amber-700 via-amber-600 to-yellow-500',
 '[{"name":"Notesy","slug":"notesy","emoji":"📓"},{"name":"Długopisy metalowe","slug":"dlugopisy-metalowe","emoji":"🖊️"},{"name":"Pióra","slug":"piora","emoji":"✒️"},{"name":"Długopisy plastikowe","slug":"dlugopisy-plastikowe","emoji":"🖋️"}]'::jsonb),
('plecaki-i-torby', 'PLECAKI I TORBY', 'Plecaki i Torby', 'Torby i akcesoria podróżne na każdą okazję', 'from-emerald-700 via-emerald-600 to-green-500',
 '[{"name":"Plecaki","slug":"plecaki","emoji":"🎒"},{"name":"Torby podróżne i sportowe","slug":"torby-podrozne-i-sportowe","emoji":"👜"},{"name":"Torby i plecaki termiczne","slug":"torby-i-plecaki-termiczne","emoji":"🧊"},{"name":"Walizki","slug":"walizki","emoji":"🧳"},{"name":"Koce piknikowe","slug":"koce-piknikowe","emoji":"🧺"},{"name":"Etui i saszetki","slug":"etui-i-saszetki","emoji":"👝"}]'::jsonb),
('dom-i-wypoczynek', 'DOM I WYPOCZYNEK', 'Dom i Wypoczynek', 'Produkty do domu i relaksu dla Twoich klientów', 'from-rose-600 via-pink-500 to-rose-400',
 '[{"name":"Świece","slug":"swiece","emoji":"🕯️"},{"name":"Dyfuzory","slug":"dyfuzory","emoji":"🌸"},{"name":"Koce domowe","slug":"koce-domowe","emoji":"🛋️"},{"name":"Akcesoria kuchenne","slug":"akcesoria-kuchenne","emoji":"🍳"},{"name":"Zestawy pielęgnacyjne","slug":"zestawy-pielegnacyjne","emoji":"🧴"}]'::jsonb),
('parasole', 'PARASOLE', 'Parasole', 'Parasole premium do personalizacji', 'from-slate-600 via-slate-500 to-gray-400',
 '[{"name":"Parasole krótkie","slug":"parasole-krotkie","emoji":"☂️"},{"name":"Parasole długie","slug":"parasole-dlugie","emoji":"🌂"}]'::jsonb);
