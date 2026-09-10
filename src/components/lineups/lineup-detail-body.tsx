"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Target } from "lucide-react";
import type { LineupStep } from "@/types/content";
import { LineupStepViewer } from "@/components/lineups/lineup-step-viewer";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Owns the practice-mode toggle for a lineup's detail page: steps always
 * render, but rating/tags/comments (the `secondary` slot, passed in
 * pre-rendered from the server) hide while practicing so the step viewer
 * gets the full width and attention.
 */
export function LineupDetailBody({ steps, secondary }: { steps: LineupStep[]; secondary: ReactNode }) {
  const [practice, setPractice] = useState(false);
  const t = useTranslations("lineups.detail");

  return (
    <>
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t("stepsTitle")}</h2>
          {steps.length > 0 && (
            <Button variant={practice ? "primary" : "secondary"} size="sm" onClick={() => setPractice((v) => !v)}>
              <Target size={14} /> {practice ? t("exitPractice") : t("practiceMode")}
            </Button>
          )}
        </div>
        {steps.length > 0 ? (
          <LineupStepViewer steps={steps} big={practice} />
        ) : (
          <EmptyState title={t("noSteps")} />
        )}
      </div>

      {!practice && secondary}
    </>
  );
}
