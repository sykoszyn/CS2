import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreateLineupForm } from "@/components/lineups/create-lineup-form";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subir lineup",
  robots: { index: false },
};

export default async function NewLineupPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/lineups/new");

  if (profile.banned_at) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={ShieldX}
          title="Tu cuenta está suspendida"
          description="No podés subir contenido nuevo mientras tu cuenta esté suspendida."
        />
      </div>
    );
  }

  const maps = await getMaps();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Subir lineup</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Compartí una smoke, flash, molotov o HE con la comunidad. Sé preciso: otros jugadores van a
        practicar con tus instrucciones.
      </p>

      <div className="mt-6">
        <CreateLineupForm maps={maps} />
      </div>
    </div>
  );
}
