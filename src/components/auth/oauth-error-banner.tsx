"use client";

import { useTranslations } from "next-intl";

const errorKeys: Record<string, string> = {
  "not-configured": "notConfigured",
  oauth: "oauth",
  steam: "steam",
  auth: "auth",
};

export function OAuthErrorBanner({ error }: { error?: string }) {
  const t = useTranslations("auth.errors");
  if (!error) return null;
  const message = t(errorKeys[error] ?? "generic");

  return (
    <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-center text-xs text-danger">
      {message}
    </p>
  );
}
