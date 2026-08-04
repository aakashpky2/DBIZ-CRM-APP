import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_CRM_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_CRM_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'CRM Supabase credentials missing. Set VITE_CRM_SUPABASE_URL and VITE_CRM_SUPABASE_ANON_KEY in the root .env file, then restart Vite.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
