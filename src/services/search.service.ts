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

/**
 * Phase-1 in-memory search over mock content. This is the seam that gets
 * swapped for a Postgres full-text (`tsvector`) query against Supabase in
 * a later phase — callers only depend on `search()`, not on where the data
 * comes from.
 */
export function search(query: string, limit = 8): SearchResult[] {
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
