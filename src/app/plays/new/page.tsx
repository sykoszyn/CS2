import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMaps } from "@/services/maps.service";
import { CreatePlayForm } from "@/components/plays/create-play-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subir jugada",
  robots: { index: false },
};

export default async function NewPlayPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/plays/new");

  const maps = await getMaps();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Subir jugada</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Clutches, aces, wallbangs, ninja defuses — compartí el video con la comunidad.
      </p>

      <div className="mt-6">
        <CreatePlayForm maps={maps} />
      </div>
    </div>
  );
}
