import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bookmark, Share2 } from "lucide-react";
import { getLineupBySlug, lineups } from "@/lib/mock/lineups";
import { getMapBySlug } from "@/lib/mock/maps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { VideoEmbed } from "@/components/ui/video-embed";
import { LineupStepViewer } from "@/components/lineups/lineup-step-viewer";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return lineups.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lineup = getLineupBySlug(slug);
  if (!lineup) return {};

  const title = `${lineup.name} — CS2`;
  return {
    title,
    description: `Cómo hacer ${lineup.name}: guía paso a paso con lineup de ${lineup.grenadeType} para ${lineup.targetZone} en ${lineup.mapSlug}.`,
    alternates: { canonical: `/lineups/${lineup.slug}` },
    openGraph: { title, type: "article" },
  };
}

export default async function LineupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lineup = getLineupBySlug(slug);
  if (!lineup) notFound();

  const map = getMapBySlug(lineup.mapSlug);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: lineup.name,
    description: `Lineup de ${lineup.grenadeType} para ${lineup.targetZone} en ${map?.name ?? lineup.mapSlug}`,
    step: lineup.steps.map((s) => ({
      "@type": "HowToStep",
      position: s.order,
      name: s.title,
      text: s.instruction,
    })),
  };

  return (
    <div className="px-4 py-8 lg:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <a href={`/maps/${lineup.mapSlug}`} className="hover:text-brand">
              {map?.name ?? lineup.mapSlug}
            </a>
            <span>/</span>
            <span>{lineup.grenadeType}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold">{lineup.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={lineup.side === "ct" ? "ct" : lineup.side === "t" ? "t" : "default"}>
              {lineup.side.toUpperCase()}
            </Badge>
            <Badge variant="brand">{lineup.targetZone}</Badge>
            {lineup.verified && <VerifiedBadge />}
            {lineup.isDemo && <Badge variant="default">DEMO</Badge>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Bookmark size={14} /> Guardar
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 size={14} /> Compartir
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-border bg-background-card p-4 text-sm">
        <div>
          <p className="text-xs text-foreground-subtle">Rating</p>
          <RatingStars value={lineup.ratingAvg} count={lineup.ratingCount} />
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">Funciona</p>
          <p className="font-display font-semibold text-success">{lineup.workedPercent}%</p>
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">Dificultad</p>
          <DifficultyDots value={lineup.difficulty} />
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">Usos</p>
          <p className="font-display font-semibold">{lineup.usageCount.toLocaleString(siteConfig.locale)}</p>
        </div>
      </div>

      {lineup.video && (
        <div className="mt-6">
          <VideoEmbed video={lineup.video} />
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold">Instrucciones paso a paso</h2>
        <LineupStepViewer steps={lineup.steps} />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {lineup.tags.map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>
    </div>
  );
}
