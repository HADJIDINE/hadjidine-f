import { createClient } from '@supabase/supabase-js';

// Tes identifiants Supabase
const supabaseUrl = 'https://vfrfztwcshenmdwfckua.supabase.co';
const supabaseAnonKey = 'sb_publishable_d4QtUvYZP_koLg1ESkyazw_OTjQmriv';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);