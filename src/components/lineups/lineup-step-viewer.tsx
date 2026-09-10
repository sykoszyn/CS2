"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MousePointerClick, ArrowUpFromLine } from "lucide-react";
import type { LineupStep } from "@/types/content";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function LineupStepViewer({ steps, big = false }: { steps: LineupStep[]; big?: boolean }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const t = useTranslations("lineups.stepViewer");
  const tClick = useTranslations("labels.clickType");
  const tThrow = useTranslations("labels.throwTechnique");

  return (
    <div className={cn("rounded-lg border border-border bg-background-card", big && "border-brand/30")}>
      <div className="relative">
        <MediaPlaceholder
          label={step.title}
          seed={index}
          className={cn("w-full", big ? "h-72 sm:h-[28rem]" : "h-64 sm:h-80")}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold">
          {t("stepOf", { current: index + 1, total: steps.length })}
        </span>
      </div>

      <div className={cn(big ? "p-6" : "p-4")}>
        <p className={cn("font-display font-semibold", big ? "text-2xl" : "text-lg")}>{step.title}</p>
        <p className={cn("mt-1 text-foreground-muted", big ? "text-base" : "text-sm")}>{step.instruction}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {step.clickType && (
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground-muted">
              <MousePointerClick size={12} />
              {tClick(step.clickType)}
            </span>
          )}
          {step.throwTechnique !== "normal" && (
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-foreground-muted">
              <ArrowUpFromLine size={12} />
              {tThrow(step.throwTechnique)}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
          >
            <ChevronLeft size={14} /> {t("previous")}
          </Button>

          <div className="flex gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={t("goToStep", { step: i + 1 })}
                className={cn(
                  "h-1.5 w-5 rounded-full transition-colors",
                  i === index ? "bg-brand" : "bg-border-strong",
                )}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
            disabled={index === steps.length - 1}
          >
            {t("next")} <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
