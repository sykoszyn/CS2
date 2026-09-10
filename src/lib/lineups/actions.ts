"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { slugify } from "@/lib/utils/slugify";
import type { RatingActionState } from "@/lib/lineups/rating-action-state";
import type {
  ClickTypeEnum,
  DistanceType,
  GrenadeTypeEnum,
  LineupSituation,
  SideType,
  VideoSourceEnum,
} from "@/types/database";

export async function submitRatingAction(
  _prev: RatingActionState,
  formData: FormData,
): Promise<RatingActionState> {
  const t = await getTranslations("errors.lineups");
  const tCommon = await getTranslations("errors");
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }

  const lineupId = String(formData.get("lineupId") ?? "");
  const lineupSlug = String(formData.get("lineupSlug") ?? "");
  const stars = Number(formData.get("stars"));
  const workedValue = formData.get("worked");

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { status: "error", message: t("ratingRange") };
  }
  if (workedValue !== "true" && workedValue !== "false") {
    return { status: "error", message: t("workedRequired") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginToRate") };
  }

  const { error } = await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, lineup_id: lineupId, stars, worked: workedValue === "true" },
      { onConflict: "user_id,lineup_id" },
    );

  if (error) {
    return { status: "error", message: t("ratingFailed") };
  }

  revalidatePath(`/lineups/${lineupSlug}`);
  return { status: "success", message: t("ratingThanks") };
}

export interface CreateLineupStepInput {
  order: number;
  title: string;
  instruction: string;
  jumpthrow: boolean;
  clickType: ClickTypeEnum | "";
}

export interface CreateLineupInput {
  name: string;
  mapId: string;
  grenadeType: GrenadeTypeEnum;
  side: SideType;
  throwZone: string;
  targetZone: string;
  situation: LineupSituation;
  difficulty: number;
  distance: DistanceType;
  videoUrl: string;
  videoSource: VideoSourceEnum;
  tags: string[];
  steps: CreateLineupStepInput[];
}

export async function createLineupAction(
  input: CreateLineupInput,
): Promise<{ status: "error"; message: string }> {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations("errors.lineups"),
    getTranslations("errors"),
    getLocale(),
  ]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }

  if (!input.name.trim()) {
    return { status: "error", message: t("nameRequired") };
  }
  if (input.steps.length === 0) {
    return { status: "error", message: t("stepRequired") };
  }
  for (const step of input.steps) {
    if (!step.title.trim() || !step.instruction.trim()) {
      return { status: "error", message: t("stepsIncomplete") };
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginToCreate") };
  }

  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 8)}`;

  const payload = {
    slug,
    name: input.name.trim(),
    map_id: input.mapId,
    grenade_type: input.grenadeType,
    side: input.side,
    throw_zone: input.throwZone.trim(),
    target_zone: input.targetZone.trim(),
    situation: input.situation,
    difficulty: input.difficulty,
    distance: input.distance,
    video_url: input.videoUrl.trim(),
    video_source: input.videoSource,
    steps: input.steps.map((s) => ({
      order: s.order,
      title: s.title.trim(),
      instruction: s.instruction.trim(),
      jumpthrow: s.jumpthrow,
      clickType: s.clickType,
    })),
  };

  const { data: newLineupId, error } = await supabase.rpc("create_lineup_with_steps", { payload });

  if (error || !newLineupId) {
    return { status: "error", message: t("createFailed") };
  }

  const tagSlugs = [...new Set(input.tags.map((tag) => slugify(tag)).filter(Boolean))];
  if (tagSlugs.length > 0) {
    await supabase
      .from("tags")
      .upsert(
        tagSlugs.map((s) => ({ slug: s, name: s })),
        { onConflict: "slug", ignoreDuplicates: true },
      );

    const { data: allTags } = await supabase.from("tags").select("id").in("slug", tagSlugs);

    if (allTags && allTags.length > 0) {
      await supabase.from("content_tags").insert(
        allTags.map((tag) => ({
          content_type: "lineup" as const,
          content_id: newLineupId,
          tag_id: tag.id,
        })),
      );
    }
  }

  revalidatePath("/lineups");
  redirect({ href: `/lineups/${slug}`, locale });
  return undefined as never;
}
