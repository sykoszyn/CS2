import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ProfileRow } from "@/types/database";

/**
 * Reads the signed-in user's profile row, or null when logged out / not configured.
 *
 * Wrapped in React's `cache()` because both the root layout (via `AppShell`,
 * for the header/sidebar) and most individual pages call this — without
 * memoization, a single request to e.g. `/lineups/[slug]` was hitting
 * Supabase Auth and the `profiles` table twice. `cache()` scopes the
 * memoization to one request/render pass, so every caller on the same
 * request shares the one round-trip.
 */
export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return profile ?? null;
});
