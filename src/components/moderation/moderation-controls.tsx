"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Trash2 } from "lucide-react";
import { removeContentAction, toggleVerifiedAction } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import type { ContentTypeEnum } from "@/types/database";

/** Admin/moderator-only quick actions shown directly on a content detail page. */
export function ModerationControls({
  contentType,
  contentId,
  verified,
  pathToRevalidate,
}: {
  contentType: ContentTypeEnum;
  contentId: string;
  /** Present only for lineups — the only content type with a verified flag. */
  verified?: boolean;
  pathToRevalidate: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleVerifyToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleVerifiedAction(contentId, verified ?? false, pathToRevalidate);
      if (result.status === "error") setError(result.message);
      else router.refresh();
    });
  }

  function handleRemove() {
    if (!confirm("¿Eliminar este contenido? Va a dejar de ser visible para todos.")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeContentAction(contentType, contentId, pathToRevalidate);
      if (result.status === "error") setError(result.message);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Moderación</span>
      {verified !== undefined && (
        <Button size="sm" variant="secondary" onClick={handleVerifyToggle} disabled={pending}>
          <ShieldCheck size={14} /> {verified ? "Quitar verificación" : "Verificar"}
        </Button>
      )}
      <Button size="sm" variant="danger" onClick={handleRemove} disabled={pending}>
        <Trash2 size={14} /> Eliminar
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
