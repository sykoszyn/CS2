import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { LogIn } from "lucide-react";
import { getPublicProfileByUsername, getProfileStats } from "@/services/profiles.service";
import { getUserAchievements } from "@/services/achievements.service";
import { getLineupsByAuthor } from "@/services/lineups.service";
import { getBoostsByAuthor } from "@/services/boosts.service";
import { getPlaysByAuthor } from "@/services/plays.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { LineupCard } from "@/components/lineups/lineup-card";
import { BoostCard } from "@/components/boosts/boost-card";
import { PlayCard } from "@/components/plays/play-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  if (username === "me") return {};

  const result = await getPublicProfileByUsername(username);
  if (!result) return {};

  const { profile, kind } = result;
  return {
    title: kind === "real" ? profile.display_name : profile.displayName,
    description: kind === "real" ? profile.bio ?? undefined : profile.bio,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  if (username === "me") {
    const current = await getCurrentProfile();
    if (current) redirect({ href: `/profile/${current.username}`, locale: await getLocale() });

    const t = await getTranslations("profile.loggedOut");

    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={LogIn}
          title={t("title")}
          description={t("description")}
          action={
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">
                {t("login")}
              </Button>
              <Button href="/register" size="sm">
                {t("createAccount")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const result = await getPublicProfileByUsername(username);
  if (!result) notFound();

  if (result.kind === "mock") {
    const { profile } = result;
    const t = await getTranslations("profile");
    const tStats = await getTranslations("profile.mockStats");

    return (
      <div className="px-4 py-8 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-background-elevated" />
          <div>
            <h1 className="font-display text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-foreground-muted">@{profile.username}</p>
          </div>
          <Badge variant="brand" className="ml-auto">
            {t("level", { level: profile.level })}
          </Badge>
        </div>

        {profile.bio && <p className="mt-4 max-w-xl text-sm text-foreground-muted">{profile.bio}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label={tStats("lineups")} value={profile.stats.lineupsCreated} />
          <Stat label={tStats("plays")} value={profile.stats.playsCreated} />
          <Stat label={tStats("guides")} value={profile.stats.guidesCreated} />
          <Stat label={tStats("likes")} value={profile.stats.likesReceived} />
          <Stat label={tStats("verified")} value={profile.stats.verifiedContent} />
        </div>
      </div>
    );
  }

  const { profile } = result;
  const locale = await getLocale();
  const joined = new Date(profile.created_at).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const [stats, achievements, lineups, boosts, plays] = await Promise.all([
    getProfileStats(profile.id),
    getUserAchievements(profile.id),
    getLineupsByAuthor(profile.id),
    getBoostsByAuthor(profile.id),
    getPlaysByAuthor(profile.id),
  ]);

  const totalContent = lineups.length + boosts.length + plays.length;
  const t = await getTranslations("profile");
  const tStats = await getTranslations("profile.stats");

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-background-elevated">
          {profile.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element -- avatar comes from an external OAuth provider
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-sm text-foreground-muted">@{profile.username}</p>
        </div>
        <Badge variant="brand" className="ml-auto">
          {t("level", { level: profile.level })}
        </Badge>
      </div>

      {profile.bio && <p className="mt-4 max-w-xl text-sm text-foreground-muted">{profile.bio}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label={tStats("xp")} value={profile.xp} />
        <Stat label={tStats("lineups")} value={stats.lineupsCreated} />
        <Stat label={tStats("plays")} value={stats.playsCreated} />
        <Stat label={tStats("boosts")} value={stats.boostsCreated} />
        <Stat label={tStats("likesReceived")} value={stats.likesReceived} />
        <div className="rounded-lg border border-border bg-background-card p-3 text-center">
          <p className="font-display text-sm font-semibold capitalize">{joined}</p>
          <p className="text-xs text-foreground-subtle">{t("joined")}</p>
        </div>
      </div>

      {achievements.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
            {t("achievements")}
          </p>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a.slug}
                title={a.description}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background-card px-3 py-1.5 text-sm"
              >
                <span>{a.icon}</span>
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {totalContent > 0 ? (
          <Tabs
            defaultTab="lineups"
            tabs={[
              {
                id: "lineups",
                label: t("tabs.lineups", { count: lineups.length }),
                content:
                  lineups.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {lineups.map((lineup, i) => (
                        <LineupCard key={lineup.id} lineup={lineup} index={i} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={t("emptyLineups")} />
                  ),
              },
              {
                id: "plays",
                label: t("tabs.plays", { count: plays.length }),
                content:
                  plays.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {plays.map((play, i) => (
                        <PlayCard key={play.id} play={play} index={i} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={t("emptyPlays")} />
                  ),
              },
              {
                id: "boosts",
                label: t("tabs.boosts", { count: boosts.length }),
                content:
                  boosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {boosts.map((boost, i) => (
                        <BoostCard key={boost.id} boost={boost} index={i} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={t("emptyBoosts")} />
                  ),
              },
            ]}
          />
        ) : (
          <p className="text-sm text-foreground-subtle">{t("noContent")}</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background-card p-3 text-center">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-foreground-subtle">{label}</p>
    </div>
  );
}
