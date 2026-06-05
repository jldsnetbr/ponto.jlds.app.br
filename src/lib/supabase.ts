import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.DEV
  ? import.meta.env.VITE_SUPABASE_URL
  : window.location.origin;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
