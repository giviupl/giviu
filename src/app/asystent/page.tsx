import type { Metadata } from 'next';
import AsystentClient from './AsystentClient';

export const metadata: Metadata = {
  title: 'Asystent AI · Giviu',
  description:
    'Doradca AI Giviu — pomoże dobrać upominki firmowe premium na każdą okazję. Stanley, Moleskine, Parker, Thule i więcej. Zapytaj o produkty, otrzymaj propozycje, dodaj do wyceny.',
  robots: { index: true, follow: true },
};

export default function AsystentPage() {
  return <AsystentClient />;
}