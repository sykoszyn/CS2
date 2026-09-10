"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { createLineupAction, type CreateLineupInput, type CreateLineupStepInput } from "@/lib/lineups/actions";
import type { GameMap } from "@/types/content";
import {
  grenadeTypeValues,
  sideValues,
  situationValues,
  distanceValues,
  clickTypeValues,
} from "@/lib/labels/lineup-labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const selectClass =
  "h-10 w-full rounded-md border border-border bg-background-elevated px-3 text-sm text-foreground outline-none focus-visible:border-brand";
const labelClass = "mb-1.5 block text-xs font-medium text-foreground-muted";

let stepIdCounter = 0;

export function CreateLineupForm({ maps }: { maps: GameMap[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("lineups.form");
  const tGrenade = useTranslations("labels.grenadeType");
  const tSide = useTranslations("labels.side");
  const tSituation = useTranslations("labels.situation");
  const tDistance = useTranslations("labels.distance");
  const tClick = useTranslations("labels.clickType");

  const [name, setName] = useState("");
  const [mapId, setMapId] = useState(maps[0]?.id ?? "");
  const [grenadeType, setGrenadeType] = useState(grenadeTypeValues[0]);
  const [side, setSide] = useState<"t" | "ct" | "both">("t");
  const [throwZone, setThrowZone] = useState("");
  const [targetZone, setTargetZone] = useState("");
  const [situation, setSituation] = useState(situationValues[0]);
  const [difficulty, setDifficulty] = useState(2);
  const [distance, setDistance] = useState(distanceValues[1]);
  const [videoUrl, setVideoUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [steps, setSteps] = useState<(CreateLineupStepInput & { key: number })[]>([
    { key: stepIdCounter++, order: 1, title: "", instruction: "", jumpthrow: false, clickType: "" },
  ]);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { key: stepIdCounter++, order: prev.length + 1, title: "", instruction: "", jumpthrow: false, clickType: "" },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 })));
  }

  function updateStep(index: number, patch: Partial<CreateLineupStepInput>) {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const input: CreateLineupInput = {
      name,
      mapId,
      grenadeType,
      side,
      throwZone,
      targetZone,
      situation,
      difficulty,
      distance,
      videoUrl,
      videoSource: "youtube",
      tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      steps: steps.map(({ key, ...step }) => {
        void key;
        return step;
      }),
    };

    startTransition(async () => {
      const result = await createLineupAction(input);
      if (result?.status === "error") setError(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>{t("name")}</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
          />
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
          <label className={labelClass}>{t("grenade")}</label>
          <select
            className={selectClass}
            value={grenadeType}
            onChange={(e) => setGrenadeType(e.target.value as typeof grenadeType)}
          >
            {grenadeTypeValues.map((g) => (
              <option key={g} value={g}>
                {tGrenade(g)}
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
          <label className={labelClass}>{t("situation")}</label>
          <select
            className={selectClass}
            value={situation}
            onChange={(e) => setSituation(e.target.value as typeof situation)}
          >
            {situationValues.map((s) => (
              <option key={s} value={s}>
                {tSituation(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>{t("throwZone")}</label>
          <Input value={throwZone} onChange={(e) => setThrowZone(e.target.value)} placeholder={t("throwZonePlaceholder")} required />
        </div>

        <div>
          <label className={labelClass}>{t("targetZone")}</label>
          <Input value={targetZone} onChange={(e) => setTargetZone(e.target.value)} placeholder={t("targetZonePlaceholder")} required />
        </div>

        <div>
          <label className={labelClass}>{t("distance")}</label>
          <select
            className={selectClass}
            value={distance}
            onChange={(e) => setDistance(e.target.value as typeof distance)}
          >
            {distanceValues.map((d) => (
              <option key={d} value={d}>
                {tDistance(d)}
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
          <label className={labelClass}>{t("video")}</label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t("videoPlaceholder")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("tags")}</label>
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t("tagsPlaceholder")}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">{t("steps")}</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addStep}>
            <Plus size={14} /> {t("addStep")}
          </Button>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.key} className="rounded-lg border border-border bg-background-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{t("stepN", { n: index + 1 })}</p>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    aria-label={t("removeStepAriaLabel")}
                    className="text-foreground-subtle hover:text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("stepTitle")}</label>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    placeholder={t("stepTitlePlaceholder")}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("click")}</label>
                  <select
                    className={selectClass}
                    value={step.clickType}
                    onChange={(e) => updateStep(index, { clickType: e.target.value as CreateLineupStepInput["clickType"] })}
                  >
                    <option value="">{t("unspecified")}</option>
                    {clickTypeValues.map((c) => (
                      <option key={c} value={c}>
                        {tClick(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>{t("instruction")}</label>
                  <Input
                    value={step.instruction}
                    onChange={(e) => updateStep(index, { instruction: e.target.value })}
                    placeholder={t("instructionPlaceholder")}
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground-muted sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={step.jumpthrow}
                    onChange={(e) => updateStep(index, { jumpthrow: e.target.checked })}
                    className="h-4 w-4 rounded border-border-strong"
                  />
                  {t("jumpthrow")}
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("publishing") : t("publish")}
      </Button>
    </form>
  );
}
