"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum } from "@/types/database";
import type { ToggleResult } from "@/lib/likes/actions";

const MAX_COMMENT_LENGTH = 2000;

export async function postCommentAction(
  contentType: ContentTypeEnum,
  contentId: string,
  body: string,
  pathToRevalidate: string,
): Promise<ToggleResult> {
  const t = await getTranslations("errors");
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfigured") };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { status: "error", message: t("comments.empty") };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { status: "error", message: t("comments.tooLong") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("comments.loginRequired") };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, content_type: contentType, content_id: contentId, body: trimmed });

  if (error) {
    return { status: "error", message: t("comments.postFailed") };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}

export async function deleteCommentAction(commentId: string, pathToRevalidate: string): Promise<ToggleResult> {
  const t = await getTranslations("errors");
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfigured") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginRequired") };
  }

  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: t("comments.deleteFailed") };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}
