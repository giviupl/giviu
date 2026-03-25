import { supabase } from './supabase';
import type { Product, Brand, Article, Category } from '@/types';

// ============================================
// PRODUCTS
// ============================================

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');

  if (error) {
    console.error('getAllProducts error:', error);
    return [];
  }
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // .single() rzuca error gdy nie znajdzie — to normalne
    if (error.code !== 'PGRST116') {
      console.error('getProductBySlug error:', error);
    }
    return null;
  }
  return data;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', categorySlug)
    .order('name');

  if (error) {
    console.error('getProductsByCategory error:', error);
    return [];
  }
  return data ?? [];
}

export async function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', categorySlug)
    .eq('subcategory_slug', subcategorySlug)
    .order('name');

  if (error) {
    console.error('getProductsBySubcategory error:', error);
    return [];
  }
  return data ?? [];
}

export async function getProductsByBrand(brandName: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('brand_name', brandName)
    .order('name');

  if (error) {
    console.error('getProductsByBrand error:', error);
    return [];
  }
  return data ?? [];
}

export async function getNewProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getNewProducts error:', error);
    return [];
  }
  return data ?? [];
}

export async function getRelatedProducts(
  currentId: string,
  categorySlug: string,
  limit: number = 4
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_slug', categorySlug)
    .neq('id', currentId)
    .limit(limit);

  if (error) {
    console.error('getRelatedProducts error:', error);
    return [];
  }
  return data ?? [];
}

export async function getRecommendedProducts(
  limit: number = 6,
  excludeId?: string
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .limit(limit);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getRecommendedProducts error:', error);
    return [];
  }
  return data ?? [];
}

// ============================================
// BRANDS
// ============================================

export async function getAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('getAllBrands error:', error);
    return [];
  }
  return data ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getBrandBySlug error:', error);
    }
    return null;
  }
  return data;
}

// ============================================
// ARTICLES
// ============================================

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllArticles error:', error);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getArticleBySlug error:', error);
    }
    return null;
  }
  return data;
}

// ============================================
// CATEGORIES
// ============================================

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('getAllCategories error:', error);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('getCategoryBySlug error:', error);
    }
    return null;
  }
  return data;
}
