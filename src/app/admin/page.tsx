import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { maps } from "@/lib/mock/maps";
import { lineups } from "@/lib/mock/lineups";
import { plays } from "@/lib/mock/plays";
import { boosts } from "@/lib/mock/boosts";
import { guides } from "@/lib/mock/guides";
import { profiles } from "@/lib/mock/profiles";
import { ShieldAlert, ShieldX } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Once Supabase Auth is wired up, only admins/moderators get in. Before
  // that, there is no real user system to gate against, so the page stays
  // open — it's already noindex/nofollow and shows only demo content.
  if (isSupabaseConfigured()) {
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
  }

  const pendingContent = [...lineups.filter((l) => !l.verified), ...plays];

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Panel de administración</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Moderación de contenido, gestión de usuarios y estadísticas de la plataforma.
      </p>

      <div className="mt-6">
        <Tabs
          defaultTab="dashboard"
          tabs={[
            {
              id: "dashboard",
              label: "Dashboard",
              content: (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <StatCard label="Mapas" value={maps.length} />
                  <StatCard label="Lineups" value={lineups.length} />
                  <StatCard label="Boosts" value={boosts.length} />
                  <StatCard label="Jugadas" value={plays.length} />
                  <StatCard label="Guías" value={guides.length} />
                  <StatCard label="Usuarios" value={Object.keys(profiles).length} />
                </div>
              ),
            },
            {
              id: "pending",
              label: `Contenido pendiente (${pendingContent.length})`,
              content: (
                <div className="space-y-2">
                  {pendingContent.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md border border-border bg-background-card px-4 py-3 text-sm"
                    >
                      <span>{"name" in item ? item.name : item.title}</span>
                      <div className="flex gap-2">
                        <Badge variant="default">pending</Badge>
                        <button className="text-xs text-success hover:underline">Aprobar</button>
                        <button className="text-xs text-danger hover:underline">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: "reports",
              label: "Reportes",
              content: (
                <EmptyState
                  icon={ShieldAlert}
                  title="No hay reportes pendientes"
                  description="Los reportes de spam, copyright o contenido incorrecto aparecerán acá."
                />
              ),
            },
            {
              id: "users",
              label: "Usuarios",
              content: (
                <div className="space-y-2">
                  {Object.values(profiles).map((profile) => (
                    <div
                      key={profile.username}
                      className="flex items-center justify-between rounded-md border border-border bg-background-card px-4 py-3 text-sm"
                    >
                      <span>
                        {profile.displayName} <span className="text-foreground-subtle">@{profile.username}</span>
                      </span>
                      <Badge variant="brand">Nivel {profile.level}</Badge>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background-card p-4">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-foreground-subtle">{label}</p>
    </div>
  );
}
