import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), alternates: { canonical: "/terms" } };
}

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-subtle">{t("lastUpdated")}</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground-muted">
        <p>{t("intro", { siteName: siteConfig.name })}</p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("serviceTitle")}</h2>
          <p className="mt-2">{t("serviceBody", { siteName: siteConfig.name })}</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("contentTitle")}</h2>
          <p className="mt-2">{t("contentBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("accountsTitle")}</h2>
          <p className="mt-2">
            {t("accountsBodyBefore")}{" "}
            <Link href="/privacy" className="text-brand hover:underline">
              {t("accountsLink")}
            </Link>{" "}
            {t("accountsBodyAfter")}
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("availabilityTitle")}</h2>
          <p className="mt-2">{t("availabilityBody")}</p>
        </section>
      </div>
    </div>
  );
}
