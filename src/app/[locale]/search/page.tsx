import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SearchIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { search } from "@/services/search.service";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? await search(q, 30) : [];
  const t = await getTranslations("search");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>

      <form method="GET" className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background-elevated px-3">
        <SearchIcon size={16} className="text-foreground-subtle" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder={t("placeholder")}
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
        />
      </form>

      <div className="mt-6">
        {!q && <p className="text-sm text-foreground-subtle">{t("hint")}</p>}
        {q && results.length === 0 && (
          <EmptyState title={t("noResultsTitle", { query: q })} description={t("noResultsDescription")} />
        )}
        <div className="space-y-2">
          {results.map((r) => (
            <Link
              key={`${r.type}-${r.href}`}
              href={r.href}
              className="flex items-center justify-between rounded-md border border-border bg-background-card px-4 py-3 text-sm hover:border-brand/50"
            >
              <span>{r.title}</span>
              <Badge>{t(`types.${r.type}`)}</Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
