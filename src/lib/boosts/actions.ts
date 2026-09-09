"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }
  if (!input.name.trim()) {
    return { status: "error", message: "El boost necesita un nombre." };
  }
  if (!input.location.trim()) {
    return { status: "error", message: "Indicá la ubicación del boost." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para subir un boost." };
  }

  let videoId: string | null = null;
  if (input.videoUrl.trim()) {
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .insert({ source: input.videoSource, url: input.videoUrl.trim(), uploader_id: user.id })
      .select("id")
      .single();

    if (videoError || !video) {
      return { status: "error", message: "No pudimos guardar el video. Revisá el link." };
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
    return { status: "error", message: "No pudimos crear el boost. Revisá los datos e intentá de nuevo." };
  }

  revalidatePath("/boosts");
  redirect(`/boosts/${slug}`);
}
