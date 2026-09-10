import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-border px-4 py-6 pb-24 text-xs text-foreground-subtle lg:px-6 lg:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}. {t("madeBy")}
        </span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
