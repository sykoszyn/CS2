"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { createBoostAction, type CreateBoostInput } from "@/lib/boosts/actions";
import type { GameMap } from "@/types/content";
import { boostCategoryValues } from "@/lib/labels/boost-labels";
import { sideValues } from "@/lib/labels/lineup-labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-background-elevated px-3 text-sm text-foreground outline-none focus-visible:border-brand";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground-muted";

export function CreateBoostForm({ maps }: { maps: GameMap[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("boosts.form");
  const tCategory = useTranslations("labels.boostCategory");
  const tSide = useTranslations("labels.side");

  const [name, setName] = useState("");
  const [mapId, setMapId] = useState(maps[0]?.id ?? "");
  const [location, setLocation] = useState("");
  const [playersRequired, setPlayersRequired] = useState<2 | 3>(2);
  const [category, setCategory] = useState(boostCategoryValues[0]);
  const [side, setSide] = useState<"t" | "ct" | "both">("t");
  const [difficulty, setDifficulty] = useState(2);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const input: CreateBoostInput = {
      name,
      mapId,
      location,
      playersRequired,
      category,
      side,
      difficulty,
      description,
      imageUrl,
      videoUrl,
      videoSource: "youtube",
    };

    startTransition(async () => {
      const result = await createBoostAction(input);
      if (result?.status === "error") setError(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>{t("name")}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} required />
        </div>

        <div>
          <label className={labelClass}>{t("map")}</label>
          <select className={selectClass} value={mapId} onChange={(e) => setMapId(e.target.value)} required>
            {maps.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("location")}</label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("locationPlaceholder")} required />
        </div>

        <div>
          <label className={labelClass}>{t("playersRequired")}</label>
          <div className="flex gap-2">
            {[2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlayersRequired(n as 2 | 3)}
                className={cn(
                  "h-10 flex-1 rounded-md border text-sm font-medium",
                  n === playersRequired
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {t("playersOption", { count: n })}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>{t("category")}</label>
          <select
            className={selectClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
          >
            {boostCategoryValues.map((c) => (
              <option key={c} value={c}>
                {tCategory(c)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("side")}</label>
          <select className={selectClass} value={side} onChange={(e) => setSide(e.target.value as typeof side)}>
            {sideValues.map((s) => (
              <option key={s} value={s}>
                {tSide(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("difficulty")}</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(n)}
                className={cn(
                  "h-10 flex-1 rounded-md border text-sm font-medium",
                  n === difficulty
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-border text-foreground-muted hover:text-foreground",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("description")}</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        <div>
          <label className={labelClass}>{t("image")}</label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder={t("imagePlaceholder")} />
        </div>

        <div>
          <label className={labelClass}>{t("video")}</label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("videoPlaceholder")}
          />
        </div>
      </div>

      {error && <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("publishing") : t("publish")}
      </Button>
    </form>
  );
}
