"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { resolveReportAction } from "@/lib/reports/actions";
import { Button } from "@/components/ui/button";
import type { ContentTypeEnum } from "@/types/database";

export function ReportActions({
  reportId,
  contentType,
  contentId,
  hasTarget,
}: {
  reportId: string;
  contentType: ContentTypeEnum;
  contentId: string;
  hasTarget: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function resolve(action: "approve" | "reject") {
    if (action === "approve" && !confirm("¿Eliminar el contenido reportado?")) return;
    setError(null);
    startTransition(async () => {
      const result = await resolveReportAction(reportId, action, contentType, contentId);
      if (result.status === "error") setError(result.message);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button size="sm" variant="danger" onClick={() => resolve("approve")} disabled={pending || !hasTarget}>
          <Check size={14} /> Eliminar contenido
        </Button>
        <Button size="sm" variant="secondary" onClick={() => resolve("reject")} disabled={pending}>
          <X size={14} /> Descartar reporte
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
