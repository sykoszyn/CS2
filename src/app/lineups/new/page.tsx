import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreateLineupForm } from "@/components/lineups/create-lineup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subir lineup",
  robots: { index: false },
};

export default async function NewLineupPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/lineups/new");

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
