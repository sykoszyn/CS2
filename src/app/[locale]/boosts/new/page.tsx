import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ShieldX } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreateBoostForm } from "@/components/boosts/create-boost-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "boosts.new" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function NewBoostPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/login?next=/boosts/new", locale: await getLocale() });
    return null;
  }

  const t = await getTranslations("boosts.new");

  if (profile.banned_at) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState icon={ShieldX} title={t("suspendedTitle")} description={t("suspendedDescription")} />
      </div>
    );
  }

  const maps = await getMaps();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

      <div className="mt-6">
        <CreateBoostForm maps={maps} />
      </div>
    </div>
  );
}
