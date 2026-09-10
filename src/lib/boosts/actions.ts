"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { slugify } from "@/lib/utils/slugify";
import type { BoostCategory, SideType, VideoSourceEnum } from "@/types/database";

export interface CreateBoostInput {
  name: string;
  mapId: string;
  location: string;
  playersRequired: 2 | 3;
  category: BoostCategory;
  side: SideType;
  difficulty: number;
  description: string;
  imageUrl: string;
  videoUrl: string;
  videoSource: VideoSourceEnum;
}

export async function createBoostAction(
  input: CreateBoostInput,
): Promise<{ status: "error"; message: string }> {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations("errors.boosts"),
    getTranslations("errors"),
    getLocale(),
  ]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }
  if (!input.name.trim()) {
    return { status: "error", message: t("nameRequired") };
  }
  if (!input.location.trim()) {
    return { status: "error", message: t("locationRequired") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginToCreate") };
  }

  let videoId: string | null = null;
  if (input.videoUrl.trim()) {
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .insert({ source: input.videoSource, url: input.videoUrl.trim(), uploader_id: user.id })
      .select("id")
      .single();

    if (videoError || !video) {
      return { status: "error", message: t("videoFailed") };
    }
    videoId = video.id;
  }

  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("boosts").insert({
    slug,
    name: input.name.trim(),
    map_id: input.mapId,
    location: input.location.trim(),
    players_required: input.playersRequired,
    category: input.category,
    side: input.side,
    difficulty: input.difficulty,
    description: input.description.trim(),
    image_url: input.imageUrl.trim() || null,
    video_id: videoId,
    author_id: user.id,
  });

  if (error) {
    return { status: "error", message: t("createFailed") };
  }

  revalidatePath("/boosts");
  redirect({ href: `/boosts/${slug}`, locale });
  return undefined as never;
}
