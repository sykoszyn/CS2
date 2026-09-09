import type { Metadata } from "next";
import { BoostCard } from "@/components/boosts/boost-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getBoosts } from "@/services/boosts.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boosts de CS2",
  description: "Boosts comunes, competitivos, exóticos y secretos para todos los mapas de Counter-Strike 2.",
};

export default async function BoostsPage() {
  const boosts = await getBoosts();

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Boosts</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Posiciones de boost con 2 o 3 jugadores: comunes, competitivos y exóticos.
          </p>
        </div>
        <Button href="/boosts/new" size="sm">
          Subir boost
        </Button>
      </div>
      <div className="mt-6">
        {boosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boosts.map((boost, i) => (
              <BoostCard key={boost.id} boost={boost} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="Todavía no hay boosts publicados" />
        )}
      </div>
    </div>
  );
}
