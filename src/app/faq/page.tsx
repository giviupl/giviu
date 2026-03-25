import FAQSection from '@/components/FAQSection';
import { FAQ_GENERAL } from '@/data/faq';
import RecentlyViewedCarousel from '@/components/RecentlyViewedCarousel';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Najczęstsze Pytania o Prezenty Firmowe',
  description: 'Odpowiedzi na pytania o minimalne zamówienia, czas realizacji, personalizację i ceny prezentów firmowych premium. Wszystko co musisz wiedzieć.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Najczęstsze Pytania o Prezenty Firmowe',
    description: 'Odpowiedzi na pytania o minimalne zamówienia, czas realizacji, personalizację i ceny prezentów firmowych premium. Wszystko co musisz wiedzieć.',
    url: '/faq',
  },
};

export default function FAQPage() {
  return (
    <main className="faq-page">

      {/* Spacer */}
      <div className="faq-spacer"></div>

      <FAQSection
        headingAs="h1"
        title="Wszystko, co musisz wiedzieć o współpracy"
        description="Od doboru produktów, przez personalizację, aż po logistykę. Tu znajdziesz konkretne odpowiedzi, które ułatwią Ci proces realizacji."
        items={FAQ_GENERAL}
      />

      {/* Recently Viewed */}
      <RecentlyViewedCarousel />

    </main>
  );
}
