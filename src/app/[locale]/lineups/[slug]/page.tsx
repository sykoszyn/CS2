import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Share2, LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getLineupBySlug, getUserRating } from "@/services/lineups.service";
import { getMapBySlug } from "@/services/maps.service";
import { getLikeState } from "@/services/likes.service";
import { getFavoriteState } from "@/services/favorites.service";
import { getComments } from "@/services/comments.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { DifficultyDots } from "@/components/ui/difficulty-dots";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { VideoEmbed } from "@/components/ui/video-embed";
import { EmptyState } from "@/components/ui/empty-state";
import { LikeButton } from "@/components/ui/like-button";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { ReportButton } from "@/components/reports/report-button";
import { ModerationControls } from "@/components/moderation/moderation-controls";
import { LineupStepViewer } from "@/components/lineups/lineup-step-viewer";
import { RatingForm } from "@/components/lineups/rating-form";
import { CommentSection } from "@/components/comments/comment-section";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lineup = await getLineupBySlug(slug);
  if (!lineup) return {};

  const t = await getTranslations({ locale, namespace: "lineups.detail" });
  const title = t("metaTitle", { name: lineup.name });
  return {
    title,
    description: t("metaDescription", {
      name: lineup.name,
      grenadeType: lineup.grenadeType,
      targetZone: lineup.targetZone,
      mapSlug: lineup.mapSlug,
    }),
    alternates: { canonical: `/lineups/${lineup.slug}` },
    openGraph: { title, type: "article" },
  };
}

export default async function LineupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lineup = await getLineupBySlug(slug);
  if (!lineup) notFound();

  const [map, profile] = await Promise.all([getMapBySlug(lineup.mapSlug), getCurrentProfile()]);
  const [userRating, likeState, favorited, comments] = await Promise.all([
    profile ? getUserRating(lineup.id) : Promise.resolve(null),
    getLikeState("lineup", lineup.id),
    getFavoriteState("lineup", lineup.id),
    getComments("lineup", lineup.id),
  ]);

  const t = await getTranslations("lineups.detail");
  const tGrenade = await getTranslations("labels.grenadeType");
  const locale = await getLocale();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: lineup.name,
    description: `${tGrenade(lineup.grenadeType)} — ${lineup.targetZone} — ${map?.name ?? lineup.mapSlug}`,
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
            <Link href={`/maps/${lineup.mapSlug}`} className="hover:text-brand">
              {map?.name ?? lineup.mapSlug}
            </Link>
            <span>/</span>
            <span>{tGrenade(lineup.grenadeType)}</span>
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
          <Link href={`/profile/${lineup.authorUsername}`} className="mt-2 inline-block text-sm text-foreground-muted hover:text-brand">
            {t("by", { username: lineup.authorUsername })}
          </Link>
        </div>

        <div className="flex gap-2">
          <LikeButton
            contentType="lineup"
            contentId={lineup.id}
            isLoggedIn={Boolean(profile)}
            initialLiked={likeState.likedByMe}
            initialCount={likeState.count}
          />
          <FavoriteButton
            contentType="lineup"
            contentId={lineup.id}
            isLoggedIn={Boolean(profile)}
            initialFavorited={favorited}
          />
          <Button variant="secondary" size="sm">
            <Share2 size={14} /> {t("share")}
          </Button>
          <ReportButton contentType="lineup" contentId={lineup.id} isLoggedIn={Boolean(profile)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-lg border border-border bg-background-card p-4 text-sm">
        <div>
          <p className="text-xs text-foreground-subtle">{t("rating")}</p>
          <RatingStars value={lineup.ratingAvg} count={lineup.ratingCount} />
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">{t("worked")}</p>
          <p className="font-display font-semibold text-success">
            {lineup.ratingCount > 0 ? `${lineup.workedPercent}%` : t("noData")}
          </p>
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">{t("difficulty")}</p>
          <DifficultyDots value={lineup.difficulty} />
        </div>
        <div>
          <p className="text-xs text-foreground-subtle">{t("uses")}</p>
          <p className="font-display font-semibold">{lineup.usageCount.toLocaleString(locale)}</p>
        </div>
      </div>

      {(profile?.role === "admin" || profile?.role === "moderator") && (
        <div className="mt-4">
          <ModerationControls
            contentType="lineup"
            contentId={lineup.id}
            verified={lineup.verified}
            pathToRevalidate={`/lineups/${lineup.slug}`}
          />
        </div>
      )}

      {lineup.video && (
        <div className="mt-6">
          <VideoEmbed video={lineup.video} />
        </div>
      )}

      {lineup.media && lineup.media.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-display text-lg font-semibold">{t("diagramTitle")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {lineup.media.map((m) => (
              <figure key={m.imageUrl} className="overflow-hidden rounded-lg border border-border bg-background-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG, no next/image optimization needed */}
                <img src={m.imageUrl} alt={m.caption ?? lineup.name} className="w-full" />
                {m.caption && (
                  <figcaption className="px-3 py-2 text-xs text-foreground-subtle">{m.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold">{t("stepsTitle")}</h2>
        {lineup.steps.length > 0 ? (
          <LineupStepViewer steps={lineup.steps} />
        ) : (
          <EmptyState title={t("noSteps")} />
        )}
      </div>

      {lineup.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {lineup.tags.map((tag) => (
            <Badge key={tag}>#{tag}</Badge>
          ))}
        </div>
      )}

      <div className="mt-6">
        {profile ? (
          <RatingForm
            lineupId={lineup.id}
            lineupSlug={lineup.slug}
            initialStars={userRating?.stars}
            initialWorked={userRating?.worked}
          />
        ) : (
          <EmptyState
            icon={LogIn}
            title={t("loginToRate")}
            action={
              <Button href={`/login?next=/lineups/${lineup.slug}`} size="sm">
                {t("login")}
              </Button>
            }
          />
        )}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <CommentSection
          contentType="lineup"
          contentId={lineup.id}
          comments={comments}
          isLoggedIn={Boolean(profile)}
        />
      </div>
    </div>
  );
}
