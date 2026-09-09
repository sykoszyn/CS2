import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export interface UserAchievement {
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  earnedAt: string;
}

interface AchievementRow {
  earned_at: string;
  achievements: { slug: string; name: string; description: string; icon: string | null } | null;
}

/** Achievements are only ever awarded by DB triggers (see 0005_gamification.sql) — this is read-only. */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("user_achievements")
      .select("earned_at, achievements ( slug, name, description, icon )")
      .eq("user_id", userId)
      .order("earned_at", { ascending: true });

    if (error) throw error;

    return ((data as unknown as AchievementRow[]) ?? [])
      .filter((row) => row.achievements)
      .map((row) => ({
        slug: row.achievements!.slug,
        name: row.achievements!.name,
        description: row.achievements!.description,
        icon: row.achievements!.icon,
        earnedAt: row.earned_at,
      }));
  } catch {
    return [];
  }
}
