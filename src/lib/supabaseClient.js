import { createClient } from '@supabase/supabase-js';

// Initializes a Supabase client using env vars injected at build time.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Log a clear message in development to help catch misconfiguration early.
  // In production this will simply be absent from the console unless the app is opened.
  // Avoid throwing here to keep the app running in case of partial functionality.
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing: check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
