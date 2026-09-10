import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

// Routes that must never get a locale prefix: OAuth callbacks are fixed URLs
// registered with Google/Steam, and these are the root-level special files
// (manifest, robots, sitemap, service worker, OG image, icons, digital
// asset links) that live outside app/[locale] on purpose — see AGENTS.md
// notes in src/app for why. Redirecting any of these to add a locale
// prefix would just 404 them.
const LOCALE_EXEMPT_PREFIXES = [
  "/auth",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/icon.png",
  "/apple-icon.png",
  "/sw.js",
  "/.well-known",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isExempt = LOCALE_EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isExempt) {
    return updateSession(request);
  }

  const intlResponse = handleI18nRouting(request);
  // A locale redirect (e.g. "/" -> "/es") needs no session refresh here —
  // the redirected request re-runs this proxy and refreshes it then.
  if (intlResponse.headers.get("location")) return intlResponse;

  return updateSession(request, intlResponse);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
