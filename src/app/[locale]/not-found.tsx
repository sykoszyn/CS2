import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <EmptyState icon={SearchX} title={t("title")} description={t("description")} action={<Button href="/">{t("cta")}</Button>} />
    </div>
  );
}
