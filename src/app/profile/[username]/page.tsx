import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogIn } from "lucide-react";
import { getProfileByUsername, profiles } from "@/lib/mock/profiles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function generateStaticParams() {
  return Object.keys(profiles).map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = getProfileByUsername(username);
  if (!profile) return {};
  return {
    title: profile.displayName,
    description: profile.bio,
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  if (username === "me") {
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

  const profile = getProfileByUsername(username);
  if (!profile) notFound();

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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background-card p-3 text-center">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-xs text-foreground-subtle">{label}</p>
    </div>
  );
}
