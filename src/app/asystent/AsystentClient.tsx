'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useQuoteStore } from '@/stores/quoteStore';
import ChatMessage, { ChatMessageData, ChatBlock } from '@/components/asystent/ChatMessage';
import { Product } from '@/components/ProductCard';
import styles from './Asystent.module.css';

const WELCOME =
  'Cześć! Jestem asystentem Giviu. Pomogę Ci dobrać idealne upominki firmowe. Powiedz mi, na jaką okazję szukasz, jaki masz budżet i ile osób chcesz obdarować, a zaproponuję najlepsze rozwiązanie.';

const STORAGE_KEY = 'giviu-chat-history';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dni

// Frontendowe limity (mirror backendu — UX hint, nie zabezpieczenie)
const FRONTEND_MAX_MESSAGE_LENGTH = 2000;
const FRONTEND_MAX_MESSAGES = 60; // 60 widocznych wiadomości = ~30 rund

function uid() {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeWelcomeMessage(): ChatMessageData {
  return {
    id: uid(),
    role: 'assistant',
    blocks: [{ kind: 'text', text: WELCOME }],
  };
}

export default function AsystentClient() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    makeWelcomeMessage(),
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const items = useQuoteStore((s) => s.items);
  const addItem = useQuoteStore((s) => s.addItem);

  const asystentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const hasUserSent = messages.some((m) => m.role === 'user');
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileEnabled = Boolean(turnstileSiteKey);

  // ---------- Dynamiczny pomiar gdzie zaczyna się .asystent ----------
  useLayoutEffect(() => {
    const updateOffset = () => {
      const el = asystentRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top;
        document.documentElement.style.setProperty('--header-height', `${top}px`);
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  // ---------- Blokada scroll body ----------
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ---------- Load history z localStorage ----------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHistoryLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (
        parsed?.savedAt &&
        Date.now() - parsed.savedAt < TTL_MS &&
        Array.isArray(parsed.messages) &&
        parsed.messages.length > 0
      ) {
        setMessages(parsed.messages);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore corrupt
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  // ---------- Save history ----------
  useEffect(() => {
    if (!historyLoaded) return;
    if (!messages.some((m) => m.role === 'user')) return;
    try {
      const cleaned = messages.map((m) => ({ ...m, isStreaming: false }));
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages: cleaned, savedAt: Date.now() })
      );
    } catch {
      // localStorage może być pełny / wyłączony
    }
  }, [messages, historyLoaded]);

  // ---------- Auto-scroll ----------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ---------- Auto-resize textarea ----------
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  // ---------- Helpers do mutowania ostatniej wiadomości assistanta ----------
  const updateLastAssistant = (
    fn: (blocks: ChatBlock[]) => ChatBlock[]
  ) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (!last || last.role !== 'assistant') return prev;
      const nextBlocks = fn(last.blocks ?? []);
      next[next.length - 1] = { ...last, blocks: nextBlocks };
      return next;
    });
  };

  const appendTextDelta = (text: string) => {
    updateLastAssistant((blocks) => {
      const out = [...blocks];
      const lastBlock = out[out.length - 1];
      if (lastBlock && lastBlock.kind === 'text') {
        out[out.length - 1] = { kind: 'text', text: lastBlock.text + text };
      } else {
        out.push({ kind: 'text', text });
      }
      return out;
    });
  };

  const appendBlock = (block: ChatBlock) => {
    updateLastAssistant((blocks) => [...blocks, block]);
  };

  const turnSeparator = () => {
    updateLastAssistant((blocks) => {
      const last = blocks[blocks.length - 1];
      if (last && last.kind === 'text' && last.text.length > 0) {
        return [...blocks, { kind: 'text', text: '' }];
      }
      return blocks;
    });
  };

  const toApiMessages = (msgs: ChatMessageData[]) => {
    return msgs
      .filter((m, idx) => {
        if (idx === 0 && m.role === 'assistant') return false; // pomijamy welcome
        return true;
      })
      .map((m) => {
        if (m.role === 'user') {
          return { role: 'user' as const, content: m.text ?? '' };
        }
        const text = (m.blocks ?? [])
          .filter((b): b is { kind: 'text'; text: string } => b.kind === 'text')
          .map((b) => b.text)
          .join('');
        return { role: 'assistant' as const, content: text };
      })
      .filter((m) => m.content.trim().length > 0);
  };

  // ---------- Reset rozmowy ----------
  const handleReset = () => {
    if (isStreaming) return;
    if (!confirm('Rozpocząć nową rozmowę? Aktualna historia zostanie usunięta.')) return;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setMessages([makeWelcomeMessage()]);
    setError(null);
    setInput('');
  };

  // ---------- Send message ----------
  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    // Walidacje frontendowe (UX, backend i tak sprawdzi)
    if (trimmed.length > FRONTEND_MAX_MESSAGE_LENGTH) {
      setError(`Wiadomość za długa (max ${FRONTEND_MAX_MESSAGE_LENGTH} znaków).`);
      return;
    }
    if (messages.length >= FRONTEND_MAX_MESSAGES) {
      setError('Rozmowa zbyt długa. Kliknij ikonę odświeżania aby zacząć nową.');
      return;
    }

    // Turnstile token check
    if (turnstileEnabled && !turnstileToken) {
      setError('Trwa weryfikacja bezpieczeństwa, spróbuj ponownie za chwilę.');
      return;
    }

    setError(null);

    const userMsg: ChatMessageData = {
      id: uid(),
      role: 'user',
      text: trimmed,
    };
    const assistantMsg: ChatMessageData = {
      id: uid(),
      role: 'assistant',
      blocks: [],
      isStreaming: true,
    };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setInput('');
    setIsStreaming(true);

    const apiMessages = toApiMessages([...messages, userMsg]);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(turnstileToken ? { 'X-Turnstile-Token': turnstileToken } : {}),
        },
        body: JSON.stringify({
          messages: apiMessages,
          currentQuote: items,
        }),
        signal: ac.signal,
      });

      // Obsługa błędów HTTP z czytelnymi komunikatami
      if (res.status === 429) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Przekroczono limit zapytań.');
      }
      if (res.status === 401) {
        const errBody = await res.json().catch(() => ({}));
        // Reset turnstile, klient prawdopodobnie potrzebuje nowego tokena
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        throw new Error(errBody.error || 'Weryfikacja nieudana.');
      }
      if (res.status === 400) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Nieprawidłowe zapytanie.');
      }
      if (!res.ok || !res.body) {
        throw new Error(`Błąd serwera (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data:')) continue;
          const json = line.slice(5).trim();
          if (!json) continue;

          let event: { type: string; [k: string]: unknown };
          try {
            event = JSON.parse(json);
          } catch {
            continue;
          }

          if (event.type === 'text_delta') {
            appendTextDelta(event.text as string);
          } else if (event.type === 'products') {
            appendBlock({
              kind: 'products',
              products: (event.products as Product[]) ?? [],
            });
          } else if (event.type === 'add_to_quote') {
            const product = event.product as {
              id: string;
              slug: string;
              name: string;
              brand_name: string;
              price: string;
              image_url: string | null;
              emoji?: string | null;
            };
            const color = event.color as {
              index: number;
              name: string;
              hex: string;
              image: string | null;
            } | null;
            addItem({
              id: product.id,
              name: product.name,
              brand: product.brand_name,
              price: product.price,
              slug: product.slug,
              emoji: product.emoji ?? undefined,
              colorIndex: color?.index,
              colorName: color?.name,
              colorHex: color?.hex,
              colorImage: color?.image ?? undefined,
            });
            const colorTxt = color ? ` (${color.name})` : '';
            appendBlock({
              kind: 'notice',
              text: `Dodano do wyceny: ${product.name}${colorTxt}`,
            });
          } else if (event.type === 'quote_summary') {
            const q = event.quote as {
              items: Array<{
                product_id: string;
                name: string;
                brand_name: string;
                price: string;
                color_name?: string | null;
              }>;
              empty: boolean;
            };
            appendBlock({
              kind: 'quote',
              items: q.items,
              empty: q.empty,
            });
          } else if (event.type === 'turn_separator') {
            turnSeparator();
          } else if (event.type === 'error') {
            setError((event.message as string) ?? 'Błąd');
          } else if (event.type === 'done') {
            // finish
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError((e as Error).message ?? 'Błąd połączenia');
    } finally {
      setIsStreaming(false);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === 'assistant') {
          next[next.length - 1] = { ...last, isStreaming: false };
        }
        return next;
      });
      abortRef.current = null;

      // Reset Turnstile token (single-use). Widget automatycznie wygeneruje nowy.
      if (turnstileEnabled) {
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div ref={asystentRef} className={styles.asystent}>
      {/* Turnstile widget — invisible, mountuje się na całą sesję */}
      {turnstileEnabled && turnstileSiteKey ? (
        <div className={styles.turnstileWrapper}>
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
            options={{
              size: 'invisible',
              theme: 'light',
              appearance: 'interaction-only',
            }}
          />
        </div>
      ) : null}

      {hasUserSent ? (
        <button
          type="button"
          onClick={handleReset}
          className={styles.resetButton}
          aria-label="Rozpocznij nową rozmowę"
          title="Nowa rozmowa"
          disabled={isStreaming}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      ) : null}

      <div ref={scrollRef} className={styles.messagesScroll}>
        <div className={styles.messagesContainer}>
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {error ? <div className={styles.errorBanner}>{error}</div> : null}
        </div>
      </div>

      <div className={styles.composer}>
        <div className={styles.composerInner}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={hasUserSent ? '' : 'Napisz wiadomość...'}
            rows={1}
            disabled={isStreaming}
            maxLength={FRONTEND_MAX_MESSAGE_LENGTH + 100}
            className={styles.composerInput}
          />
          <button
            type="button"
            onClick={send}
            disabled={isStreaming || input.trim().length === 0}
            className={styles.composerSend}
            aria-label="Wyślij"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>
          Asystent AI może popełniać błędy. Ostateczne warunki ustala zespół Giviu.
        </p>
      </div>
    </div>
  );
}
