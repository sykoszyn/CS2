import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { CommentWithAuthor } from "@/types/content";
import type { ContentTypeEnum } from "@/types/database";

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string | null } | null;
}

export async function getComments(
  contentType: ContentTypeEnum,
  contentId: string,
): Promise<CommentWithAuthor[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data, error }, { data: userData }] = await Promise.all([
      supabase
        .from("comments")
        .select("id, body, created_at, user_id, profiles ( username, avatar_url )")
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .order("created_at", { ascending: true }),
      supabase.auth.getUser(),
    ]);

    if (error) throw error;

    const currentUserId = userData.user?.id;

    return ((data as unknown as CommentRow[]) ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorUsername: row.profiles?.username ?? "usuario",
      authorAvatarUrl: row.profiles?.avatar_url ?? undefined,
      isOwn: row.user_id === currentUserId,
    }));
  } catch {
    return [];
  }
}
