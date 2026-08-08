import { createClient } from '@supabase/supabase-js';

// Remplace par tes véritables identifiants Supabase si besoin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TA_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TA_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);