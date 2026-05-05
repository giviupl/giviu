// navigation.ts

// ============================================
// KATEGORIE (do nawigacji)
// ============================================
interface Category {
  name: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { name: 'ODZIEŻ', slug: 'odziez' },
  { name: 'KUBKI I BUTELKI', slug: 'kubki-i-butelki' },
  { name: 'PLECAKI I TORBY', slug: 'plecaki-i-torby' },
  { name: 'ELEKTRONIKA', slug: 'elektronika' },
  { name: 'PARASOLE', slug: 'parasole' },
  { name: 'DOM I WYPOCZYNEK', slug: 'dom-i-wypoczynek' },
  { name: 'BIURO I NOTATNIKI', slug: 'biuro-i-notatniki' },
];

// ============================================
// LINKI W HEADERZE
// ============================================
interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'INSPIRACJE', href: '/inspiracje' },
  { label: 'O Giviu', href: '/o-nas' },
  { label: 'Jak działamy', href: '/jak-dzialamy' },
  { label: 'Ekologia', href: '/ekologia' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
  { href: '/asystent', label: 'Asystent AI' },
];