import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { boosts } from "@/lib/mock/boosts";
import { getMapBySlug } from "@/lib/mock/maps";
import { Badge } from "@/components/ui/badge";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { VideoEmbed } from "@/components/ui/video-embed";

const categoryLabel: Record<string, string> = {
  common: "Común",
  competitive: "Competitivo",
  exotic: "Exótico",
  secret: "Secreto",
};

export function generateStaticParams() {
  return boosts.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const boost = boosts.find((b) => b.slug === slug);
  if (!boost) return {};
  return {
    title: boost.name,
    description: boost.description,
    alternates: { canonical: `/boosts/${boost.slug}` },
  };
}

export default async function BoostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boost = boosts.find((b) => b.slug === slug);
  if (!boost) notFound();

  const map = getMapBySlug(boost.mapSlug);

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <a href={`/maps/${boost.mapSlug}`} className="hover:text-brand">
          {map?.name ?? boost.mapSlug}
        </a>
        <span>/</span>
        <span>Boosts</span>
      </div>
      <h1 className="mt-1 font-display text-2xl font-bold">{boost.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="brand">{categoryLabel[boost.category]}</Badge>
        <Badge className="gap-1">
          <Users size={12} /> {boost.playersRequired} jugadores
        </Badge>
        <DifficultyDots value={boost.difficulty} />
      </div>

      <div className="mt-6">
        {boost.video ? <VideoEmbed video={boost.video} /> : <MediaPlaceholder label={boost.location} className="h-64 w-full rounded-lg" />}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">{boost.description}</p>
    </div>
  );
}
