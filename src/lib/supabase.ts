import { createClient } from '@supabase/supabase-js';

// ============================================
// Supabase client — jedno źródło prawdy
// ============================================
// Te zmienne bierze z .env.local (nie commituj tego pliku!)
// NEXT_PUBLIC_ prefix = dostępne w przeglądarce (safe, bo to anon key)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Brak zmiennych NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
