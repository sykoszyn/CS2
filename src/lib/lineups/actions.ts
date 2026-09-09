"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  const lineupId = String(formData.get("lineupId") ?? "");
  const lineupSlug = String(formData.get("lineupSlug") ?? "");
  const stars = Number(formData.get("stars"));
  const workedValue = formData.get("worked");

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { status: "error", message: "Elegí una calificación de 1 a 5 estrellas." };
  }
  if (workedValue !== "true" && workedValue !== "false") {
    return { status: "error", message: "Indicá si el lineup funcionó o no." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para calificar este lineup." };
  }

  const { error } = await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, lineup_id: lineupId, stars, worked: workedValue === "true" },
      { onConflict: "user_id,lineup_id" },
    );

  if (error) {
    return { status: "error", message: "No pudimos guardar tu calificación. Intentá de nuevo." };
  }

  revalidatePath(`/lineups/${lineupSlug}`);
  return { status: "success", message: "¡Gracias por tu calificación!" };
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
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  if (!input.name.trim()) {
    return { status: "error", message: "El lineup necesita un nombre." };
  }
  if (input.steps.length === 0) {
    return { status: "error", message: "Agregá al menos un paso." };
  }
  for (const step of input.steps) {
    if (!step.title.trim() || !step.instruction.trim()) {
      return { status: "error", message: "Todos los pasos necesitan título e instrucción." };
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para subir un lineup." };
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
    return { status: "error", message: "No pudimos crear el lineup. Revisá los datos e intentá de nuevo." };
  }

  const tagSlugs = [...new Set(input.tags.map((t) => slugify(t)).filter(Boolean))];
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
  redirect(`/lineups/${slug}`);
}
