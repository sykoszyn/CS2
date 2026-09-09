import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import { getPublicProfileByUsername } from "@/services/profiles.service";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

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
    if (current) redirect(`/profile/${current.username}`);

    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={LogIn}
          title="Iniciá sesión para ver tu perfil"
          description="Creá una cuenta gratis para guardar favoritos, colecciones y subir tu propio contenido."
          action={
            <div className="flex gap-2">
              <Button href="/login" variant="secondary" size="sm">
                Ingresar
              </Button>
              <Button href="/register" size="sm">
                Crear cuenta
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
    return (
      <div className="px-4 py-8 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-background-elevated" />
          <div>
            <h1 className="font-display text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-foreground-muted">@{profile.username}</p>
          </div>
          <Badge variant="brand" className="ml-auto">
            Nivel {profile.level}
          </Badge>
        </div>

        {profile.bio && <p className="mt-4 max-w-xl text-sm text-foreground-muted">{profile.bio}</p>}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Lineups" value={profile.stats.lineupsCreated} />
          <Stat label="Jugadas" value={profile.stats.playsCreated} />
          <Stat label="Guías" value={profile.stats.guidesCreated} />
          <Stat label="Likes" value={profile.stats.likesReceived} />
          <Stat label="Verificados" value={profile.stats.verifiedContent} />
        </div>
      </div>
    );
  }

  const { profile } = result;
  const joined = new Date(profile.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

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
          Nivel {profile.level}
        </Badge>
      </div>

      {profile.bio && <p className="mt-4 max-w-xl text-sm text-foreground-muted">{profile.bio}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="XP" value={profile.xp} />
        <div className="rounded-lg border border-border bg-background-card p-3 text-center">
          <p className="font-display text-sm font-semibold capitalize">{joined}</p>
          <p className="text-xs text-foreground-subtle">Se unió</p>
        </div>
      </div>

      <p className="mt-6 text-sm text-foreground-subtle">
        Todavía no publicó contenido. Los lineups, jugadas y guías propias se habilitan en las
        próximas fases.
      </p>
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
