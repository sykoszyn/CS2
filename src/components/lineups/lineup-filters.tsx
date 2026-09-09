"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { GameMap } from "@/types/content";
import { grenadeTypeOptions, sideOptions } from "@/lib/labels/lineup-labels";

const filterableSides = sideOptions.filter((s) => s.value !== "both");

export function LineupFilters({ maps }: { maps: GameMap[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/lineups?${params.toString()}`);
  }

  const selectClass =
    "h-9 rounded-md border border-border bg-background-elevated px-2.5 text-sm text-foreground outline-none focus-visible:border-brand";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className={selectClass}
        value={searchParams.get("map") ?? ""}
        onChange={(e) => setParam("map", e.target.value)}
      >
        <option value="">Todos los mapas</option>
        {maps.map((m) => (
          <option key={m.slug} value={m.slug}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("side") ?? ""}
        onChange={(e) => setParam("side", e.target.value)}
      >
        <option value="">Ambos lados</option>
        {filterableSides.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("grenade") ?? ""}
        onChange={(e) => setParam("grenade", e.target.value)}
      >
        <option value="">Toda granada</option>
        {grenadeTypeOptions.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}
