'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductCard, { Product } from '@/components/ProductCard';
import QuoteSummary from './QuoteSummary';
import styles from '@/app/asystent/Asystent.module.css';

export type ChatBlock =
  | { kind: 'text'; text: string }
  | { kind: 'products'; products: Product[] }
  | { kind: 'quote'; items: Array<{
      product_id: string;
      name: string;
      brand_name: string;
      price: string;
      color_name?: string | null;
    }>; empty: boolean }
  | { kind: 'notice'; text: string };

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  blocks?: ChatBlock[];
  isStreaming?: boolean;
}

interface Props {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className={`${styles.message} ${styles.messageUser}`}>
        <div className={styles.bubbleUser}>{message.text}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.message} ${styles.messageAssistant}`}>
      <div className={styles.avatar}>
        <span>G</span>
      </div>
      <div className={styles.assistantContent}>
        {(message.blocks ?? []).map((block, idx) => {
          if (block.kind === 'text') {
            if (!block.text) return null;
            return (
              <div key={idx} className={styles.bubbleAssistant}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.text}
                </ReactMarkdown>
              </div>
            );
          }
          if (block.kind === 'products') {
            if (block.products.length === 0) return null;
            return (
              <div key={idx} className={styles.productsGrid}>
                {block.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            );
          }
          if (block.kind === 'quote') {
            return (
              <QuoteSummary
                key={idx}
                items={block.items}
                empty={block.empty}
              />
            );
          }
          if (block.kind === 'notice') {
            return (
              <div key={idx} className={styles.notice}>
                {block.text}
              </div>
            );
          }
          return null;
        })}
        {message.isStreaming ? (
          <div className={styles.typingIndicator}>
            <span /><span /><span />
          </div>
        ) : null}
      </div>
    </div>
  );
}
