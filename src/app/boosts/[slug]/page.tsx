import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { getBoostBySlug } from "@/services/boosts.service";
import { getMapBySlug } from "@/services/maps.service";
import { Badge } from "@/components/ui/badge";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { VideoEmbed } from "@/components/ui/video-embed";
import { boostCategoryLabels } from "@/lib/labels/boost-labels";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const boost = await getBoostBySlug(slug);
  if (!boost) return {};
  return {
    title: boost.name,
    description: boost.description,
    alternates: { canonical: `/boosts/${boost.slug}` },
  };
}

export default async function BoostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boost = await getBoostBySlug(slug);
  if (!boost) notFound();

  const map = await getMapBySlug(boost.mapSlug);

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
        <Badge variant="brand">{boostCategoryLabels[boost.category]}</Badge>
        <Badge className="gap-1">
          <Users size={12} /> {boost.playersRequired} jugadores
        </Badge>
        <DifficultyDots value={boost.difficulty} />
      </div>
      {boost.authorUsername && (
        <Link href={`/profile/${boost.authorUsername}`} className="mt-2 inline-block text-sm text-foreground-muted hover:text-brand">
          por @{boost.authorUsername}
        </Link>
      )}

      <div className="mt-6">
        {boost.video ? <VideoEmbed video={boost.video} /> : <MediaPlaceholder label={boost.location} className="h-64 w-full rounded-lg" />}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">{boost.description}</p>
    </div>
  );
}
