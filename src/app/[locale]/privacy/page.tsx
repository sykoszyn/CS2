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
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("metaTitle"), alternates: { canonical: "/privacy" } };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-subtle">{t("lastUpdated")}</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground-muted">
        <p>{t("intro", { siteName: siteConfig.name })}</p>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("dataTitle")}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-foreground">{t("dataAccountLabel")}</strong> {t("dataAccount")}
            </li>
            <li>
              <strong className="text-foreground">{t("dataOAuthLabel")}</strong> {t("dataOAuth")}
            </li>
            <li>
              <strong className="text-foreground">{t("dataContentLabel")}</strong> {t("dataContent")}
            </li>
            <li>
              <strong className="text-foreground">{t("dataUsageLabel")}</strong> {t("dataUsage")}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("purposeTitle")}</h2>
          <p className="mt-2">{t("purposeBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("sharingTitle")}</h2>
          <p className="mt-2">{t("sharingBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("rightsTitle")}</h2>
          <p className="mt-2">
            {t("rightsBodyBefore")}{" "}
            <Link href="/settings" className="text-brand hover:underline">
              {t("rightsLink")}
            </Link>
            {t("rightsBodyAfter")}
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-semibold text-foreground">{t("contactTitle")}</h2>
          <p className="mt-2">{t("contactBody")}</p>
        </section>
      </div>
    </div>
  );
}
