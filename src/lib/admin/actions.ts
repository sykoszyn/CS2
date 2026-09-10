"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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
  const [t, tCommon] = await Promise.all([getTranslations("errors.admin"), getTranslations("errors")]);
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
  if (userId === user.id) {
    return { status: "error", message: t("cannotBanSelf") };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ banned_at: currentlyBanned ? null : new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { status: "error", message: t("banFailed") };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}

export async function setRoleAction(userId: string, role: UserRole): Promise<ToggleResult> {
  const [t, tCommon] = await Promise.all([getTranslations("errors.admin"), getTranslations("errors")]);
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
  if (userId === user.id) {
    return { status: "error", message: t("cannotChangeOwnRole") };
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    return { status: "error", message: t("roleChangeFailed") };
  }

  revalidatePath("/admin");
  return { status: "ok" };
}

export async function toggleVerifiedAction(
  lineupId: string,
  currentlyVerified: boolean,
  pathToRevalidate: string,
): Promise<ToggleResult> {
  const [t, tCommon] = await Promise.all([getTranslations("errors.admin"), getTranslations("errors")]);
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

  const { error } = await supabase.from("lineups").update({ verified: !currentlyVerified }).eq("id", lineupId);

  if (error) {
    return { status: "error", message: t("verifyFailed") };
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
  const [t, tCommon] = await Promise.all([getTranslations("errors.admin"), getTranslations("errors")]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: tCommon("notConfigured") };
  }

  const table = MODERATABLE_TABLE[contentType];
  if (!table) {
    return { status: "error", message: t("unsupportedType") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: tCommon("loginRequired") };
  }

  const { error } = await supabase.from(table).update({ status: "removed" }).eq("id", contentId);

  if (error) {
    return { status: "error", message: t("removeFailed") };
  }

  revalidatePath("/admin");
  revalidatePath(pathToRevalidate);
  return { status: "ok" };
}
