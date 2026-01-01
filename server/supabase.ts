import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.GRADER_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.GRADER_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.GRADER_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Public client for client-side operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client for server-side operations (bypasses RLS)
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  GRADER_SUPABASE_SERVICE_ROLE_KEY not set - admin operations may fail');
}

export const supabaseAdmin = createClient(
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);