"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { translateAuthError } from "@/lib/auth/error-messages";
import { getBaseUrl } from "@/lib/utils/base-url";
import type { AuthActionState } from "@/lib/auth/auth-action-state";
import type { ToggleResult } from "@/lib/likes/actions";

const NOT_CONFIGURED_MESSAGE =
  "La autenticación todavía no está configurada en este entorno (faltan las variables de Supabase).";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function signInWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  redirect("/");
}

export async function signUpWithPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      status: "error",
      message: "El nombre de usuario debe tener entre 3 y 20 caracteres: letras minúsculas, números o _.",
    };
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
    return { status: "error", message: translateAuthError(error.message) };
  }

  if (!data.session) {
    return {
      status: "check-email",
      message: "Te enviamos un email para confirmar tu cuenta. Revisá tu bandeja de entrada.",
    };
  }

  redirect("/");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect("/");
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
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Iniciá sesión." };
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { status: "error", message: "No pudimos eliminar tu cuenta. Probá de nuevo en unos minutos." };
  }

  await supabase.auth.signOut();
  redirect("/");
}

export async function signInWithGoogleAction() {
  if (!isSupabaseConfigured()) {
    redirect("/login?error=not-configured");
  }

  const supabase = await createServerSupabaseClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${baseUrl}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}
