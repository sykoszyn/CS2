"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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
  const [t, tCommon] = await Promise.all([getTranslations("errors.reports"), getTranslations("errors")]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }

  const trimmedDescription = description.trim().slice(0, MAX_DESCRIPTION_LENGTH);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginToReport") };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    content_type: contentType,
    content_id: contentId,
    reason,
    description: trimmedDescription || null,
  });

  if (error) {
    return { status: "error", message: t("submitFailed") };
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
  const [t, tCommon] = await Promise.all([getTranslations("errors.reports"), getTranslations("errors")]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: tCommon("loginRequired") };
  }

  if (action === "approve") {
    const table = REPORT_TABLE[contentType];
    if (!table) {
      return { status: "error", message: t("unsupportedType") };
    }
    const { error: contentError } = await supabase.from(table).update({ status: "removed" }).eq("id", contentId);
    if (contentError) {
      return { status: "error", message: t("removeFailed") };
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
    return { status: "error", message: t("resolveFailed") };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}
