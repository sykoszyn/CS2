import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FolderHeart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collections" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function CollectionsPage() {
  const profile = await getCurrentProfile();
  const t = await getTranslations("collections");

  if (!profile) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={FolderHeart}
          title={t("loggedOut.title")}
          description={t("loggedOut.description")}
          action={
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">
                {t("loggedOut.login")}
              </Button>
              <Button href="/register" size="sm">
                {t("loggedOut.createAccount")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-16 lg:px-6">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("title")}</h1>
      <EmptyState icon={FolderHeart} title={t("emptyTitle")} description={t("emptyDescription")} />
    </div>
  );
}
