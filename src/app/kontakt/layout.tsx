import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt — Zamów Prezenty Firmowe Premium',
  description: 'Skontaktuj się z Giviu. Bezpłatna wycena prezentów firmowych premium w 24h. Doradztwo, personalizacja i dostawa na terenie całej Polski.',
  alternates: { canonical: '/kontakt' },
  openGraph: {
    title: 'Kontakt — Zamów Prezenty Firmowe Premium',
    description: 'Bezpłatna wycena prezentów firmowych premium w 24h. Doradztwo, personalizacja i dostawa.',
    url: '/kontakt',
  },
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
