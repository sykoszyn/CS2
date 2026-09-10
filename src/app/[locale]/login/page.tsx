import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthErrorBanner } from "@/components/auth/oauth-error-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "login" });
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getTranslations("login");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

        <div className="mt-4">
          <OAuthErrorBanner error={error} />
        </div>

        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm text-foreground-muted">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-brand hover:underline">
            {t("createFree")}
          </Link>
        </p>
      </div>
    </div>
  );
}
