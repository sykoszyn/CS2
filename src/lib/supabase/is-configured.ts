/**
 * True once a real Supabase project is wired up (see supabase/README.md).
 * Server code that reads public content (maps, calls) uses this to fall
 * back to the bundled demo data instead of crashing when the app is run
 * without credentials — auth-dependent code paths do NOT use this fallback,
 * they simply have nothing to authenticate against until it's configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
