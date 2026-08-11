import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables for Supabase credentials
let rawUrl = (
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  ''
).trim();

// Sanitize URL: Remove any trailing /rest/v1 or trailing slashes automatically
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  ''
).trim();

// Check if credentials are appropriately configured (not empty or default placeholders)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('placeholder-project') &&
  !supabaseAnonKey.includes('your-actual-anon-key') &&
  !supabaseAnonKey.includes('placeholder-anon-key') &&
  supabaseUrl.startsWith('https://')
);

// Fallback placeholder credentials to prevent app crashes when running locally without credentials
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

// Initialize singleton Supabase client
export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
