"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum, UserRole } from "@/types/database";
import type { ToggleResult } from "@/lib/likes/actions";

const MODERATABLE_TABLE: Partial<Record<ContentTypeEnum, "lineups" | "boosts" | "plays">> = {
  lineup: "lineups",
  boost: "boosts",
  play: "plays",
};

export async function toggleBanAction(userId: string, currentlyBanned: boolean): Promise<ToggleResult> {
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
  if (userId === user.id) {
    return { status: "error", message: "No podés banear tu propia cuenta." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ banned_at: currentlyBanned ? null : new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { status: "error", message: "No pudimos actualizar el estado de la cuenta." };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}

export async function setRoleAction(userId: string, role: UserRole): Promise<ToggleResult> {
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
  if (userId === user.id) {
    return { status: "error", message: "No podés cambiar tu propio rol." };
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    return { status: "error", message: "No pudimos cambiar el rol de esa cuenta." };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}

export async function toggleVerifiedAction(
  lineupId: string,
  currentlyVerified: boolean,
  pathToRevalidate: string,
): Promise<ToggleResult> {
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

  const { error } = await supabase.from("lineups").update({ verified: !currentlyVerified }).eq("id", lineupId);

  if (error) {
    return { status: "error", message: "No pudimos actualizar la verificación del lineup." };
  }

  revalidatePath("/admin");
  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}

export async function removeContentAction(
  contentType: ContentTypeEnum,
  contentId: string,
  pathToRevalidate: string,
): Promise<ToggleResult> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  const table = MODERATABLE_TABLE[contentType];
  if (!table) {
    return { status: "error", message: "Tipo de contenido no soportado." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  const { error } = await supabase.from(table).update({ status: "removed" }).eq("id", contentId);

  if (error) {
    return { status: "error", message: "No pudimos eliminar el contenido." };
  }

  revalidatePath("/admin");
  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}
