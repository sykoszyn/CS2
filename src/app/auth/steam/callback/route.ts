import { NextResponse } from "next/server";
import { verifySteamCallback } from "@/lib/auth/steam";
import { establishSteamSession } from "@/lib/auth/steam-session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const steamId = await verifySteamCallback(searchParams);
  if (!steamId) {
    return NextResponse.redirect(`${origin}/login?error=steam`);
  }

  const ok = await establishSteamSession(steamId);
  if (!ok) {
    return NextResponse.redirect(`${origin}/login?error=steam`);
  }

  return NextResponse.redirect(origin);
}
