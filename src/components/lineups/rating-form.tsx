"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Star } from "lucide-react";
import { submitRatingAction } from "@/lib/lineups/actions";
import { initialRatingActionState } from "@/lib/lineups/rating-action-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function RatingForm({
  lineupId,
  lineupSlug,
  initialStars,
  initialWorked,
}: {
  lineupId: string;
  lineupSlug: string;
  initialStars?: number;
  initialWorked?: boolean;
}) {
  const [state, formAction] = useActionState(submitRatingAction, initialRatingActionState);
  const [stars, setStars] = useState(initialStars ?? 0);
  const [worked, setWorked] = useState<boolean | null>(initialWorked ?? null);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-background-card p-4">
      <input type="hidden" name="lineupId" value={lineupId} />
      <input type="hidden" name="lineupSlug" value={lineupSlug} />
      <input type="hidden" name="stars" value={stars} />
      <input type="hidden" name="worked" value={worked === null ? "" : String(worked)} />

      <p className="font-display text-sm font-semibold">Calificá este lineup</p>

      <div className="mt-3 flex items-center gap-4">
        <div>
          <p className="mb-1 text-xs text-foreground-subtle">Estrellas</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} estrellas`}>
                <Star
                  size={20}
                  className={n <= stars ? "fill-warning text-warning" : "fill-transparent text-border-strong"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-foreground-subtle">¿Funcionó?</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setWorked(true)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                worked === true
                  ? "border-success bg-success/10 text-success"
                  : "border-border text-foreground-muted",
              )}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setWorked(false)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                worked === false ? "border-danger bg-danger/10 text-danger" : "border-border text-foreground-muted",
              )}
            >
              No
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SubmitButton disabled={stars === 0 || worked === null} />
      </div>

      {state.status !== "idle" && (
        <p className={cn("mt-2 text-xs", state.status === "success" ? "text-success" : "text-danger")}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? "Guardando..." : "Calificar"}
    </Button>
  );
}
