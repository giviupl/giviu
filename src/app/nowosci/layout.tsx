import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nowości — Najnowsze Prezenty Firmowe Premium',
  description: 'Najnowsze prezenty firmowe premium w ofercie Giviu. Świeże kolekcje od Stanley, Moleskine, The North Face i innych topowych marek z personalizacją.',
  alternates: { canonical: '/nowosci' },
  openGraph: {
    title: 'Nowości — Najnowsze Prezenty Firmowe Premium',
    description: 'Najnowsze prezenty firmowe premium od Stanley, Moleskine, The North Face z personalizacją.',
    url: '/nowosci',
    images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: 'Nowości — prezenty firmowe premium' }],
  },
};

export default function NowosciLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

