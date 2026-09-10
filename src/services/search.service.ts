import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { maps } from "@/lib/mock/maps";

export type SearchResultType = "map" | "lineup" | "boost" | "play" | "guide";

/**
 * `mapSlug` is returned separately from `type` (rather than a pre-built
 * "Lineup · mirage" subtitle) so the UI can render it in whatever language
 * the visitor is using — building that string in SQL would hardcode Spanish.
 */
export interface SearchResult {
  type: SearchResultType;
  title: string;
  mapSlug: string | null;
  href: string;
}

const HREF_PREFIX: Record<SearchResultType, string> = {
  map: "/maps",
  lineup: "/lineups",
  boost: "/boosts",
  play: "/plays",
  guide: "/guides",
};

/**
 * Maps are real static reference data (the 8 actual CS2 maps), not
 * user-generated content — safe to search even when Supabase is down.
 * Lineups/boosts/plays/guides have no offline fallback: without a live
 * query there is nothing genuine to show, so they simply return no results.
 */
function searchMapsOnly(query: string, limit: number): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];
  for (const map of maps) {
    if (map.name.toLowerCase().includes(q) || map.slug.includes(q)) {
      results.push({ type: "map", title: map.name, mapSlug: map.slug, href: `/maps/${map.slug}` });
    }
  }
  return results.slice(0, limit);
}

/**
 * Full-text search against `search_content()` (Postgres `tsvector`,
 * `supabase/migrations/0007_search.sql` + `0009_search_i18n.sql`) across
 * maps/lineups/boosts/plays/guides, ranked by relevance. Falls back to a
 * maps-only search when Supabase isn't configured or the query fails —
 * no fabricated lineup/boost/play/guide results.
 */
export async function search(query: string, limit = 8): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  if (!isSupabaseConfigured()) return searchMapsOnly(q, limit);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.rpc("search_content", { query: q, result_limit: limit });
    if (error) throw error;

    return (data ?? []).map((row) => ({
      type: row.content_type as SearchResultType,
      title: row.title,
      mapSlug: row.map_slug,
      href: `${HREF_PREFIX[row.content_type as SearchResultType]}/${row.slug}`,
    }));
  } catch {
    return searchMapsOnly(q, limit);
  }
}
