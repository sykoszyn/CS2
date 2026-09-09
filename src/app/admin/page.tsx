import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
import { reportReasonLabels } from "@/lib/labels/report-labels";
import { formatRelativeDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin" && profile.role !== "moderator") {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={ShieldX}
          title="No tenés permisos para ver esta página"
          description="El panel de administración es solo para administradores y moderadores."
        />
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
      label: "Dashboard",
      content: (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Mapas" value={counts.maps} />
          <StatCard label="Lineups" value={counts.lineups} />
          <StatCard label="Boosts" value={counts.boosts} />
          <StatCard label="Jugadas" value={counts.plays} />
          <StatCard label="Guías" value={counts.guides} />
          <StatCard label="Usuarios" value={counts.users} />
          <StatCard label="Reportes pendientes" value={counts.pendingReports} highlight={counts.pendingReports > 0} />
          <StatCard label="Lineups sin verificar" value={counts.unverifiedLineups} />
        </div>
      ),
    },
    {
      id: "reports",
      label: `Reportes (${reports.length})`,
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
                    <Badge variant="danger">{reportReasonLabels[report.reason]}</Badge>
                    <span className="text-xs text-foreground-subtle">{formatRelativeDate(report.createdAt)}</span>
                  </div>
                  <p className="mt-1">
                    {report.target ? (
                      <a href={report.target.href} className="font-semibold hover:text-brand">
                        {report.target.title}
                      </a>
                    ) : (
                      <span className="text-foreground-subtle">Contenido ya eliminado</span>
                    )}
                  </p>
                  <p className="text-xs text-foreground-subtle">
                    Reportado por @{report.reporterUsername}
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
          <EmptyState
            icon={ShieldAlert}
            title="No hay reportes pendientes"
            description="Los reportes de spam, copyright o contenido incorrecto aparecerán acá."
          />
        ),
    },
    {
      id: "verify",
      label: `Verificar lineups (${unverifiedLineups.length})`,
      content:
        unverifiedLineups.length > 0 ? (
          <div className="space-y-2">
            {unverifiedLineups.map((lineup) => (
              <div
                key={lineup.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background-card px-4 py-3 text-sm"
              >
                <div>
                  <a href={`/lineups/${lineup.slug}`} className="font-semibold hover:text-brand">
                    {lineup.name}
                  </a>
                  <p className="text-xs text-foreground-subtle">
                    {lineup.mapSlug} · por @{lineup.authorUsername} · {formatRelativeDate(lineup.createdAt)}
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
          <EmptyState
            icon={ShieldCheck}
            title="No hay lineups pendientes de verificar"
            description="Los lineups nuevos aparecen acá hasta que un admin o moderador los verifique."
          />
        ),
    },
  ];

  if (isSuperAdmin) {
    tabs.push({
      id: "users",
      label: "Usuarios",
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
                  <Badge variant="brand">Nivel {p.level}</Badge>
                  {p.banned_at && <Badge variant="danger">Suspendida</Badge>}
                </div>
              </div>
              {p.id === profile.id ? (
                <p className="text-xs text-foreground-subtle">Tu cuenta</p>
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
      <h1 className="font-display text-2xl font-bold">Panel de administración</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Moderación de contenido, gestión de usuarios y estadísticas de la plataforma.
      </p>

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
