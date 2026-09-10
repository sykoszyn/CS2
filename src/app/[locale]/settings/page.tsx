import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "settings" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/login?next=/settings", locale: await getLocale() });
    return null;
  }

  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>

      <div className="mt-6 rounded-lg border border-border bg-background-card p-4">
        <p className="text-sm font-semibold">{t("account")}</p>
        <p className="mt-1 text-sm text-foreground-muted">@{profile.username}</p>
      </div>

      <div className="mt-6 rounded-lg border border-danger/30 bg-danger/5 p-4">
        <p className="text-sm font-semibold text-danger">{t("deleteAccount.title")}</p>
        <p className="mt-1 text-sm text-foreground-muted">{t("deleteAccount.description")}</p>
        <div className="mt-3">
          <DeleteAccountForm username={profile.username} />
        </div>
      </div>
    </div>
  );
}
