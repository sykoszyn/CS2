import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchSteamPlayerSummary } from "@/lib/auth/steam";

function syntheticSteamEmail(steamId: string): string {
  return `steam-${steamId}@steam.users.cs2academy.internal`;
}

/**
 * Bridges a verified Steam identity into Supabase Auth. Steam has no email
 * or password, so we mint a synthetic, non-deliverable email as the unique
 * identity key and establish the session server-side via an admin-generated
 * magic-link token — nothing is ever emailed, the token is consumed
 * immediately in this same request.
 *
 * Returns true if a session was established.
 */
export async function establishSteamSession(steamId: string): Promise<boolean> {
  const admin = createAdminSupabaseClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("steam_id", steamId)
    .maybeSingle();

  let email: string;

  if (existingProfile) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(existingProfile.id);
    if (userError || !userData.user?.email) return false;
    email = userData.user.email;
  } else {
    const summary = await fetchSteamPlayerSummary(steamId);
    const username = `steam_${steamId}`;
    email = syntheticSteamEmail(steamId);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        username,
        display_name: summary?.personaName ?? username,
      },
    });

    if (createError || !created.user) return false;

    // handle_new_user() created the profile row from user_metadata; attach the
    // Steam identity and avatar now that we have it.
    await admin
      .from("profiles")
      .update({ steam_id: steamId, avatar_url: summary?.avatarUrl ?? null })
      .eq("id", created.user.id);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData.properties?.hashed_token) return false;

  const supabase = await createServerSupabaseClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  return !verifyError;
}
