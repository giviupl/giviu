// src/app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabaseServer } from '@/lib/supabase-server';
import { CHAT_CONTEXT, CHAT_CONTEXT_SLUGS } from '@/data/chat-context';

export const runtime = 'nodejs';
export const maxDuration = 60;

// SDK Anthropic ma wbudowany retry dla overloaded_error / 529 / connection_error.
// Domyślnie 2 próby, zwiększamy do 4 (1s -> 2s -> 4s -> 8s exponential backoff).
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxRetries: 4,
});

// ====================================================================
// RATE LIMITING (Upstash Redis)
// ====================================================================
const redis = Redis.fromEnv();

const ratelimitMinute = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'giviu:rl:min',
  analytics: true,
});

const ratelimitHour = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 h'),
  prefix: 'giviu:rl:hour',
  analytics: true,
});

const ratelimitDay = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '24 h'),
  prefix: 'giviu:rl:day',
  analytics: true,
});

// ====================================================================
// WALIDACJA LIMITY
// ====================================================================
const MAX_MESSAGES_PER_REQUEST = 30;
const MAX_MESSAGE_CHAR_LENGTH = 2000;
const MAX_QUOTE_ITEMS = 100;
const MAX_TOTAL_CONTENT_BYTES = 50_000;

// ====================================================================
// CLOUDFLARE TURNSTILE
// ====================================================================
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  // Dev fallback — gdy nie ma secret key, pomijamy weryfikację (lokalnie)
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ====================================================================
// HELPER: JSON error response
// ====================================================================
function jsonError(message: string, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  });
}

// ====================================================================
// HELPER: rozpoznawanie overloaded error
// ====================================================================
function isOverloadedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; message?: string; error?: { error?: { type?: string } } };
  if (e.status === 529) return true;
  if (e.error?.error?.type === 'overloaded_error') return true;
  if (typeof e.message === 'string' && /overload/i.test(e.message)) return true;
  return false;
}

// ====================================================================
// HELPER: dev-only logging
// ====================================================================
const isDev = process.env.NODE_ENV === 'development';
function devLog(...args: unknown[]) {
  if (isDev) console.log(...args);
}

// ====================================================================
// QUOTE ITEM TYPE (zgodny z src/stores/quoteStore.ts)
// ====================================================================
interface QuoteItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  slug: string;
  emoji?: string;
  colorIndex?: number;
  colorName?: string;
  colorHex?: string;
  colorImage?: string;
}

// ====================================================================
// SYSTEM PROMPT
// ====================================================================
const BASE_SYSTEM_PROMPT = `Jesteś doświadczonym doradcą ds. upominków firmowych w Giviu — premium B2B platformie. Pomagasz HR i Marketing Managerom dobrać prezenty dla pracowników, klientów lub partnerów. Mówisz po polsku, profesjonalnie ale ciepło, bez korporacyjnej nowomowy.

JAK DZIAŁA ZAPYTANIE:
Klient kompletuje zapytanie (wishlistę produktów). Zespół Giviu po otrzymaniu zapytania odsyła pełną OFERTĘ z cenami, MOQ i wizualizacjami personalizacji. Mówisz "dodaję do zapytania", "Twoje zapytanie", "wyślij zapytanie do zespołu" — NIE "wycena" (wycenę robi zespół, nie klient). Nie pytasz o ilości (ustala zespół) — pytasz o okazję, budżet/szt, preferencje.

STYL:
Zwięźle, rzeczowo. Bez emoji, bez "Świetnie!"/"Super!"/"Idealnie!" na początku. Nagłówków używaj rzadko. Pojedynczą propozycję opisz prozą.

OFERTA:
Aktywne marki: BIC, CamelBak, Cutter & Buck, Doppler, Harvest & Frost, Herschel, ID Identity, James Harvest, Knirps, LARQ, Moleskine, Parker, Rituals, Sagaform, SCX Design, Stanley, Tenson, Thule, Waterman, Xtorm. Czas realizacji ~2-4 tyg z personalizacją. MOQ zazwyczaj od 50 szt (niektóre marki od 24) — dokładnie w wynikach search_products.

TRYBY ROZMOWY:

EKSPLORACJA ("co masz", "co nowego", "pokaż X", "kurtki", "powerbanki") → od razu search_products i pokaż wyniki. Pytania doprecyzowujące dopiero PO pokazaniu.
- "co nowego" bez kategorii → only_new: true, max_results: 12, BEZ query
- "co masz od [marki]" → brand_slug

DORADCZY ("potrzebuję prezentu na X", "szukam dla Y") → najpierw dopytaj o okazję/budżet/preferencje, potem szukaj.

NIGDY nie wymyślaj produktów ani cen — zawsze search_products.

WYSZUKIWANIE:

1. Używaj subcategory_slug gdy tylko możesz (najprecyzyjniejszy). Lista slugów na końcu prompta — używaj WYŁĄCZNIE z tej listy, nie zgaduj.

2. Gdy slug nie pasuje 1:1, użyj query z synonimami POLSKI + ANGIELSKI (nazwy w bazie często po EN). Reguła ogólna: kubek → "kubek mug tumbler", kurtka → "kurtka jacket", torba → "torba bag backpack", notes → "notes notebook journal", parasol → "parasol umbrella", powerbank → "powerbank power bank", słuchawki → "słuchawki headphones earbuds", polo/koszulka → "polo t-shirt tee", polar → "polar fleece", długopis → "długopis pen", świeca → "świeca candle". Stosuj tę zasadę uniwersalnie.

3. Jeśli pierwsze wyszukiwanie zwraca 0-2 wyniki — bez tłumaczenia, wykonaj drugie z innymi słowami.

4. Po 2-3 nieudanych próbach (0 wyników): NIE wymyślaj wymówek typu "baza ma chwilowy problem", "katalog nie odpowiada" — to NIEPRAWDA. Powiedz wprost: "W naszej aktualnej ofercie nie mam jeszcze produktów tego typu" + zaproponuj alternatywę z dostępnych kategorii. Nie wymieniaj marek których PRODUKTÓW search_products nie zwrócił — to halucynacja.

5. Pole "new_to_user" w odpowiedzi to liczba produktów nowych dla klienta (nie pokazanych wcześniej w tej rozmowie). Gdy =0, wszystkie wyniki to powtórki — NIE komentuj "oto kolejne propozycje", spróbuj innego filtra albo wprost powiedz że to wszystko. Gdy 0 < new_to_user < count, mów tylko o nowych.

NARZĘDZIA SPECJALNE:

- Klient mówi "dodaj to" / "weź ten" → add_to_quote (color_index gdy klient wskazał kolor).
- Klient pyta "co mam w zapytaniu/wycenie" → get_quote.
- Klient pyta o markę ("opowiedz o Stanleyu", "co wyróżnia Moleskine?") → get_brand_info. Parafrazuj w 3-5 zdaniach.
- Klient pyta o COKOLWIEK NIE ZWIĄZANEGO Z PRODUKTEM (proces zamówienia, metody znakowania/personalizacji, ekologia/certyfikaty, FAQ, o firmie, kto może zamówić, jak długo trwa realizacja itp.) → get_page_content z odpowiednim slug. Lista dostępnych slugów na końcu prompta. Po otrzymaniu treści odpowiedz własnymi słowami, krótko, NIE kopiuj 1:1.

PROACTIVE SELLING — DELIKATNIE:

NIGDY nie zaczynaj odpowiedzi od "Może dodam X?" ani "A może też weźmiesz Y?". Po search_products zakończ jedno- zdaniowym otwartym pytaniem: "Który Cię interesuje?". Po dodaniu 2-3 produktów wspomnij JEDEN raz: "Masz już N propozycji — chcesz żebym podsumował, czy szukamy więcej?". Nie naciskaj klienta który mówi "zastanowię się".

KONIEC ROZMOWY:

Gdy klient sygnalizuje koniec ("to wystarczy", "wysyłam zapytanie", "dziękuję", "przejdę do wyceny") I MA co najmniej 1 produkt w zapytaniu → wywołaj prompt_go_to_quote. Po wywołaniu max 1-2 zdania potwierdzające. Jeśli zapytanie puste — odpowiedz tekstem, nie wywołuj narzędzia.

CZEGO NIE ROBISZ:
Cen z głowy (tylko z search_products). Ilości (ustala zespół). Konkretnych terminów / gwarancji. Marek spoza listy. Off-topic. Nie powtarzaj wiadomości powitalnej.

WIEDZA OGÓLNA:
Na pytania edukacyjne/ogólne ("czym jest DTF?", "różnica między haftem a sitodrukiem?", "czy grawer trzyma się na aluminium?") MOŻESZ odpowiadać z wiedzy ogólnej — nie musisz wołać narzędzia. Narzędzia (search_products, get_page_content, get_brand_info) używasz gdy odpowiedź wymaga danych SPECYFICZNYCH dla Giviu (ceny, dostępność, MOQ, konkretne produkty, treści ze strony). Na pytania mieszane (np. "czy robicie DTF?") — najpierw get_page_content('znakowanie') żeby sprawdzić co Giviu oferuje, potem możesz uzupełnić wiedzą ogólną.`;

// ====================================================================
// CATEGORIES CACHE (do wstrzykiwania do system prompt)
// ====================================================================
let categoriesCache: { text: string; loadedAt: number } | null = null;
const CATEGORIES_TTL_MS = 5 * 60 * 1000;

// ====================================================================
// CONTENT PAGES INDEX (statycznie z importu chat-context.ts)
// ====================================================================
const contentPagesIndexText = CHAT_CONTEXT_SLUGS
  .map((p) => `- "${p.slug}" — ${p.title} (${p.summary})`)
  .join('\n');

async function loadCategoriesText(): Promise<string> {
  if (categoriesCache && Date.now() - categoriesCache.loadedAt < CATEGORIES_TTL_MS) {
    return categoriesCache.text;
  }

  const { data, error } = await supabaseServer
    .from('products')
    .select('category, category_slug, subcategory, subcategory_slug')
    .eq('active', true);

  if (error || !data) return '';

  const map = new Map<string, { name: string; subs: Map<string, string> }>();

  for (const row of data) {
    if (!row.category_slug) continue;
    if (!map.has(row.category_slug)) {
      map.set(row.category_slug, {
        name: row.category ?? row.category_slug,
        subs: new Map(),
      });
    }
    if (row.subcategory_slug) {
      map.get(row.category_slug)!.subs.set(
        row.subcategory_slug,
        row.subcategory ?? row.subcategory_slug
      );
    }
  }

  const lines: string[] = [];
  for (const [catSlug, cat] of map.entries()) {
    if (cat.subs.size > 0) {
      const subs = Array.from(cat.subs.entries())
        .map(([s, n]) => `  - ${n} -> subcategory_slug: "${s}"`)
        .join('\n');
      lines.push(`${cat.name} -> category_slug: "${catSlug}"\n${subs}`);
    } else {
      lines.push(`${cat.name} -> category_slug: "${catSlug}"`);
    }
  }

  const text = lines.join('\n\n');
  categoriesCache = { text, loadedAt: Date.now() };
  return text;
}

// ====================================================================
// TOOL DEFINITIONS
// ====================================================================
const TOOLS: Tool[] = [
  {
    name: 'search_products',
    description:
      'Wyszukuje produkty w bazie Giviu. Używaj zawsze gdy chcesz pokazać konkretne propozycje. Zwraca maks. 12 produktów.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Słowa kluczowe w nazwie i opisie. Stosuj synonimy polski+angielski. Pomiń gdy filtrujesz tylko po marce/kategorii/podkategorii lub only_new.',
        },
        category_slug: {
          type: 'string',
          description: 'Slug głównej kategorii — TYLKO z listy w system prompt.',
        },
        subcategory_slug: {
          type: 'string',
          description:
            'Slug podkategorii (najprecyzyjniejszy filtr) — TYLKO z listy w system prompt. Gdy klient pyta o konkretny typ produktu, zacznij od subcategory_slug.',
        },
        brand_slug: {
          type: 'string',
          description:
            'Slug marki — np. "stanley", "moleskine", "parker", "thule", "rituals", "cutterandbuck", "harvestfrost", "jamesharvest".',
        },
        only_new: {
          type: 'boolean',
          description: 'Filtruj tylko nowości (is_new = true).',
        },
        max_results: {
          type: 'number',
          description: 'Maks. liczba wyników (1-12). Domyślnie 6, dla "co nowego" używaj 12.',
        },
      },
      required: [],
    },
  },
  {
    name: 'add_to_quote',
    description:
      'Dodaje produkt do zapytania klienta (wishlist). Wymaga product_id z search_products. color_index opcjonalny.',
    input_schema: {
      type: 'object',
      properties: {
        product_id: {
          type: 'string',
          description: 'UUID produktu z pola "id" w search_products.',
        },
        color_index: {
          type: 'number',
          description: 'Opcjonalny index koloru z listy "colors" produktu (0-indexed).',
        },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'get_quote',
    description: 'Pobiera aktualną zawartość zapytania klienta.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_brand_info',
    description:
      'Pobiera szczegółowe informacje o marce z bazy Giviu (opis "dlaczego ta marka jako prezent firmowy"). Używaj gdy klient pyta o konkretną markę albo prosi o porównanie marek.',
    input_schema: {
      type: 'object',
      properties: {
        brand_slug: {
          type: 'string',
          description:
            'Slug marki — np. "stanley", "moleskine", "thule", "rituals". Używaj tylko slugów z listy aktywnych marek.',
        },
      },
      required: ['brand_slug'],
    },
  },
  {
    name: 'get_page_content',
    description:
      'Pobiera treść statycznej strony Giviu (np. metody znakowania/personalizacji, proces zamówienia, ekologia, FAQ, o firmie). Wywołuj GDY klient pyta o cokolwiek czego nie ma w danych produktu — np. "jak działacie", "czy robicie DTF", "czym jest grawer", "jakie macie certyfikaty", "ile trwa realizacja", "czy mogę zamówić jako osoba prywatna". Lista dostępnych slugów jest na końcu system prompta. Po otrzymaniu treści odpowiedz własnymi słowami w 3-6 zdaniach, nie kopiuj 1:1.',
    input_schema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description:
            'Slug strony — TYLKO z listy dostępnych slugów na końcu system prompta. Nie zgaduj.',
        },
      },
      required: ['slug'],
    },
  },
  {
    name: 'prompt_go_to_quote',
    description:
      'Wyświetla klientowi kartę z przyciskiem "Przejdź do zapytania" w czacie. Wywołuj TYLKO gdy klient sygnalizuje koniec rozmowy ("to wystarczy", "wysyłam zapytanie", "dziękuję") I MA co najmniej 1 produkt w zapytaniu. Nigdy nie wywołuj proaktywnie ani gdy zapytanie jest puste.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

// ====================================================================
// TOOL EXECUTORS
// ====================================================================
interface RawColor {
  name?: string;
  hex?: string;
  images?: string[];
}

interface FullProduct {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  price: string;
  image_url: string | null;
  category: string | null;
  moq: number | null;
  marking: string | null;
  emoji: string | null;
  views: string[];
  colors: { name: string; hex: string; images: string[] }[];
  description: string;
}

async function executeSearchProducts(input: {
  query?: string;
  category_slug?: string;
  subcategory_slug?: string;
  brand_slug?: string;
  only_new?: boolean;
  max_results?: number;
}): Promise<{ products: FullProduct[]; count: number; error?: string }> {
  devLog('[search_products] input:', JSON.stringify(input));
  const limit = Math.min(Math.max(input.max_results ?? 6, 1), 12);

  let q = supabaseServer
    .from('products')
    .select(
      'id, slug, name, brand_name, brand_id, code, price, category, category_slug, subcategory, subcategory_slug, description, image_url, moq, marking, colors, views, emoji'
    )
    .eq('active', true)
    .limit(limit);

  if (input.brand_slug) {
    const { data: brand } = await supabaseServer
      .from('brands')
      .select('id')
      .eq('slug', input.brand_slug)
      .maybeSingle();
    if (brand?.id) q = q.eq('brand_id', brand.id);
  }

  if (input.only_new) q = q.eq('is_new', true);

  if (input.subcategory_slug) {
    q = q.eq('subcategory_slug', input.subcategory_slug);
  } else if (input.category_slug) {
    q = q.eq('category_slug', input.category_slug);
  }

  if (input.query && input.query.trim().length > 0) {
    // FIX: rozbijamy query na słowa i każde szukamy osobno OR-em.
    // Bez tego "kubek tumbler mug" szukałoby DOSŁOWNIE frazy "kubek tumbler mug",
    // a nie produktów zawierających którekolwiek z tych słów.
    const safe = input.query.replace(/[%,()]/g, ' ').trim();
    const tokens = safe
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .slice(0, 8); // max 8 słów żeby nie generować ogromnych OR-ów

    if (tokens.length > 0) {
      const orParts = tokens.flatMap((t) => [
        `name.ilike.%${t}%`,
        `description.ilike.%${t}%`,
      ]);
      q = q.or(orParts.join(','));
    }
  }

  const { data, error } = await q;

  if (error) return { error: error.message, products: [], count: 0 };

  const products: FullProduct[] = (data ?? []).map((p) => {
    const rawColors = Array.isArray(p.colors) ? (p.colors as RawColor[]) : [];
    const colors = rawColors.map((c) => ({
      name: c?.name ?? '',
      hex: c?.hex ?? '',
      images: Array.isArray(c?.images) ? c.images : [],
    }));
    const views = Array.isArray(p.views) ? (p.views as string[]) : [];

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand_name: p.brand_name,
      price: p.price,
      image_url: p.image_url,
      category: p.category,
      moq: p.moq,
      marking: p.marking,
      emoji: p.emoji,
      views,
      colors,
      description: typeof p.description === 'string' ? p.description : '',
    };
  });

  devLog('[search_products] result count:', products.length);
  return { products, count: products.length };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function executeAddToQuote(input: { product_id: string; color_index?: number }) {
  if (!input.product_id || !UUID_RE.test(input.product_id)) {
    return { success: false as const, error: 'Nieprawidłowy identyfikator produktu.' };
  }

  const { data, error } = await supabaseServer
    .from('products')
    .select('id, slug, name, brand_name, price, image_url, emoji, colors')
    .eq('id', input.product_id)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    return { success: false as const, error: 'Produkt nie został znaleziony.' };
  }

  let colorVariant: {
    index: number;
    name: string;
    hex: string;
    image: string | null;
  } | null = null;

  if (typeof input.color_index === 'number') {
    const rawColors = Array.isArray(data.colors) ? (data.colors as RawColor[]) : [];
    const c = rawColors[input.color_index];
    if (c) {
      colorVariant = {
        index: input.color_index,
        name: c.name ?? '',
        hex: c.hex ?? '',
        image: Array.isArray(c.images) && c.images.length > 0 ? c.images[0] : null,
      };
    }
  }

  return {
    success: true as const,
    product: {
      id: data.id,
      slug: data.slug,
      name: data.name,
      brand_name: data.brand_name,
      price: data.price,
      image_url: data.image_url,
      emoji: data.emoji,
    },
    color: colorVariant,
  };
}

function executeGetQuote(currentQuote: QuoteItem[]) {
  if (!currentQuote || currentQuote.length === 0) {
    return { items: [], distinct_products: 0, empty: true };
  }
  return {
    items: currentQuote.map((i) => ({
      product_id: i.id,
      name: i.name,
      brand_name: i.brand,
      price: i.price,
      color_name: i.colorName ?? null,
    })),
    distinct_products: currentQuote.length,
    empty: false,
  };
}

function executeGetPageContent(input: { slug: string }) {
  const slug = (input.slug ?? '').trim().toLowerCase();
  if (!slug) return { success: false as const, error: 'Brak slug.' };

  const page = CHAT_CONTEXT[slug];
  if (!page) {
    const available = CHAT_CONTEXT_SLUGS.map((p) => p.slug).join(', ');
    return {
      success: false as const,
      error: `Strona "${slug}" nie znaleziona. Dostępne slugi: ${available}`,
    };
  }

  return {
    success: true as const,
    page: {
      slug,
      title: page.title,
      content: page.content,
    },
  };
}

async function executeGetBrandInfo(input: { brand_slug: string }) {
  const slug = (input.brand_slug ?? '').trim().toLowerCase();
  if (!slug) return { success: false as const, error: 'Brak brand_slug.' };

  const { data, error } = await supabaseServer
    .from('brands')
    .select('slug, name, gift_description')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return { success: false as const, error: `Marka "${slug}" nie znaleziona.` };
  }

  return {
    success: true as const,
    brand: {
      slug: data.slug,
      name: data.name,
      gift_description: data.gift_description ?? null,
    },
  };
}

// ====================================================================
// POST HANDLER
// ====================================================================
export async function POST(req: Request) {
  // ----- 1. IP detection -----
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous';

  // ----- 2. Rate limiting (3 poziomy) -----
  try {
    const [m, h, d] = await Promise.all([
      ratelimitMinute.limit(ip),
      ratelimitHour.limit(ip),
      ratelimitDay.limit(ip),
    ]);

    if (!m.success) {
      return jsonError('Za szybko. Poczekaj chwilę i spróbuj ponownie.', 429, {
        'Retry-After': '60',
      });
    }
    if (!h.success || !d.success) {
      return jsonError(
        'Przekroczono dzienny limit zapytań. Wróć jutro lub skontaktuj się z naszym zespołem bezpośrednio.',
        429
      );
    }
  } catch (e) {
    // Redis padł — fail open (logujemy, ale przepuszczamy ruch). 
    // Anthropic spend cap zapewnia ostateczny limit.
    console.error('[ratelimit] Redis error:', e);
  }

  // ----- 3. Turnstile verification -----
  const turnstileToken = req.headers.get('x-turnstile-token') ?? '';
  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return jsonError(
      'Weryfikacja nieudana. Odśwież stronę i spróbuj ponownie.',
      401
    );
  }

  // ----- 4. Body parsing -----
  let body: { messages?: MessageParam[]; currentQuote?: QuoteItem[] };
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const messages = body.messages;
  const currentQuote = body.currentQuote ?? [];

  // ----- 5. Walidacja -----
  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError('Missing messages', 400);
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return jsonError('Rozmowa zbyt długa. Zacznij nową.', 400);
  }
  for (const m of messages) {
    if (typeof m.content === 'string') {
      if (m.content.length > MAX_MESSAGE_CHAR_LENGTH) {
        return jsonError('Wiadomość za długa (max 2000 znaków).', 400);
      }
    } else if (Array.isArray(m.content)) {
      const totalLen = JSON.stringify(m.content).length;
      if (totalLen > MAX_TOTAL_CONTENT_BYTES) {
        return jsonError('Treść wiadomości zbyt duża.', 400);
      }
    }
  }
  if (Array.isArray(currentQuote) && currentQuote.length > MAX_QUOTE_ITEMS) {
    return jsonError('Zapytanie zbyt duże.', 400);
  }

  // ----- 6. System prompt z dynamicznymi kategoriami i listą stron -----
  // Strategia cachowania:
  // Blok 1 (statyczny BASE_SYSTEM_PROMPT) — cache_control: ephemeral
  // Blok 2 (dynamiczne kategorie + lista content pages) — cache_control: ephemeral
  //   Zmienia się raz na 5 min (TTL cache'a w Supabase loaderze), więc też
  //   warto cache'ować — kolejne tury w obrębie 5 min używają tego samego.
  // Tools — cache_control na ostatnim narzędziu (cache'uje całą listę).
  // Cache write = 1.25x, cache read = 0.1x normalnej stawki Anthropic.
  // Typowa rozmowa wieloturowa: ~5x taniej niż bez cache.
  const categoriesText = await loadCategoriesText();

  const dynamicContextParts: string[] = [];
  if (categoriesText) {
    dynamicContextParts.push(
      `DOSTĘPNE KATEGORIE I PODKATEGORIE (używaj WYŁĄCZNIE tych slugów):\n\n${categoriesText}`
    );
  }
  dynamicContextParts.push(
    `DOSTĘPNE STRONY (slugi do tool get_page_content):\n\n${contentPagesIndexText}`
  );
  const dynamicContext = dynamicContextParts.join('\n\n');

  // ----- 7. Stream response -----
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // Heartbeat co 15s — zapobiega timeout proxy (Cloudflare/Vercel)
      // podczas długiego tool execution.
      let heartbeat: ReturnType<typeof setInterval> | null = null;

      try {
        const conversation: MessageParam[] = [...messages];
        let safety = 0;

        heartbeat = setInterval(() => {
          try {
            send({ type: 'heartbeat' });
          } catch {
            // stream zamknięty — ignoruj
          }
        }, 15_000);

        // Track produktów już pokazanych klientowi w tej rundzie SSE.
        // Gdy AI woła search_products wielokrotnie i wyniki się pokrywają,
        // nie chcemy dublować tej samej karty produktu w czacie.
        const shownProductIds = new Set<string>();

        // Tools z cache_control na ostatnim — cache'uje całą tablicę narzędzi.
        // Tools są statyczne (nie zmieniają się między requestami w rozmowie).
        const cachedTools = TOOLS.map((t, idx) =>
          idx === TOOLS.length - 1
            ? ({ ...t, cache_control: { type: 'ephemeral' } } as typeof t)
            : t
        );

        while (safety < 6) {
          safety++;

          // anthropic SDK z maxRetries: 4 obsłuży automatycznie 529/overloaded_error
          // z exponential backoff (1s -> 2s -> 4s -> 8s).
          const llmStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1500,
            system: [
              {
                type: 'text',
                text: BASE_SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
              },
              {
                type: 'text',
                text: dynamicContext,
                cache_control: { type: 'ephemeral' },
              },
            ],
            tools: cachedTools,
            messages: conversation,
          });

          for await (const event of llmStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              send({ type: 'text_delta', text: event.delta.text });
            }
          }

          const finalMessage = await llmStream.finalMessage();

          if (finalMessage.stop_reason === 'tool_use') {
            const toolBlocks = finalMessage.content.filter(
              (b): b is ToolUseBlock => b.type === 'tool_use'
            );

            const toolResults: Array<{
              type: 'tool_result';
              tool_use_id: string;
              content: string;
            }> = [];

            for (const block of toolBlocks) {
              if (block.name === 'search_products') {
                const fullResult = await executeSearchProducts(
                  block.input as Parameters<typeof executeSearchProducts>[0]
                );

                // Dedupe: filtrujemy produkty już pokazane klientowi w tej rundzie.
                const newProducts = fullResult.products.filter(
                  (p) => !shownProductIds.has(p.id)
                );
                newProducts.forEach((p) => shownProductIds.add(p.id));

                if (newProducts.length < fullResult.products.length) {
                  devLog(
                    `[search_products] dedupe: ${fullResult.products.length} returned, ${newProducts.length} new (${
                      fullResult.products.length - newProducts.length
                    } duplicates filtered)`
                  );
                }

                if (newProducts.length > 0) {
                  send({ type: 'products', products: newProducts });
                }

                // AI dostaje pełną listę (z duplikatami) plus info ile było nowych
                // dla klienta — żeby nie komentował "kolejnych propozycji" gdy wszystko
                // już zostało pokazane.
                const aiResult = {
                  products: fullResult.products.map((p) => ({
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    brand_name: p.brand_name,
                    price: p.price,
                    moq: p.moq,
                    marking: p.marking,
                    emoji: p.emoji,
                    description: p.description.slice(0, 220),
                    colors: p.colors.map((c) => ({ name: c.name, hex: c.hex })),
                  })),
                  count: fullResult.count,
                  new_to_user: newProducts.length,
                };

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(aiResult),
                });
              } else if (block.name === 'add_to_quote') {
                const result = await executeAddToQuote(
                  block.input as Parameters<typeof executeAddToQuote>[0]
                );

                if (result.success) {
                  send({
                    type: 'add_to_quote',
                    product: result.product,
                    color: result.color,
                  });
                }

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              } else if (block.name === 'get_quote') {
                const result = executeGetQuote(currentQuote);
                send({ type: 'quote_summary', quote: result });

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              } else if (block.name === 'get_brand_info') {
                const result = await executeGetBrandInfo(
                  block.input as Parameters<typeof executeGetBrandInfo>[0]
                );

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              } else if (block.name === 'get_page_content') {
                const result = await executeGetPageContent(
                  block.input as Parameters<typeof executeGetPageContent>[0]
                );

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              } else if (block.name === 'prompt_go_to_quote') {
                // Sygnał dla frontu — pokaż klientowi kartę z linkiem do zapytania
                send({ type: 'go_to_quote_prompt' });

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify({
                    success: true,
                    message: 'Karta z linkiem do zapytania została pokazana klientowi.',
                  }),
                });
              } else {
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
                });
              }
            }

            conversation.push({ role: 'assistant', content: finalMessage.content });
            conversation.push({ role: 'user', content: toolResults });

            send({ type: 'turn_separator' });
          } else {
            break;
          }
        }

        send({ type: 'done' });
      } catch (err) {
        console.error('[/api/chat] error:', err);

        const friendly = isOverloadedError(err)
          ? 'Asystent jest chwilowo przeciążony. Spróbuj ponownie za chwilę.'
          : 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';

        send({ type: 'error', message: friendly });
      } finally {
        if (heartbeat) clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}