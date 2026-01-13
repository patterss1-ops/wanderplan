import { createBrowserClient } from '@supabase/ssr';

// Create a Supabase client for browser-side operations
// Types are inferred at runtime from the database
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
