import type { Metadata } from "next";
import { PlayCard } from "@/components/plays/play-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getPlays } from "@/services/plays.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jugadas de CS2",
  description: "Clutches, aces, wallbangs y jugadas profesionales subidas por la comunidad de Counter-Strike 2.",
};

export default async function PlaysPage() {
  const plays = await getPlays();

  return (
    <div className="px-4 py-8 lg:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Jugadas</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Clutches, aces, wallbangs, ninja defuses y jugadas profesionales.
          </p>
        </div>
        <Button href="/plays/new" size="sm">
          Subir jugada
        </Button>
      </div>
      <div className="mt-6">
        {plays.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plays.map((play, i) => (
              <PlayCard key={play.id} play={play} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="Todavía no hay jugadas publicadas" />
        )}
      </div>
    </div>
  );
}
