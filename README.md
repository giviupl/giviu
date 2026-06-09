# Giviu — platforma B2B do premium giftingu korporacyjnego

> Platforma B2B premium giftingu w modelu request for price. Klient przegląda katalog, dodaje produkty do koszyka, wysyła zapytanie. Handlowiec wycenia indywidualnie w panelu CRM uwzględniając ilości, znakowanie i marżę negocjacyjną.

[Live Demo](https://giviu.vercel.app/) · [GitHub](https://github.com/giviupl/giviu)

---

## Idea projektu

Giviu działa w modelu **request for price**, nie typowego e-commerce. W premium B2B giftingu finalna cena zależy od ilości, znakowania logo, terminu realizacji i negocjacji — sztywne ceny w sklepie online nie mają sensu. Klient buduje koszyk z interesujących produktów, wysyła zapytanie z wymaganiami, handlowiec dostaje powiadomienie i przygotowuje indywidualną ofertę w panelu administracyjnym.

Projekt obejmuje cały stack potrzebny do prowadzenia takiego biznesu: publiczny katalog dla klientów, formularz zapytań ofertowych, asystent AI pomagający w doborze produktów, oraz pełny panel CRM dla handlowca (klienci, oferty, zamówienia, dostawcy, kalkulator marż).

Tło: bazuje na 15 latach mojego doświadczenia w sprzedaży premium gifting B2B (Thule, Stanley, Victorinox, Moleskine, Rains). To produkt który chciałbym sam używać jako handlowiec — automatyzuje 80% rutyny żeby zostawić czas na to co naprawdę liczy się w sprzedaży premium: relacje i doradztwo.

---

## Funkcjonalności

### Publiczny katalog
Strona dla klienta B2B przeszukującego ofertę. Strony produktów z galerią, wariantami kolorystycznymi i lightboxem. Filtry po brandach i kategoriach (FilterPanel). Brand carousel z logo. Pełne SEO (JSON-LD schema, og:image, metadata). Dostępność (ARIA, nawigacja klawiaturą, skip-to-content). Lighthouse 89-100 desktop.

### Koszyk ofertowy (request for price)
Zamiast "kup teraz" — klient dodaje produkty do koszyka, podaje ilości i wymagania (znakowanie, termin, dodatkowe informacje), wysyła zapytanie do handlowca. Po stronie biznesowej: zapytanie ląduje w CRM, handlowiec dostaje powiadomienie, przygotowuje indywidualną wycenę.

### Asystent AI
Chat asystent przy stronie pomagający klientowi w doborze produktów do okazji (Boże Narodzenie, jubileusz firmy, welcome pack). Zbudowany na Claude Sonnet 4.6 z tool use (wyszukiwanie produktów, dodawanie do koszyka, podsumowanie zapytania) i streamingiem SSE. Knowledge base z kontekstem o markach i okazjach giftingowych.

### Admin CRM (panel handlowca w budowie)
Pełny system zarządzania sprzedażą za autoryzacją hasłem:

- **Klienci** — pełne profile, multi-contact (osoby kontaktowe per klient), NIP jako klucz unikalny
- **Zapytania** — co klient zamówił, w jakich ilościach, z jakimi wariantami cenowymi
- **Oferty** — generator ofert z kalkulatorem marż: cena zakupu + koszty dodatkowe + transport / ilość × marża%, VAT per linia (default 23%), automatyczne kolumny brutto, auto-save z debounce 1s
- **Zamówienia** — 4 statusy (nowe, w produkcji, zrealizowane, anulowane), automatyczne `delivered_at` przy ukończeniu
- **Aktywności, zadania, notatki** — wszystko co handlowiec musi pamiętać per klient
- **Dostawcy** — zarządzanie portfolio dostawców i marek

### Konwersja oferty → zamówienie
Po akceptacji oferty przez klienta, jednym kliknięciem oferta zamienia się w zamówienie. Snapshoty produktów i klienta są utrwalane w momencie konwersji — żeby PDF wygenerowany za 6 miesięcy pokazywał ofertę dokładnie taką jaka była zaakceptowana, niezależnie od późniejszych zmian w katalogu.

---

## Stack i architektura

| Warstwa | Technologia | Dlaczego |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 + CSS Modules | App Router od początku, Server Components dla bazy danych, Server Actions dla formularzy. Po refactorze do CSS Modules zmniejszyłem `globals.css` z 8708 do 2135 linii (-75%) |
| State (client) | Zustand | Globalny koszyk i UI state, prostszy od Reduxa, mniej boilerplate niż Context API |
| Baza danych | Supabase (PostgreSQL) | Service role key + Row Level Security, REST API, pgvector dostępny gdy dojdzie do embeddings |
| AI Assistant | Claude Sonnet 4.6 (Anthropic API) | Tool use dla strukturalnych akcji (wyszukiwanie produktów, dodawanie do koszyka), prompt caching ~5x redukcja kosztów, SSE streaming dla UX |
| Rate limiting | Upstash Redis | Three-tier limiting (per IP, per session, global cap) — chroni przed abuse asystenta AI |
| Email | Resend | Powiadomienia o zapytaniach ofertowych do handlowca |
| Hosting | Vercel | Edge functions, auto-deploy z GitHuba, generowanie PDF |

### Architektura katalogu produktów

Multi-supplier ready od początku — adapter pattern przygotowuje grunt pod integracje z dostawcami. Read-only display na MVP, potem write-back dla automatycznej synchronizacji.

### Design system

Custom paleta beżowo-granatowa (primary `#4f67b1`, background `#f5f3ee`, text `#595d66`). Sinistra serif logo jako SVG. Rubik dla UI. Wszystkie komponenty trzymają się design tokens — łatwo zmienić motyw bez chirurgii w CSS.

---

*Projekt zbudowany z asystą Claude Sonnet 4.6 jako AI pair programmer — ja jako product owner i wizja, AI jako wsparcie kodowe. Demonstracja workflow AI-assisted development dla osób które rozumieją biznes lepiej niż syntax JavaScript.*
