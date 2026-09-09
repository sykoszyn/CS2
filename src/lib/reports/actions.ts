"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum, ReportReason } from "@/types/database";
import type { ToggleResult } from "@/lib/likes/actions";

const MAX_DESCRIPTION_LENGTH = 1000;

const REPORT_TABLE: Partial<Record<ContentTypeEnum, "lineups" | "boosts" | "plays">> = {
  lineup: "lineups",
  boost: "boosts",
  play: "plays",
};

export async function submitReportAction(
  contentType: ContentTypeEnum,
  contentId: string,
  reason: ReportReason,
  description: string,
  pathToRevalidate: string,
): Promise<ToggleResult> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "La base de datos no está configurada todavía." };
  }

  const trimmedDescription = description.trim().slice(0, MAX_DESCRIPTION_LENGTH);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión para reportar contenido." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    content_type: contentType,
    content_id: contentId,
    reason,
    description: trimmedDescription || null,
  });

  if (error) {
    return { status: "error", message: "No pudimos enviar tu reporte. Tu cuenta puede estar suspendida." };
  }

  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}

export async function resolveReportAction(
  reportId: string,
  action: "approve" | "reject",
  contentType: ContentTypeEnum,
  contentId: string,
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

  if (action === "approve") {
    const table = REPORT_TABLE[contentType];
    if (!table) {
      return { status: "error", message: "Tipo de contenido no soportado." };
    }
    const { error: contentError } = await supabase.from(table).update({ status: "removed" }).eq("id", contentId);
    if (contentError) {
      return { status: "error", message: "No pudimos eliminar el contenido reportado." };
    }
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) {
    return { status: "error", message: "No pudimos resolver el reporte." };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}
