import type { Metadata } from "next";
import { SearchIcon } from "lucide-react";
import { search } from "@/services/search.service";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Buscá lineups, mapas, calls, boosts, jugadas y guías de Counter-Strike 2.",
};

const typeLabel: Record<string, string> = {
  map: "Mapa",
  lineup: "Lineup",
  boost: "Boost",
  play: "Jugada",
  guide: "Guía",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q ? search(q, 30) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Buscar</h1>

      <form method="GET" className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background-elevated px-3">
        <SearchIcon size={16} className="text-foreground-subtle" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="smoke window, mirage, boost nuke..."
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
        />
      </form>

      <div className="mt-6">
        {!q && (
          <p className="text-sm text-foreground-subtle">
            Escribí algo como &quot;mirage window&quot;, &quot;flash b&quot; o &quot;boost nuke&quot;.
          </p>
        )}
        {q && results.length === 0 && (
          <EmptyState title={`Sin resultados para "${q}"`} description="Probá con otro mapa, granada o call." />
        )}
        <div className="space-y-2">
          {results.map((r) => (
            <a
              key={`${r.type}-${r.href}`}
              href={r.href}
              className="flex items-center justify-between rounded-md border border-border bg-background-card px-4 py-3 text-sm hover:border-brand/50"
            >
              <span>{r.title}</span>
              <Badge>{typeLabel[r.type]}</Badge>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
