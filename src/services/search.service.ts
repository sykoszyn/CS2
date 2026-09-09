import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { maps } from "@/lib/mock/maps";
import { lineups } from "@/lib/mock/lineups";
import { boosts } from "@/lib/mock/boosts";
import { plays } from "@/lib/mock/plays";
import { guides } from "@/lib/mock/guides";

export type SearchResultType = "map" | "lineup" | "boost" | "play" | "guide";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string;
}

const HREF_PREFIX: Record<SearchResultType, string> = {
  map: "/maps",
  lineup: "/lineups",
  boost: "/boosts",
  play: "/plays",
  guide: "/guides",
};

function searchMock(query: string, limit: number): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const map of maps) {
    if (map.name.toLowerCase().includes(q) || map.slug.includes(q)) {
      results.push({ type: "map", title: map.name, subtitle: "Mapa", href: `/maps/${map.slug}` });
    }
  }

  for (const lineup of lineups) {
    const haystack = `${lineup.name} ${lineup.mapSlug} ${lineup.targetZone} ${lineup.tags.join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        type: "lineup",
        title: lineup.name,
        subtitle: `Lineup · ${lineup.mapSlug}`,
        href: `/lineups/${lineup.slug}`,
      });
    }
  }

  for (const boost of boosts) {
    if (`${boost.name} ${boost.location} ${boost.mapSlug}`.toLowerCase().includes(q)) {
      results.push({
        type: "boost",
        title: boost.name,
        subtitle: `Boost · ${boost.mapSlug}`,
        href: `/boosts/${boost.slug}`,
      });
    }
  }

  for (const play of plays) {
    if (`${play.title} ${play.mapSlug} ${play.category}`.toLowerCase().includes(q)) {
      results.push({
        type: "play",
        title: play.title,
        subtitle: `Jugada · ${play.mapSlug}`,
        href: `/plays/${play.slug}`,
      });
    }
  }

  for (const guide of guides) {
    if (`${guide.title} ${guide.summary}`.toLowerCase().includes(q)) {
      results.push({ type: "guide", title: guide.title, subtitle: "Guía", href: `/guides/${guide.slug}` });
    }
  }

  return results.slice(0, limit);
}

/**
 * Full-text search against `search_content()` (Postgres `tsvector`,
 * `supabase/migrations/0007_search.sql`) across maps/lineups/boosts/plays/guides,
 * ranked by relevance. Falls back to the in-memory mock search when Supabase
 * isn't configured or the query fails, same graceful-degradation pattern as
 * every other service in the app.
 */
export async function search(query: string, limit = 8): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  if (!isSupabaseConfigured()) return searchMock(q, limit);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("search_content", { query: q, result_limit: limit });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      type: row.content_type as SearchResultType,
      title: row.title,
      subtitle: row.subtitle,
      href: `${HREF_PREFIX[row.content_type as SearchResultType]}/${row.slug}`,
    }));
  } catch {
    return searchMock(q, limit);
  }
}
