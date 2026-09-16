import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * Checks if the Supabase environment variables are properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  // Basic validation that URL is valid HTTP/HTTPS and key is not a placeholder
  if (
    !supabaseUrl.startsWith("http://") &&
    !supabaseUrl.startsWith("https://")
  ) {
    return false;
  }
  if (
    supabaseUrl.includes("your-project-ref") ||
    supabaseAnonKey.includes("your-supabase-anon-key") ||
    supabaseAnonKey.length < 10
  ) {
    return false;
  }
  return true;
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client or null if unconfigured.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance && supabaseUrl && supabaseAnonKey) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return clientInstance;
};

/**
 * Reusable Supabase client export.
 * If credentials are not supplied, returns null for graceful fallback.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? getSupabaseClient()
  : null;
