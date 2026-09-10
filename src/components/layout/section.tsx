import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function Section({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
}) {
  const t = useTranslations("section");

  return (
    <section className="px-4 py-8 lg:px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-foreground-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            {t("viewAll")} <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
