"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { GameMap } from "@/types/content";
import { sideValues, grenadeTypeValues } from "@/lib/labels/lineup-labels";

const filterableSides = sideValues.filter((s) => s !== "both");

export function LineupFilters({ maps }: { maps: GameMap[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("lineups.filters");
  const tSide = useTranslations("labels.side");
  const tGrenade = useTranslations("labels.grenadeType");

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
        <option value="">{t("allMaps")}</option>
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
        <option value="">{t("bothSides")}</option>
        {filterableSides.map((s) => (
          <option key={s} value={s}>
            {tSide(s)}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("grenade") ?? ""}
        onChange={(e) => setParam("grenade", e.target.value)}
      >
        <option value="">{t("anyGrenade")}</option>
        {grenadeTypeValues.map((g) => (
          <option key={g} value={g}>
            {tGrenade(g)}
          </option>
        ))}
      </select>
    </div>
  );
}
