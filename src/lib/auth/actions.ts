"use server";

import { redirect as externalRedirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { translateAuthError } from "@/lib/auth/error-messages";
import { getBaseUrl } from "@/lib/utils/base-url";
import type { AuthActionState } from "@/lib/auth/auth-action-state";
import type { ToggleResult } from "@/lib/likes/actions";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function signInWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const [t, locale] = await Promise.all([getTranslations("auth.errors"), getLocale()]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfiguredFull") };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: translateAuthError(error.message, t) };
  }

  redirect({ href: "/", locale });
  // redirect() always throws (NEXT_REDIRECT) — unlike next/navigation's
  // version, next-intl's wrapper isn't typed `never`, so this line is here
  // only to satisfy the function's return type; it never actually runs.
  return undefined as never;
}

export async function signUpWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const [t, locale] = await Promise.all([getTranslations("auth.errors"), getLocale()]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfiguredFull") };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return { status: "error", message: t("usernameFormat") };
  }

  const supabase = await createServerSupabaseClient();
  const baseUrl = await getBaseUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: translateAuthError(error.message, t) };
  }

  if (!data.session) {
    return { status: "check-email", message: t("checkEmail") };
  }

  redirect({ href: "/", locale });
  // redirect() always throws (NEXT_REDIRECT) — unlike next/navigation's
  // version, next-intl's wrapper isn't typed `never`, so this line is here
  // only to satisfy the function's return type; it never actually runs.
  return undefined as never;
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect({ href: "/", locale: await getLocale() });
}

/**
 * Deletes the signed-in user's account permanently — required for both app
 * stores (Apple requires in-app account deletion for any app with sign-up;
 * Google Play's Data Safety form expects the same). Deleting the
 * `auth.users` row cascades through the schema per `0001_init.sql`: private
 * data (likes, favorites, comments, ratings, follows, notifications) is
 * removed, while content the user published (lineups, boosts, plays,
 * guides) stays up with its `author_id` set to null, same as any other
 * "author account no longer exists" case the UI already handles.
 */
export async function deleteAccountAction(): Promise<ToggleResult> {
  const [t, locale] = await Promise.all([getTranslations("auth.errors"), getLocale()]);
  if (!isSupabaseConfigured()) {
    return { status: "error", message: t("notConfiguredFull") };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: t("loginRequired") };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { status: "error", message: t("deleteAccountFailed") };
  }

  await supabase.auth.signOut();
  redirect({ href: "/", locale });
  // redirect() always throws (NEXT_REDIRECT) — unlike next/navigation's
  // version, next-intl's wrapper isn't typed `never`, so this line is here
  // only to satisfy the function's return type; it never actually runs.
  return undefined as never;
}

export async function signInWithGoogleAction() {
  const locale = await getLocale();
  if (!isSupabaseConfigured()) {
    redirect({ href: "/login?error=not-configured", locale });
  }

  const supabase = await createServerSupabaseClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${baseUrl}/auth/callback` },
  });

  if (error || !data.url) {
    redirect({ href: "/login?error=oauth", locale });
  }

  // Google's own consent URL — an absolute external address, not an app
  // route, so it must bypass the locale-aware redirect (which only knows
  // how to prefix internal pathnames).
  externalRedirect(data.url as string);
}
