import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  maps as mockMaps,
  mapZones as mockMapZones,
  getMapBySlug as getMockMapBySlug,
} from "@/lib/mock/maps";
import type { GameMap, MapZone } from "@/types/content";
import type { MapRow, MapZoneRow } from "@/types/database";

function toGameMap(row: MapRow): GameMap {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? "",
    thumbnailUrl: row.thumbnail_url ?? "",
    radarUrl: row.radar_url ?? "",
    version: row.version,
    active: row.active,
    bombsites: row.bombsites as ("A" | "B")[],
  };
}

function toMapZone(row: MapZoneRow): MapZone {
  return {
    id: row.id,
    mapId: row.map_id,
    name: row.name,
    aliases: row.aliases,
    description: row.description,
    x: Number(row.x),
    y: Number(row.y),
    imageUrl: row.image_url ?? undefined,
  };
}

/**
 * Maps + calls now read from Supabase (Fase 2). Every function falls back to
 * the bundled demo data when Supabase isn't configured, or if a query
 * errors — public map browsing should never hard-crash for visitors because
 * of a transient DB hiccup.
 */
export async function getMaps(): Promise<GameMap[]> {
  if (!isSupabaseConfigured()) return mockMaps;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("maps").select("*").eq("active", true).order("name");
    if (error) throw error;
    return (data ?? []).map(toGameMap);
  } catch {
    return mockMaps;
  }
}

export async function getMapBySlug(slug: string): Promise<GameMap | null> {
  if (!isSupabaseConfigured()) return getMockMapBySlug(slug) ?? null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("maps").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? toGameMap(data) : null;
  } catch {
    return getMockMapBySlug(slug) ?? null;
  }
}

export async function getMapZones(map: GameMap): Promise<MapZone[]> {
  if (!isSupabaseConfigured()) return mockMapZones[map.slug] ?? [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("map_zones")
      .select("*")
      .eq("map_id", map.id)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(toMapZone);
  } catch {
    return mockMapZones[map.slug] ?? [];
  }
}
