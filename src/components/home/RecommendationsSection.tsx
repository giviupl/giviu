import { supabase } from '@/lib/supabase';
import RecommendationsClient from './RecommendationsClient';

export default async function RecommendationsSection() {
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, brand_name, price, colors, category, category_slug, image_url')
    .eq('featured_recommendation', true)
    .eq('active', true)
    .order('category');

  if (!products || products.length === 0) return null;

  return <RecommendationsClient products={products} />;
}
