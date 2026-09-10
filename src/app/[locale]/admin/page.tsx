import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ShieldAlert, ShieldX, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getAdminDashboardCounts, getAllProfilesForAdmin, getUnverifiedLineups } from "@/services/admin.service";
import { getPendingReports } from "@/services/reports.service";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/admin/report-actions";
import { UserControls } from "@/components/admin/user-controls";
import { ModerationControls } from "@/components/moderation/moderation-controls";
import { formatRelativeDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect({ href: "/login?next=/admin", locale: await getLocale() });
    return null;
  }

  const t = await getTranslations("admin");
  const tReason = await getTranslations("labels.reportReason");

  if (profile.role !== "admin" && profile.role !== "moderator") {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState icon={ShieldX} title={t("noPermissionTitle")} description={t("noPermissionDescription")} />
      </div>
    );
  }

  const isSuperAdmin = profile.role === "admin";

  const [counts, reports, unverifiedLineups, profiles] = await Promise.all([
    getAdminDashboardCounts(),
    getPendingReports(),
    getUnverifiedLineups(),
    isSuperAdmin ? getAllProfilesForAdmin() : Promise.resolve([]),
  ]);

  const tabs = [
    {
      id: "dashboard",
      label: t("tabs.dashboard"),
      content: (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label={t("stats.maps")} value={counts.maps} />
          <StatCard label={t("stats.lineups")} value={counts.lineups} />
          <StatCard label={t("stats.boosts")} value={counts.boosts} />
          <StatCard label={t("stats.plays")} value={counts.plays} />
          <StatCard label={t("stats.guides")} value={counts.guides} />
          <StatCard label={t("stats.users")} value={counts.users} />
          <StatCard label={t("stats.pendingReports")} value={counts.pendingReports} highlight={counts.pendingReports > 0} />
          <StatCard label={t("stats.unverifiedLineups")} value={counts.unverifiedLineups} />
        </div>
      ),
    },
    {
      id: "reports",
      label: t("tabs.reports", { count: reports.length }),
      content:
        reports.length > 0 ? (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-border bg-background-card px-4 py-3 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="danger">{tReason(report.reason)}</Badge>
                    <span className="text-xs text-foreground-subtle">{formatRelativeDate(report.createdAt)}</span>
                  </div>
                  <p className="mt-1">
                    {report.target ? (
                      <Link href={report.target.href} className="font-semibold hover:text-brand">
                        {report.target.title}
                      </Link>
                    ) : (
                      <span className="text-foreground-subtle">{t("reports.contentDeleted")}</span>
                    )}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    {t("reports.reportedBy", { username: report.reporterUsername })}
                    {report.description && ` — "${report.description}"`}
                  </p>
                </div>
                <ReportActions
                  reportId={report.id}
                  contentType={report.contentType}
                  contentId={report.contentId}
                  hasTarget={Boolean(report.target)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={ShieldAlert} title={t("reports.emptyTitle")} description={t("reports.emptyDescription")} />
        ),
    },
    {
      id: "verify",
      label: t("tabs.verify", { count: unverifiedLineups.length }),
      content:
        unverifiedLineups.length > 0 ? (
          <div className="space-y-2">
            {unverifiedLineups.map((lineup) => (
              <div
                key={lineup.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background-card px-4 py-3 text-sm"
              >
                <div>
                  <Link href={`/lineups/${lineup.slug}`} className="font-semibold hover:text-brand">
                    {lineup.name}
                  </Link>
                  <p className="text-xs text-foreground-subtle">
                    {lineup.mapSlug} · {t("verify.by", { username: lineup.authorUsername })} ·{" "}
                    {formatRelativeDate(lineup.createdAt)}
                  </p>
                </div>
                <ModerationControls
                  contentType="lineup"
                  contentId={lineup.id}
                  verified={false}
                  pathToRevalidate={`/lineups/${lineup.slug}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={ShieldCheck} title={t("verify.emptyTitle")} description={t("verify.emptyDescription")} />
        ),
    },
  ];

  if (isSuperAdmin) {
    tabs.push({
      id: "users",
      label: t("tabs.users"),
      content: (
        <div className="space-y-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background-card px-4 py-3 text-sm"
            >
              <div>
                <span>
                  {p.display_name} <span className="text-foreground-subtle">@{p.username}</span>
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Badge variant="brand">{t("users.level", { level: p.level })}</Badge>
                  {p.banned_at && <Badge variant="danger">{t("users.suspended")}</Badge>}
                </div>
              </div>
              {p.id === profile.id ? (
                <p className="text-xs text-foreground-subtle">{t("users.yourAccount")}</p>
              ) : (
                <UserControls userId={p.id} role={p.role} banned={Boolean(p.banned_at)} />
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t("subtitle")}</p>

      <div className="mt-6">
        <Tabs defaultTab="dashboard" tabs={tabs} />
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-warning/40 bg-warning/5" : "border-border bg-background-card"}`}>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-foreground-subtle">{label}</p>
    </div>
  );
}
