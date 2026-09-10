import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getGuideBySlug, guides } from "@/lib/mock/guides";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const t = await getTranslations("labels.guideLevel");

  return (
    <article className="px-4 py-8 lg:px-6">
      <MediaPlaceholder label={guide.title} className="h-48 w-full rounded-lg lg:h-64" />
      <div className="mt-4">
        <Badge>{t(guide.level)}</Badge>
        <h1 className="mt-2 font-display text-2xl font-bold">{guide.title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{guide.summary}</p>
      </div>

      <div className="mt-8 space-y-8">
        {guide.sections.map((section) => (
          <section key={section.order}>
            <h2 className="font-display text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{section.content}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
