import { getLineups } from "@/services/lineups.service";
import { getPlays } from "@/services/plays.service";
import { getBoosts } from "@/services/boosts.service";
import { getLikeStates } from "@/services/likes.service";
import { getUserFavoriteIds } from "@/services/favorites.service";
import { guides } from "@/lib/mock/guides";
import type { FeedItem } from "@/types/content";

/**
 * The feed is derived from recent content, not a separate activity table —
 * one query per content type (each already fetches author/map), merged and
 * sorted by recency. Guides aren't DB-backed yet, so they come from mock and
 * never carry contentId (no like/save buttons on those cards).
 */
export async function getFeedItems(limit = 30): Promise<FeedItem[]> {
  const [lineups, plays, boosts] = await Promise.all([getLineups(), getPlays(), getBoosts()]);

  const lineupItems: FeedItem[] = lineups.map((l) => ({
    id: `lineup-${l.id}`,
    type: "lineup",
    username: l.authorUsername,
    title: `subió un nuevo lineup: ${l.name}`,
    targetSlug: l.slug,
    mapSlug: l.mapSlug,
    createdAt: l.createdAt,
    contentId: l.id,
  }));

  const playItems: FeedItem[] = plays.map((p) => ({
    id: `play-${p.id}`,
    type: "play",
    username: p.authorUsername,
    title: `publicó una jugada: ${p.title}`,
    targetSlug: p.slug,
    mapSlug: p.mapSlug,
    createdAt: p.createdAt,
    contentId: p.id,
  }));

  const boostItems: FeedItem[] = boosts
    .filter((b) => b.authorUsername)
    .map((b) => ({
      id: `boost-${b.id}`,
      type: "boost",
      username: b.authorUsername!,
      title: `agregó un boost: ${b.name}`,
      targetSlug: b.slug,
      mapSlug: b.mapSlug,
      createdAt: b.createdAt,
      contentId: b.id,
    }));

  const guideItems: FeedItem[] = guides.map((g) => ({
    id: `guide-${g.id}`,
    type: "guide",
    username: g.authorUsername,
    title: `creó una guía: ${g.title}`,
    targetSlug: g.slug,
    mapSlug: g.mapSlug,
    createdAt: g.createdAt,
  }));

  const merged = [...lineupItems, ...playItems, ...boostItems, ...guideItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  await attachSocialState(merged);

  return merged;
}

/** Mutates items in place, batching one like-query per content type instead of one per item. */
async function attachSocialState(items: FeedItem[]): Promise<void> {
  const byType = {
    lineup: items.filter((i) => i.type === "lineup" && i.contentId),
    play: items.filter((i) => i.type === "play" && i.contentId),
    boost: items.filter((i) => i.type === "boost" && i.contentId),
  };

  const [lineupLikes, playLikes, boostLikes, favoriteIds] = await Promise.all([
    getLikeStates("lineup", byType.lineup.map((i) => i.contentId!)),
    getLikeStates("play", byType.play.map((i) => i.contentId!)),
    getLikeStates("boost", byType.boost.map((i) => i.contentId!)),
    getUserFavoriteIds(),
  ]);

  const likeMaps = { lineup: lineupLikes, play: playLikes, boost: boostLikes };
  const favoriteSets = {
    lineup: new Set(favoriteIds.lineupIds),
    play: new Set(favoriteIds.playIds),
    boost: new Set(favoriteIds.boostIds),
  };

  for (const item of items) {
    if (!item.contentId || item.type === "guide") continue;
    const likeState = likeMaps[item.type].get(item.contentId);
    item.likeCount = likeState?.count ?? 0;
    item.likedByMe = likeState?.likedByMe ?? false;
    item.favoritedByMe = favoriteSets[item.type].has(item.contentId);
  }
}
