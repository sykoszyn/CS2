"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum } from "@/types/database";
import type { ToggleResult } from "@/lib/likes/actions";

export async function toggleFavoriteAction(
  contentType: ContentTypeEnum,
  contentId: string,
  currentlyFavorited: boolean,
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
    return { status: "error", message: t("favorites.loginRequired") };
  }

  const { error } = currentlyFavorited
    ? await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("content_type", contentType)
        .eq("content_id", contentId)
    : await supabase
        .from("favorites")
        .insert({ user_id: user.id, content_type: contentType, content_id: contentId });

  if (error) {
    return { status: "error", message: t("favorites.failed") };
  }

  revalidatePath(pathToRevalidate);
  revalidatePath("/favorites");
  return { status: "ok" };
}
