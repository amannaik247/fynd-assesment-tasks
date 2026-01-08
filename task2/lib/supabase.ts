import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------
// SUPABASE CREDENTIALS
// ------------------------------------------------------------
// The Supabase URL and anon/public key are read from environment variables.
// Replace the placeholder values below with your actual credentials, or set them
// in a `.env.local` file (recommended) as NEXT_PUBLIC_SUPABASE_URL and
// NEXT_PUBLIC_SUPABASE_ANON_KEY. Keeping them in env vars avoids committing secrets.
// ------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
