import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getMapBySlug } from "@/services/maps.service";
import { boosts as mockBoosts, getBoostsByMap as getMockBoostsByMap } from "@/lib/mock/boosts";
import type { Boost } from "@/types/content";
import type { VideoRow } from "@/types/database";

const BOOST_SELECT = `
  *,
  maps ( slug ),
  profiles ( username ),
  videos ( * )
`;

interface BoostJoinRow {
  id: string;
  slug: string;
  name: string;
  location: string;
  players_required: 2 | 3;
  category: Boost["category"];
  side: Boost["side"];
  difficulty: number;
  description: string;
  image_url: string | null;
  maps: { slug: string } | null;
  profiles: { username: string } | null;
  videos: VideoRow | null;
  is_demo: boolean;
}

function toBoost(row: BoostJoinRow): Boost {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    mapSlug: row.maps?.slug ?? "",
    location: row.location,
    playersRequired: row.players_required,
    category: row.category,
    side: row.side,
    difficulty: row.difficulty as Boost["difficulty"],
    description: row.description,
    authorUsername: row.profiles?.username,
    imageUrl: row.image_url ?? "",
    video: row.videos
      ? {
          id: row.videos.id,
          source: row.videos.source,
          url: row.videos.url,
          durationSeconds: row.videos.duration_seconds ?? undefined,
          thumbnailUrl: row.videos.thumbnail_url ?? undefined,
        }
      : undefined,
    isDemo: row.is_demo,
  };
}

export async function getBoosts(): Promise<Boost[]> {
  if (!isSupabaseConfigured()) return mockBoosts;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("boosts")
      .select(BOOST_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as BoostJoinRow[]).map(toBoost);
  } catch {
    return mockBoosts;
  }
}

export async function getBoostsByMap(mapSlug: string): Promise<Boost[]> {
  if (!isSupabaseConfigured()) return getMockBoostsByMap(mapSlug);

  try {
    const map = await getMapBySlug(mapSlug);
    if (!map) return [];

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("boosts")
      .select(BOOST_SELECT)
      .eq("map_id", map.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as BoostJoinRow[]).map(toBoost);
  } catch {
    return getMockBoostsByMap(mapSlug);
  }
}

export async function getBoostBySlug(slug: string): Promise<Boost | null> {
  if (!isSupabaseConfigured()) return mockBoosts.find((b) => b.slug === slug) ?? null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("boosts")
      .select(BOOST_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toBoost(data as unknown as BoostJoinRow) : null;
  } catch {
    return mockBoosts.find((b) => b.slug === slug) ?? null;
  }
}
