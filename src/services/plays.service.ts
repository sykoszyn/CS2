import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getMapBySlug } from "@/services/maps.service";
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

export async function getPlays(): Promise<Play[]> {
  if (!isSupabaseConfigured()) return mockPlays;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("plays")
      .select(PLAY_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as PlayJoinRow[]).map(toPlay);
  } catch {
    return mockPlays;
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
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as PlayJoinRow[]).map(toPlay);
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
      .maybeSingle();
    if (error) throw error;
    return data ? toPlay(data as unknown as PlayJoinRow) : null;
  } catch {
    return mockPlays.find((p) => p.slug === slug) ?? null;
  }
}
