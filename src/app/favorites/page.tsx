import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { LineupCard } from "@/components/lineups/lineup-card";
import { BoostCard } from "@/components/boosts/boost-card";
import { PlayCard } from "@/components/plays/play-card";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getUserFavoriteIds } from "@/services/favorites.service";
import { getLineupsByIds } from "@/services/lineups.service";
import { getBoostsByIds } from "@/services/boosts.service";
import { getPlaysByIds } from "@/services/plays.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: { index: false },
};

export default async function FavoritesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="px-4 py-16 lg:px-6">
        <EmptyState
          icon={Heart}
          title="Guardá tus lineups, boosts y guías favoritas"
          description="Creá una cuenta gratis para acceder a tus favoritos desde cualquier dispositivo."
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

  const favoriteIds = await getUserFavoriteIds();
  const [lineups, boosts, plays] = await Promise.all([
    getLineupsByIds(favoriteIds.lineupIds),
    getBoostsByIds(favoriteIds.boostIds),
    getPlaysByIds(favoriteIds.playIds),
  ]);

  const isEmpty = lineups.length === 0 && boosts.length === 0 && plays.length === 0;

  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Favoritos</h1>
      <p className="mt-1 text-sm text-foreground-muted">Todo lo que guardaste, en un solo lugar.</p>

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="Todavía no guardaste nada"
            description="Cuando encuentres un lineup, boost o jugada útil, tocá «Guardar» para verlo acá."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {lineups.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Lineups ({lineups.length})</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lineups.map((lineup, i) => (
                  <LineupCard key={lineup.id} lineup={lineup} index={i} />
                ))}
              </div>
            </section>
          )}

          {boosts.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Boosts ({boosts.length})</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {boosts.map((boost, i) => (
                  <BoostCard key={boost.id} boost={boost} index={i} />
                ))}
              </div>
            </section>
          )}

          {plays.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Jugadas ({plays.length})</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plays.map((play, i) => (
                  <PlayCard key={play.id} play={play} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
