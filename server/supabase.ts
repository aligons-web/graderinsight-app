import { createClient } from '@supabase/supabase-js';

// Load environment variables (using your GRADER_ prefix)
const SUPABASE_URL = process.env.GRADER_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.GRADER_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.GRADER_SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('GRADER_SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('GRADER_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.error('GRADER_SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.error('\n📝 Make sure all secrets are set in Replit Secrets!');
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
);

console.log('✅ Supabase initialized successfully');