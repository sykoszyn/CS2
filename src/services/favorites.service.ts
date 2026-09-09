import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum } from "@/types/database";

export async function getFavoriteState(contentType: ContentTypeEnum, contentId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export interface UserFavoriteIds {
  lineupIds: string[];
  boostIds: string[];
  playIds: string[];
}

/** All of the current user's favorited content ids, grouped by type — used to build /favorites. */
export async function getUserFavoriteIds(): Promise<UserFavoriteIds> {
  const empty: UserFavoriteIds = { lineupIds: [], boostIds: [], playIds: [] };
  if (!isSupabaseConfigured()) return empty;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty;

    const { data } = await supabase.from("favorites").select("content_type, content_id").eq("user_id", user.id);
    if (!data) return empty;

    return {
      lineupIds: data.filter((f) => f.content_type === "lineup").map((f) => f.content_id),
      boostIds: data.filter((f) => f.content_type === "boost").map((f) => f.content_id),
      playIds: data.filter((f) => f.content_type === "play").map((f) => f.content_id),
    };
  } catch {
    return empty;
  }
}
