"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { maps } from "@/lib/mock/maps";

const grenades = [
  { value: "smoke", label: "Smoke" },
  { value: "flash", label: "Flash" },
  { value: "molotov", label: "Molotov" },
  { value: "he", label: "HE" },
  { value: "decoy", label: "Decoy" },
];

const sides = [
  { value: "t", label: "T" },
  { value: "ct", label: "CT" },
];

export function LineupFilters() {
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
        {sides.map((s) => (
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
        {grenades.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </select>
    </div>
  );
}
