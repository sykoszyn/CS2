import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getProfileByUsername as getMockProfileByUsername } from "@/lib/mock/profiles";
import type { ProfileRow } from "@/types/database";
import type { PublicProfile } from "@/types/content";

export type PublicProfileResult =
  | { kind: "real"; profile: ProfileRow }
  | { kind: "mock"; profile: PublicProfile };

/**
 * Looks up a public profile by username, preferring a real Supabase account.
 * Falls back to the bundled demo profiles (`demo_coach`, `demo_player`) so
 * the seeded demo content still has an author page to link to until real
 * users start publishing (Fase 3+).
 */
export async function getPublicProfileByUsername(username: string): Promise<PublicProfileResult | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    if (data) return { kind: "real", profile: data };
  }

  const mockProfile = getMockProfileByUsername(username);
  if (mockProfile) return { kind: "mock", profile: mockProfile };

  return null;
}
