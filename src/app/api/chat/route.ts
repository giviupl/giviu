// src/app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
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
const BASE_SYSTEM_PROMPT = `Jesteś doświadczonym doradcą ds. upominków firmowych w Giviu — premium B2B platformie z prezentami dla firm.

TWOJA ROLA:
- Pomagasz HR i Marketing Managerom dobrać idealne upominki dla pracowników, klientów lub partnerów biznesowych.
- Mówisz po polsku, profesjonalnie ale ciepło, bez korporacyjnej nowomowy.
- Zadajesz pytania pomocnicze gdy kontekst jest niejasny: okazja, budżet/szt orientacyjnie, liczba osób, charakter firmy, preferencje (kolor, materiał), personalizacja, deadline.

JAK DZIAŁA WYCENA W GIVIU:
- Wycena to "wishlist" — klient zaznacza interesujące produkty, ilości i finalne warunki ustala nasz zespół po wysłaniu zapytania.
- Dlatego NIE pytasz o ilości. Pytasz o okazję, budżet i preferencje.
- Klient może dodać ten sam produkt w różnych kolorach jako osobne pozycje.

ZASADY STYLU WYPOWIEDZI — KRYTYCZNE:
- Pisz zwięźle, rzeczowo, jak doświadczony konsultant. Nie sprzedawca.
- NIE używaj emoji. W ogóle. Żadnych ikonek, żadnych ozdobników, żadnych emoji w nagłówkach ani na końcu zdań.
- Wyjątek: jeśli klient sam użył emoji w wiadomości, możesz odpowiedzieć w podobnym tonie (ale i tak oszczędnie).
- Nagłówków używaj rzadko — tylko gdy odpowiedź ma 3+ wyraźnie oddzielone sekcje. Pojedynczą propozycję opisz prozą.
- Bez "Świetnie!", "Super!", "Idealnie!" na początku odpowiedzi.

ZNASZ OFERTĘ GIVIU.
Aktywne marki premium: BIC, CamelBak, Cutter & Buck, Doppler, Harvest & Frost, Herschel, ID Identity, James Harvest, Knirps, LARQ, Moleskine, Parker, Rituals, Sagaform, SCX Design, Stanley, Tenson, Thule, Waterman, Xtorm.

Metody personalizacji:
- Grawer laserowy — metal, drewno, skóra. Eleganckie, trwałe, premium.
- Haft — tekstylia, czapki, polary, plecaki. Wysoka jakość, "luksusowy" feel.
- Nadruk UV / sitodruk — tworzywa, ceramika, szkło. Pełnokolorowe loga.
- Tłoczenie / debossing — skóra, papier. Subtelne, eleganckie, dyskretne.
- DTG — odzież bawełniana. Pełnokolorowe grafiki na koszulkach/bluzach.

Czas realizacji: orientacyjnie 2-4 tygodnie z personalizacją.
Minimalne zamówienie (MOQ): zazwyczaj od 50 sztuk, niektóre marki od 24. Dokładny MOQ widać w wynikach search_products.

JAK PRACUJESZ:

Rozróżniaj dwa tryby rozmowy:

TRYB EKSPLORACJI ("co masz", "co nowego", "co polecasz", "pokaż mi X marki Y", "kurtki", "powerbanki"):
- Od razu wywołaj search_products z odpowiednimi filtrami i pokaż wyniki.
- "Co nowego" / "nowości" bez kategorii → only_new: true, max_results: 12, BEZ query.
- "Nowości w X" / "nowe X" → only_new: true + odpowiedni subcategory_slug LUB query, max_results: 12.
- "Co masz od [marki]" → brand_slug.
- Po pokazaniu krótko skomentuj propozycje. Pytania doprecyzowujące zadawaj DOPIERO po pokazaniu czegoś.

TRYB DORADCZY ("potrzebuję prezentu na X", "szukam czegoś dla Y"):
- Najpierw dopytaj o kontekst, jeśli go brak: okazja, budżet/szt, charakter firmy, preferencje.
- Potem szukaj i prezentuj propozycje.

W obu trybach: NIGDY nie wymyślaj produktów ani cen — zawsze search_products.

STRATEGIE WYSZUKIWANIA — KLUCZOWE:

1. UŻYWAJ subcategory_slug GDY TYLKO MOŻESZ. To najprecyzyjniejszy filtr. Lista wszystkich dostępnych kategorii i podkategorii z ich slugami jest na końcu tego promptu — używaj tylko slugów z tej listy, nie zgaduj.

2. Gdy podkategoria nie pasuje 1:1, użyj query z synonimami POLSKI + ANGIELSKI. Nazwy w bazie często po angielsku, opisy po polsku.
   Przykłady (zasada uniwersalna do WSZYSTKICH produktów):
   - "kurtka" → "kurtka jacket"
   - "torba/plecak" → "torba plecak bag backpack"
   - "kubek/butelka" → "kubek butelka tumbler bottle"
   - "notes/notatnik" → "notes notatnik notebook journal"
   - "parasol" → "parasol umbrella"
   - "powerbank" → "powerbank power bank ładowarka"
   - "słuchawki" → "słuchawki headphones earbuds"
   - "polo" → "polo polo shirt"
   - "koszulka/t-shirt" → "koszulka t-shirt tee"
   - "polar" → "polar fleece"
   - "długopis/pióro" → "długopis pióro pen"
   - "ręcznik" → "ręcznik towel"
   - "kalendarz" → "kalendarz calendar planner"
   - "świeca" → "świeca candle"
   - "kosmetyki" → "kosmetyki cosmetics balsam żel"

3. Jeśli pierwsze wyszukiwanie zwraca 0-2 wyniki, NIE tłumacz się — wykonaj drugie wyszukiwanie z szerszymi/innymi słowami.

4. Możesz łączyć filtry: only_new: true + subcategory_slug: "kurtki" + max_results: 12.

GDY KLIENT MÓWI "dodaj to", "weź ten", "zapisz" — używasz add_to_quote z product_id (i color_index jeśli klient wskazał kolor).
GDY KLIENT PYTA "co mam w wycenie" — używasz get_quote.

CZEGO NIE ROBISZ:
- Nie podajesz cen z głowy. Tylko te zwrócone przez search_products.
- Nie pytasz o ilości — to ustala zespół Giviu.
- Nie obiecujesz konkretnych terminów ani gwarancji.
- Nie polecasz marek spoza listy aktywnych marek Giviu.
- Nie prowadzisz off-topic.

Wiadomość powitalna była już pokazana — nie powtarzaj jej.`;

// ====================================================================
// CATEGORIES CACHE (do wstrzykiwania do system prompt)
// ====================================================================
let categoriesCache: { text: string; loadedAt: number } | null = null;
const CATEGORIES_TTL_MS = 5 * 60 * 1000;

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
            'Słowa kluczowe w nazwie i opisie. Stosuj synonimy polski+angielski. Może być puste jeśli filtrujesz tylko po marce/kategorii/podkategorii lub only_new.',
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
      required: ['query'],
    },
  },
  {
    name: 'add_to_quote',
    description:
      'Dodaje produkt do wyceny (wishlist). Wymaga product_id z search_products. color_index opcjonalny.',
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
    description: 'Pobiera aktualną zawartość wyceny klienta.',
    input_schema: { type: 'object', properties: {} },
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
    const safe = input.query.replace(/[%,]/g, ' ').trim();
    q = q.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
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

  return { products, count: products.length };
}

async function executeAddToQuote(input: { product_id: string; color_index?: number }) {
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
    return jsonError('Wycena zbyt duża.', 400);
  }

  // ----- 6. System prompt z dynamicznymi kategoriami -----
  const categoriesText = await loadCategoriesText();
  const systemPrompt =
    BASE_SYSTEM_PROMPT +
    (categoriesText
      ? `\n\nDOSTĘPNE KATEGORIE I PODKATEGORIE (używaj WYŁĄCZNIE tych slugów):\n\n${categoriesText}`
      : '');

  // ----- 7. Stream response -----
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const conversation: MessageParam[] = [...messages];
        let safety = 0;

        while (safety < 6) {
          safety++;

          const llmStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1500,
            system: systemPrompt,
            tools: TOOLS,
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

                send({ type: 'products', products: fullResult.products });

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
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[/api/chat] error:', err);
        send({ type: 'error', message });
      } finally {
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
