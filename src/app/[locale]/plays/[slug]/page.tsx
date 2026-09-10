import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Share2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
import { ReportButton } from "@/components/reports/report-button";
import { ModerationControls } from "@/components/moderation/moderation-controls";
import { CommentSection } from "@/components/comments/comment-section";

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

  const t = await getTranslations("plays.detail");
  const tCategory = await getTranslations("labels.playCategory");

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href={`/maps/${play.mapSlug}`} className="hover:text-brand">
          {map?.name ?? play.mapSlug}
        </Link>
        <span>/</span>
        <span>{t("breadcrumb")}</span>
      </div>
      <h1 className="mt-1 font-display text-2xl font-bold">{play.title}</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="brand">{tCategory(play.category)}</Badge>
        <Link href={`/profile/${play.authorUsername}`} className="text-sm text-foreground-muted hover:text-brand">
          {t("by", { username: play.authorUsername })}
        </Link>
      </div>

      {(profile?.role === "admin" || profile?.role === "moderator") && (
        <div className="mt-4">
          <ModerationControls contentType="play" contentId={play.id} pathToRevalidate={`/plays/${play.slug}`} />
        </div>
      )}

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
          <Share2 size={14} /> {t("share")}
        </Button>
        <ReportButton contentType="play" contentId={play.id} isLoggedIn={Boolean(profile)} />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <CommentSection contentType="play" contentId={play.id} comments={comments} isLoggedIn={Boolean(profile)} />
      </div>
    </div>
  );
}
