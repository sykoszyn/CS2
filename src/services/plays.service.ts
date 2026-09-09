import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getMapBySlug } from "@/services/maps.service";
import { getLikeStates } from "@/services/likes.service";
import { plays as mockPlays, getPlaysByMap as getMockPlaysByMap } from "@/lib/mock/plays";
import type { Play } from "@/types/content";
import type { VideoRow } from "@/types/database";

const PLAY_SELECT = `
  *,
  maps ( slug ),
  profiles ( username ),
  videos ( * )
`;

interface PlayJoinRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Play["category"];
  like_count: number;
  comment_count: number;
  created_at: string;
  maps: { slug: string } | null;
  profiles: { username: string } | null;
  videos: VideoRow;
  is_demo: boolean;
}

function toPlay(row: PlayJoinRow): Play {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    mapSlug: row.maps?.slug ?? "",
    category: row.category,
    authorUsername: row.profiles?.username ?? "comunidad",
    video: {
      id: row.videos.id,
      source: row.videos.source,
      url: row.videos.url,
      durationSeconds: row.videos.duration_seconds ?? undefined,
      thumbnailUrl: row.videos.thumbnail_url ?? undefined,
    },
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    isDemo: row.is_demo,
  };
}

/**
 * `plays.like_count` is a denormalized column nothing updates yet, so it
 * would always read 0 for real content. Overlay the live count (+ whether
 * the current viewer liked it) from the real `likes` table instead — one
 * batched query regardless of list size.
 */
async function attachLiveLikeState(plays: Play[]): Promise<Play[]> {
  if (!isSupabaseConfigured() || plays.length === 0) return plays;

  const states = await getLikeStates("play", plays.map((p) => p.id));
  return plays.map((p) => {
    const state = states.get(p.id);
    return state ? { ...p, likeCount: state.count, likedByMe: state.likedByMe } : p;
  });
}

export async function getPlays(): Promise<Play[]> {
  if (!isSupabaseConfigured()) return mockPlays;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select(PLAY_SELECT)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return attachLiveLikeState((data as unknown as PlayJoinRow[]).map(toPlay));
  } catch {
    return mockPlays;
  }
}

export async function getPlaysByIds(ids: string[]): Promise<Play[]> {
  if (ids.length === 0) return [];
  if (!isSupabaseConfigured()) return mockPlays.filter((p) => ids.includes(p.id));

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("plays").select(PLAY_SELECT).neq("status", "removed").in("id", ids);
    if (error) throw error;
    return attachLiveLikeState((data as unknown as PlayJoinRow[]).map(toPlay));
  } catch {
    return mockPlays.filter((p) => ids.includes(p.id));
  }
}

export async function getPlaysByAuthor(userId: string): Promise<Play[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select(PLAY_SELECT)
      .eq("author_id", userId)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return attachLiveLikeState((data as unknown as PlayJoinRow[]).map(toPlay));
  } catch {
    return [];
  }
}

export async function getPlaysByMap(mapSlug: string): Promise<Play[]> {
  if (!isSupabaseConfigured()) return getMockPlaysByMap(mapSlug);

  try {
    const map = await getMapBySlug(mapSlug);
    if (!map) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select(PLAY_SELECT)
      .eq("map_id", map.id)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return attachLiveLikeState((data as unknown as PlayJoinRow[]).map(toPlay));
  } catch {
    return getMockPlaysByMap(mapSlug);
  }
}

export async function getPlayBySlug(slug: string): Promise<Play | null> {
  if (!isSupabaseConfigured()) return mockPlays.find((p) => p.slug === slug) ?? null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select(PLAY_SELECT)
      .eq("slug", slug)
      .neq("status", "removed")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [play] = await attachLiveLikeState([toPlay(data as unknown as PlayJoinRow)]);
    return play;
  } catch {
    return mockPlays.find((p) => p.slug === slug) ?? null;
  }
}
