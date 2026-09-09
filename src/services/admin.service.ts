import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ProfileRow } from "@/types/database";

export interface AdminDashboardCounts {
  maps: number;
  lineups: number;
  boosts: number;
  plays: number;
  guides: number;
  users: number;
  pendingReports: number;
  unverifiedLineups: number;
}

const EMPTY_COUNTS: AdminDashboardCounts = {
  maps: 0,
  lineups: 0,
  boosts: 0,
  plays: 0,
  guides: 0,
  users: 0,
  pendingReports: 0,
  unverifiedLineups: 0,
};

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  if (!isSupabaseConfigured()) return EMPTY_COUNTS;

  try {
    const supabase = await createServerSupabaseClient();
    const [maps, lineups, boosts, plays, guides, users, pendingReports, unverifiedLineups] = await Promise.all([
      supabase.from("maps").select("*", { count: "exact", head: true }),
      supabase.from("lineups").select("*", { count: "exact", head: true }).neq("status", "removed"),
      supabase.from("boosts").select("*", { count: "exact", head: true }).neq("status", "removed"),
      supabase.from("plays").select("*", { count: "exact", head: true }).neq("status", "removed"),
      supabase.from("guides").select("*", { count: "exact", head: true }).neq("status", "removed"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("lineups").select("*", { count: "exact", head: true }).eq("verified", false).neq("status", "removed"),
    ]);

    return {
      maps: maps.count ?? 0,
      lineups: lineups.count ?? 0,
      boosts: boosts.count ?? 0,
      plays: plays.count ?? 0,
      guides: guides.count ?? 0,
      users: users.count ?? 0,
      pendingReports: pendingReports.count ?? 0,
      unverifiedLineups: unverifiedLineups.count ?? 0,
    };
  } catch {
    return EMPTY_COUNTS;
  }
}

export async function getAllProfilesForAdmin(): Promise<ProfileRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export interface UnverifiedLineup {
  id: string;
  slug: string;
  name: string;
  authorUsername: string;
  mapSlug: string;
  createdAt: string;
}

export async function getUnverifiedLineups(): Promise<UnverifiedLineup[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("lineups")
      .select("id, slug, name, created_at, maps ( slug ), profiles ( username )")
      .eq("verified", false)
      .neq("status", "removed")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = data as unknown as {
      id: string;
      slug: string;
      name: string;
      created_at: string;
      maps: { slug: string } | null;
      profiles: { username: string } | null;
    }[];

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      authorUsername: row.profiles?.username ?? "comunidad",
      mapSlug: row.maps?.slug ?? "",
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
