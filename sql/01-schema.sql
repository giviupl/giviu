-- ============================================
-- GIVIU: Supabase Schema
-- Uruchom w SQL Editor na supabase.com
-- ============================================

-- 1. BRANDS
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  color TEXT,
  headline TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  emoji TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id),
  brand_name TEXT NOT NULL,
  code TEXT,
  price TEXT,
  category TEXT,
  category_slug TEXT NOT NULL,
  subcategory TEXT,
  subcategory_slug TEXT NOT NULL,
  description TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  views JSONB DEFAULT '[]'::jsonb,
  emoji TEXT,
  is_new BOOLEAN DEFAULT false,
  image_url TEXT,
  sku TEXT,
  mpn TEXT,
  gtin TEXT,
  material TEXT,
  dimensions TEXT,
  weight TEXT,
  moq INTEGER,
  marking TEXT,
  origin TEXT,
  attributes JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ARTICLES
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  type TEXT DEFAULT 'article',
  image_url TEXT,
  author TEXT DEFAULT 'Giviu',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  gradient TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Indeksy
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_slug ON products(category_slug);
CREATE INDEX idx_products_subcategory_slug ON products(subcategory_slug);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_brand_name ON products(brand_name);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_categories_slug ON categories(slug);

-- 6. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (active = true);
CREATE POLICY "Public read articles" ON articles FOR SELECT USING (active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (active = true);
