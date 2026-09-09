import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreateBoostForm } from "@/components/boosts/create-boost-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subir boost",
  robots: { index: false },
};

export default async function NewBoostPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/boosts/new");

  const maps = await getMaps();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Subir boost</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Compartí una posición de boost con la comunidad: dónde pararse, cuántos jugadores necesita y
        para qué sirve.
      </p>

      <div className="mt-6">
        <CreateBoostForm maps={maps} />
      </div>
    </div>
  );
}
