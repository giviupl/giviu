// ============================================
// Giviu — współdzielone typy
// Używane zarówno w server components jak i client
// ============================================

export interface ProductColor {
  name: string;
  hex: string;
  images?: string[]; // ścieżki do zdjęć per kolor, np. ["/images/products/quencher-h20/black-1.webp"]
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  brand_id?: string;
  code?: string;
  price: string;
  category: string;
  category_slug: string;
  subcategory: string;
  subcategory_slug: string;
  description: string;
  colors: ProductColor[];
  views: string[];
  emoji?: string;
  is_new?: boolean;
  image_url?: string;
  sku?: string;
  mpn?: string;
  gtin?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  moq?: number;
  marking?: string;
  origin?: string;
  attributes?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface BrandFeature {
  title: string;
  text: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  color?: string;
  headline?: string;
  features: BrandFeature[];
  categories: string[];
  emoji?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  category?: string;
  type?: string;
  image_url?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subcategory {
  name: string;
  slug: string;
  emoji?: string;
  image?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  title?: string;
  description?: string;
  gradient?: string;
  subcategories: Subcategory[];
  created_at?: string;
  updated_at?: string;
}

// Typ dla ProductCard — mniejszy subset (nie wymaga wszystkich pól)
export interface ProductCardData {
  id: string;
  name: string;
  brand_name: string;
  price: string;
  slug: string;
  colors?: ProductColor[];
  emoji?: string;
  views?: string[];
  image_url?: string;
  category?: string;
  category_slug?: string;
}

// Kategorie inspiracji (statyczne — nie ma sensu trzymać w bazie)
export const INSPIRATION_CATEGORIES = [
  'Onboarding',
  'Eventy',
  'Świąteczne',
  'Employer Branding',
  'Eko',
];
