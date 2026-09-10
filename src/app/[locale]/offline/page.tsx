import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "offline" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default function OfflinePage() {
  const t = useTranslations("offline");

  return (
    <div className="px-4 py-16 lg:px-6">
      <EmptyState icon={WifiOff} title={t("title")} description={t("description")} />
    </div>
  );
}
