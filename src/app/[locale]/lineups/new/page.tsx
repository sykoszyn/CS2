import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ShieldX } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreateLineupForm } from "@/components/lineups/create-lineup-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lineups.new" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function NewLineupPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string; pinX?: string; pinY?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/login?next=/lineups/new", locale: await getLocale() });
    return null;
  }

  const t = await getTranslations("lineups.new");

  if (profile.banned_at) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState icon={ShieldX} title={t("suspendedTitle")} description={t("suspendedDescription")} />
      </div>
    );
  }

  const [maps, { map: mapSlug, pinX, pinY }] = await Promise.all([getMaps(), searchParams]);
  const initialMapId = mapSlug ? maps.find((m) => m.slug === mapSlug)?.id : undefined;
  const px = Number(pinX);
  const py = Number(pinY);
  const initialPin = Number.isFinite(px) && Number.isFinite(py) ? { x: px, y: py } : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

      <div className="mt-6">
        <CreateLineupForm maps={maps} initialMapId={initialMapId} initialPin={initialPin} />
      </div>
    </div>
  );
}
