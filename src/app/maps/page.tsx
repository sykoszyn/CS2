import type { Metadata } from "next";
import { MapCard } from "@/components/maps/map-card";
import { maps } from "@/lib/mock/maps";

export const metadata: Metadata = {
  title: "Mapas de CS2",
  description: "Todos los mapas competitivos de Counter-Strike 2: calls, lineups, boosts y guías.",
};

export default function MapsPage() {
  return (
    <div className="px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Mapas</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Elegí un mapa para ver sus callouts, lineups, boosts y guías.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {maps.map((map, i) => (
          <MapCard key={map.id} map={map} index={i} />
        ))}
      </div>
    </div>
  );
}
