import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wycena — Podsumowanie Zapytania',
  description: 'Podsumowanie wybranych produktów i formularz zapytania ofertowego. Wypełnij dane kontaktowe, a zespół Giviu przygotuje wycenę w 24h.',
  robots: { index: false, follow: false },
};

export default function WycenaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

