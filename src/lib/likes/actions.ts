"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum } from "@/types/database";

export type ToggleResult = { status: "ok" } | { status: "error"; message: string };

export async function toggleLikeAction(
  contentType: ContentTypeEnum,
  contentId: string,
  currentlyLiked: boolean,
  pathToRevalidate: string,
): Promise<ToggleResult> {
  const t = await getTranslations("errors");
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfigured") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("likes.loginRequired") };
  }

  const { error } = currentlyLiked
    ? await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
    : await supabase.from("likes").insert({ user_id: user.id, content_type: contentType, content_id: contentId });

  if (error) {
    return { status: "error", message: t("likes.failed") };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}
