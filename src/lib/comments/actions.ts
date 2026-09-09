"use server";

import { revalidatePath } from "next/cache";
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
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return { status: "error", message: "Escribí algo antes de comentar." };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { status: "error", message: "El comentario es demasiado largo." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para comentar." };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, content_type: contentType, content_id: contentId, body: trimmed });

  if (error) {
    return { status: "error", message: "No pudimos publicar tu comentario." };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}

export async function deleteCommentAction(commentId: string, pathToRevalidate: string): Promise<ToggleResult> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  const { error } = await supabase
    .from("comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return { status: "error", message: "No pudimos eliminar el comentario." };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}
