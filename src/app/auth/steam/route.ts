import { NextResponse } from "next/server";
import { buildSteamLoginUrl } from "@/lib/auth/steam";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=not-configured`);
  }

  const returnTo = `${origin}/auth/steam/callback`;
  return NextResponse.redirect(buildSteamLoginUrl(returnTo));
}
