"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { slugify } from "@/lib/utils/slugify";
import type { PlayCategory, VideoSourceEnum } from "@/types/database";

export interface CreatePlayInput {
  title: string;
  mapId: string;
  category: PlayCategory;
  description: string;
  videoUrl: string;
  videoSource: VideoSourceEnum;
}

export async function createPlayAction(
  input: CreatePlayInput,
): Promise<{ status: "error"; message: string }> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }
  if (!input.title.trim()) {
    return { status: "error", message: "La jugada necesita un título." };
  }
  if (!input.videoUrl.trim()) {
    return { status: "error", message: "Las jugadas necesitan un video como evidencia." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para subir una jugada." };
  }

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .insert({ source: input.videoSource, url: input.videoUrl.trim(), uploader_id: user.id })
    .select("id")
    .single();

  if (videoError || !video) {
    return { status: "error", message: "No pudimos guardar el video. Revisá el link." };
  }

  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 8)}`;

  const { error } = await supabase.from("plays").insert({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    map_id: input.mapId,
    category: input.category,
    video_id: video.id,
    author_id: user.id,
  });

  if (error) {
    return { status: "error", message: "No pudimos publicar la jugada. Intentá de nuevo." };
  }

  revalidatePath("/plays");
  redirect(`/plays/${slug}`);
}
