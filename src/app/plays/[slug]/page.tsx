import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Share2 } from "lucide-react";
import { getPlayBySlug } from "@/services/plays.service";
import { getMapBySlug } from "@/services/maps.service";
import { getFavoriteState } from "@/services/favorites.service";
import { getComments } from "@/services/comments.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/ui/video-embed";
import { LikeButton } from "@/components/ui/like-button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { CommentSection } from "@/components/comments/comment-section";
import { playCategoryLabels } from "@/lib/labels/play-labels";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const play = await getPlayBySlug(slug);
  if (!play) return {};
  return {
    title: play.title,
    description: play.description,
    alternates: { canonical: `/plays/${play.slug}` },
  };
}

export default async function PlayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const play = await getPlayBySlug(slug);
  if (!play) notFound();

  const [map, profile] = await Promise.all([getMapBySlug(play.mapSlug), getCurrentProfile()]);
  const [favorited, comments] = await Promise.all([
    getFavoriteState("play", play.id),
    getComments("play", play.id),
  ]);

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
        <Badge variant="brand">{playCategoryLabels[play.category]}</Badge>
        <a href={`/profile/${play.authorUsername}`} className="text-sm text-foreground-muted hover:text-brand">
          por @{play.authorUsername}
        </a>
      </div>

      <div className="mt-6">
        <VideoEmbed video={play.video} />
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground-muted">{play.description}</p>

      <div className="mt-6 flex items-center gap-2">
        <LikeButton
          contentType="play"
          contentId={play.id}
          isLoggedIn={Boolean(profile)}
          initialLiked={play.likedByMe ?? false}
          initialCount={play.likeCount}
        />
        <FavoriteButton
          contentType="play"
          contentId={play.id}
          isLoggedIn={Boolean(profile)}
          initialFavorited={favorited}
        />
        <Button variant="secondary" size="sm">
          <Share2 size={14} /> Compartir
        </Button>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <CommentSection contentType="play" contentId={play.id} comments={comments} isLoggedIn={Boolean(profile)} />
      </div>
    </div>
  );
}
