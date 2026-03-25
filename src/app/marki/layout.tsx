import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marki Premium — Stanley, Moleskine, The North Face i Więcej',
  description: 'Prezenty firmowe od najlepszych marek świata. Stanley, Moleskine, The North Face, Thule, Rituals — z personalizacją dla Twojej firmy.',
  alternates: { canonical: '/marki' },
  openGraph: {
    title: 'Marki Premium — Stanley, Moleskine, The North Face i Więcej',
    description: 'Prezenty firmowe od najlepszych marek świata z personalizacją.',
    url: '/marki',
    images: [{ url: 'https://giviu.pl/og-default.jpg', width: 1200, height: 630, alt: 'Marki premium — prezenty firmowe' }],
  },
};

export default function MarkiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
