import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Share2 } from "lucide-react";
import { getBoostBySlug } from "@/services/boosts.service";
import { getMapBySlug } from "@/services/maps.service";
import { getLikeState } from "@/services/likes.service";
import { getFavoriteState } from "@/services/favorites.service";
import { getComments } from "@/services/comments.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { VideoEmbed } from "@/components/ui/video-embed";
import { LikeButton } from "@/components/ui/like-button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { CommentSection } from "@/components/comments/comment-section";
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

  const [map, profile] = await Promise.all([getMapBySlug(boost.mapSlug), getCurrentProfile()]);
  const [likeState, favorited, comments] = await Promise.all([
    getLikeState("boost", boost.id),
    getFavoriteState("boost", boost.id),
    getComments("boost", boost.id),
  ]);

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

      <div className="mt-6 flex items-center gap-2">
        <LikeButton
          contentType="boost"
          contentId={boost.id}
          isLoggedIn={Boolean(profile)}
          initialLiked={likeState.likedByMe}
          initialCount={likeState.count}
        />
        <FavoriteButton
          contentType="boost"
          contentId={boost.id}
          isLoggedIn={Boolean(profile)}
          initialFavorited={favorited}
        />
        <Button variant="secondary" size="sm">
          <Share2 size={14} /> Compartir
        </Button>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <CommentSection
          contentType="boost"
          contentId={boost.id}
          comments={comments}
          isLoggedIn={Boolean(profile)}
        />
      </div>
    </div>
  );
}
