import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inspiracje — Pomysły na Prezenty Firmowe Premium',
  description: 'Porady, porównania i trendy w prezentach firmowych. Welcome packi, upominki eventowe, prezenty świąteczne. Inspiruj się z Giviu.',
  alternates: { canonical: '/inspiracje' },
  openGraph: {
    title: 'Inspiracje — Pomysły na Prezenty Firmowe Premium',
    description: 'Porady, porównania i trendy w prezentach firmowych. Inspiruj się z Giviu.',
    url: '/inspiracje',
  },
};

export default function InspiracjeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

