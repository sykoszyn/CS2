import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getMapBySlug } from "@/services/maps.service";
import {
  lineups as mockLineups,
  getLineupBySlug as getMockLineupBySlug,
} from "@/lib/mock/lineups";
import type { Lineup, LineupMedia, LineupStep, Video } from "@/types/content";
import type { LineupMediaRow, LineupStepRow, VideoRow, GrenadeTypeEnum, SideType } from "@/types/database";

export interface LineupFilters {
  mapSlug?: string;
  side?: SideType;
  grenadeType?: GrenadeTypeEnum;
}

const LINEUP_SELECT = `
  *,
  maps ( slug ),
  profiles ( username ),
  videos ( * ),
  lineup_steps ( * ),
  lineup_media ( image_url, caption ),
  ratings ( stars, worked )
`;

type RatingAgg = { stars: number; worked: boolean };

function ratingAggregate(ratings: RatingAgg[]) {
  if (ratings.length === 0) return { ratingAvg: 0, ratingCount: 0, workedPercent: 0 };
  const avg = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
  const workedCount = ratings.filter((r) => r.worked).length;
  return {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: ratings.length,
    workedPercent: Math.round((workedCount / ratings.length) * 100),
  };
}

function toVideo(row: VideoRow | null): Video | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    source: row.source,
    url: row.url,
    durationSeconds: row.duration_seconds ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
  };
}

function toStep(row: LineupStepRow): LineupStep {
  return {
    order: row.step_order,
    title: row.title,
    instruction: row.instruction,
    imageUrl: row.image_url ?? "",
    jumpthrow: row.jumpthrow,
    clickType: row.click_type ?? undefined,
  };
}

function toMedia(row: Pick<LineupMediaRow, "image_url" | "caption">): LineupMedia {
  return { imageUrl: row.image_url, caption: row.caption ?? undefined };
}

// Shape returned by LINEUP_SELECT — looser than LineupRow because of the joins.
interface LineupJoinRow {
  id: string;
  slug: string;
  name: string;
  grenade_type: Lineup["grenadeType"];
  side: Lineup["side"];
  throw_zone: string;
  target_zone: string;
  situation: Lineup["situation"];
  difficulty: number;
  distance: Lineup["distance"];
  usage_count: number;
  verified: boolean;
  is_demo: boolean;
  created_at: string;
  maps: { slug: string } | null;
  profiles: { username: string } | null;
  videos: VideoRow | null;
  lineup_steps: LineupStepRow[];
  lineup_media: Pick<LineupMediaRow, "image_url" | "caption">[];
  ratings: RatingAgg[];
}

function toLineup(row: LineupJoinRow, tags: string[] = []): Lineup {
  const agg = ratingAggregate(row.ratings ?? []);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    mapSlug: row.maps?.slug ?? "",
    grenadeType: row.grenade_type,
    side: row.side,
    targetZone: row.target_zone,
    throwZone: row.throw_zone,
    situation: row.situation,
    difficulty: row.difficulty as Lineup["difficulty"],
    distance: row.distance,
    authorUsername: row.profiles?.username ?? "comunidad",
    video: toVideo(row.videos),
    steps: (row.lineup_steps ?? []).slice().sort((a, b) => a.step_order - b.step_order).map(toStep),
    media: (row.lineup_media ?? []).map(toMedia),
    tags,
    createdAt: row.created_at,
    usageCount: row.usage_count,
    likeCount: 0,
    ratingAvg: agg.ratingAvg,
    ratingCount: agg.ratingCount,
    workedPercent: agg.workedPercent,
    verified: row.verified,
    isDemo: row.is_demo,
  };
}

function filterMock(filters: LineupFilters): Lineup[] {
  return mockLineups.filter((l) => {
    if (filters.mapSlug && l.mapSlug !== filters.mapSlug) return false;
    if (filters.side && l.side !== filters.side) return false;
    if (filters.grenadeType && l.grenadeType !== filters.grenadeType) return false;
    return true;
  });
}

export async function getLineups(filters: LineupFilters = {}): Promise<Lineup[]> {
  if (!isSupabaseConfigured()) return filterMock(filters);

  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("lineups").select(LINEUP_SELECT).neq("status", "removed");

    if (filters.mapSlug) {
      const map = await getMapBySlug(filters.mapSlug);
      if (!map) return [];
      query = query.eq("map_id", map.id);
    }
    if (filters.side) query = query.eq("side", filters.side);
    if (filters.grenadeType) query = query.eq("grenade_type", filters.grenadeType);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return (data as unknown as LineupJoinRow[]).map((row) => toLineup(row));
  } catch {
    return filterMock(filters);
  }
}

export async function getLineupsByMap(mapSlug: string): Promise<Lineup[]> {
  return getLineups({ mapSlug: mapSlug as LineupFilters["mapSlug"] });
}

export async function getLineupsByIds(ids: string[]): Promise<Lineup[]> {
  if (ids.length === 0) return [];
  if (!isSupabaseConfigured()) return mockLineups.filter((l) => ids.includes(l.id));

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("lineups").select(LINEUP_SELECT).neq("status", "removed").in("id", ids);
    if (error) throw error;
    return (data as unknown as LineupJoinRow[]).map((row) => toLineup(row));
  } catch {
    return mockLineups.filter((l) => ids.includes(l.id));
  }
}

export async function getLineupsByAuthor(userId: string): Promise<Lineup[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("lineups")
      .select(LINEUP_SELECT)
      .eq("author_id", userId)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as LineupJoinRow[]).map((row) => toLineup(row));
  } catch {
    return [];
  }
}

export async function getLineupBySlug(slug: string): Promise<Lineup | null> {
  if (!isSupabaseConfigured()) return getMockLineupBySlug(slug) ?? null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("lineups")
      .select(LINEUP_SELECT)
      .eq("slug", slug)
      .neq("status", "removed")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const row = data as unknown as LineupJoinRow & { id: string };

    const { data: tagRows } = await supabase
      .from("content_tags")
      .select("tags ( slug )")
      .eq("content_type", "lineup")
      .eq("content_id", row.id);

    const tags = ((tagRows as unknown as { tags: { slug: string } | null }[]) ?? [])
      .map((t) => t.tags?.slug)
      .filter((t): t is string => Boolean(t));

    return toLineup(row, tags);
  } catch {
    return getMockLineupBySlug(slug) ?? null;
  }
}

/** The current user's own rating for a lineup, if any — null when logged out or not rated yet. */
export async function getUserRating(lineupId: string): Promise<{ stars: number; worked: boolean } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("ratings")
      .select("stars, worked")
      .eq("lineup_id", lineupId)
      .eq("user_id", user.id)
      .maybeSingle();

    return data ?? null;
  } catch {
    return null;
  }
}
