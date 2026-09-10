import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ProfileRow, ContentTypeEnum } from "@/types/database";

/** Looks up a real Supabase account by username — null when it doesn't exist. */
export async function getPublicProfileByUsername(username: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  return data ?? null;
}

export interface ProfileStats {
  lineupsCreated: number;
  playsCreated: number;
  boostsCreated: number;
  likesReceived: number;
  verifiedContent: number;
}

const EMPTY_STATS: ProfileStats = {
  lineupsCreated: 0,
  playsCreated: 0,
  boostsCreated: 0,
  likesReceived: 0,
  verifiedContent: 0,
};

async function countLikes(contentType: ContentTypeEnum, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("content_type", contentType)
    .in("content_id", ids);
  return count ?? 0;
}

/** Real stats for a real (DB-backed) profile — lineups/plays/boosts they authored, and likes those got. */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  if (!isSupabaseConfigured()) return EMPTY_STATS;

  try {
    const supabase = await createServerSupabaseClient();
    const [lineupsRes, playsRes, boostsRes] = await Promise.all([
      supabase.from("lineups").select("id, verified").eq("author_id", userId),
      supabase.from("plays").select("id").eq("author_id", userId),
      supabase.from("boosts").select("id").eq("author_id", userId),
    ]);

    const lineupIds = (lineupsRes.data ?? []).map((l) => l.id);
    const playIds = (playsRes.data ?? []).map((p) => p.id);
    const boostIds = (boostsRes.data ?? []).map((b) => b.id);
    const verifiedContent = (lineupsRes.data ?? []).filter((l) => l.verified).length;

    const [lineupLikes, playLikes, boostLikes] = await Promise.all([
      countLikes("lineup", lineupIds),
      countLikes("play", playIds),
      countLikes("boost", boostIds),
    ]);

    return {
      lineupsCreated: lineupIds.length,
      playsCreated: playIds.length,
      boostsCreated: boostIds.length,
      likesReceived: lineupLikes + playLikes + boostLikes,
      verifiedContent,
    };
  } catch {
    return EMPTY_STATS;
  }
}
