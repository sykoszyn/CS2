import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { plays } from "@/lib/mock/plays";
import { getMapBySlug } from "@/lib/mock/maps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/ui/video-embed";

const categoryLabel: Record<string, string> = {
  clutch: "Clutch",
  ace: "Ace",
  entry: "Entry",
  retake: "Retake",
  "ninja-defuse": "Ninja Defuse",
  wallbang: "Wallbang",
  outplay: "Outplay",
  pro: "Pro",
};

export function generateStaticParams() {
  return plays.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const play = plays.find((p) => p.slug === slug);
  if (!play) return {};
  return {
    title: play.title,
    description: play.description,
    alternates: { canonical: `/plays/${play.slug}` },
  };
}

export default async function PlayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const play = plays.find((p) => p.slug === slug);
  if (!play) notFound();

  const map = getMapBySlug(play.mapSlug);

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <a href={`/maps/${play.mapSlug}`} className="hover:text-brand">
          {map?.name ?? play.mapSlug}
        </a>
        <span>/</span>
        <span>Jugadas</span>
      </div>
      <h1 className="mt-1 font-display text-2xl font-bold">{play.title}</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="brand">{categoryLabel[play.category]}</Badge>
        <a href={`/profile/${play.authorUsername}`} className="text-sm text-foreground-muted hover:text-brand">
          por {play.authorUsername}
        </a>
      </div>

      <div className="mt-6">
        <VideoEmbed video={play.video} />
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">{play.description}</p>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" size="sm">
          <Heart size={14} /> {play.likeCount}
        </Button>
        <Button variant="secondary" size="sm">
          <MessageCircle size={14} /> {play.commentCount}
        </Button>
        <Button variant="secondary" size="sm">
          <Share2 size={14} /> Compartir
        </Button>
      </div>
    </div>
  );
}
