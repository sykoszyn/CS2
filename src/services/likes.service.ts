import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum } from "@/types/database";

export interface LikeState {
  count: number;
  likedByMe: boolean;
}

/** Batch-fetches like counts + whether the current user liked each id, in a single query. */
export async function getLikeStates(
  contentType: ContentTypeEnum,
  contentIds: string[],
): Promise<Map<string, LikeState>> {
  const result = new Map<string, LikeState>(contentIds.map((id) => [id, { count: 0, likedByMe: false }]));
  if (!isSupabaseConfigured() || contentIds.length === 0) return result;

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data: rows }, { data: userData }] = await Promise.all([
      supabase.from("likes").select("content_id, user_id").eq("content_type", contentType).in("content_id", contentIds),
      supabase.auth.getUser(),
    ]);

    const currentUserId = userData.user?.id;
    for (const row of rows ?? []) {
      const state = result.get(row.content_id);
      if (!state) continue;
      state.count += 1;
      if (currentUserId && row.user_id === currentUserId) state.likedByMe = true;
    }
  } catch {
    // keep zeroed defaults
  }

  return result;
}

export async function getLikeState(contentType: ContentTypeEnum, contentId: string): Promise<LikeState> {
  const states = await getLikeStates(contentType, [contentId]);
  return states.get(contentId) ?? { count: 0, likedByMe: false };
}
