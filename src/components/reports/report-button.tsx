"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Flag } from "lucide-react";
import { submitReportAction } from "@/lib/reports/actions";
import { reportReasonOptions } from "@/lib/labels/report-labels";
import { Button } from "@/components/ui/button";
import type { ContentTypeEnum, ReportReason } from "@/types/database";

export function ReportButton({
  contentType,
  contentId,
  isLoggedIn,
}: {
  contentType: ContentTypeEnum;
  contentId: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>(reportReasonOptions[0].value);
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function handleOpen() {
    if (!isLoggedIn) {
      router.push(`/login?next=${pathname}`);
      return;
    }
    setOpen(true);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitReportAction(contentType, contentId, reason, description, pathname);
      if (result.status === "error") {
        setError(result.message);
      } else {
        setSent(true);
        setOpen(false);
      }
    });
  }

  if (sent) {
    return <p className="text-xs text-foreground-subtle">Gracias, revisamos tu reporte.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground-muted hover:text-foreground"
      >
        <Flag size={14} /> Reportar
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-2 rounded-md border border-border bg-background-card p-3">
      <p className="text-sm font-semibold">Reportar contenido</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand"
      >
        {reportReasonOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detalles (opcional)"
        rows={2}
        maxLength={1000}
        className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={pending}>
          {pending ? "Enviando..." : "Enviar reporte"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
