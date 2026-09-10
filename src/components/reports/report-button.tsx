"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Flag } from "lucide-react";
import { submitReportAction } from "@/lib/reports/actions";
import { reportReasonValues } from "@/lib/labels/report-labels";
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
  const [reason, setReason] = useState<ReportReason>(reportReasonValues[0]);
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("reportButton");
  const tReason = useTranslations("labels.reportReason");

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
    return <p className="text-xs text-foreground-subtle">{t("thanks")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground-muted hover:text-foreground"
      >
        <Flag size={14} /> {t("trigger")}
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-2 rounded-md border border-border bg-background-card p-3">
      <p className="text-sm font-semibold">{t("formTitle")}</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand"
      >
        {reportReasonValues.map((value) => (
          <option key={value} value={value}>
            {tReason(value)}
          </option>
        ))}
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("detailsPlaceholder")}
        rows={2}
        maxLength={1000}
        className="w-full rounded-md border border-border bg-background-elevated px-3 py-2 text-sm text-foreground outline-none focus-visible:border-brand"
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={pending}>
          {pending ? t("sending") : t("submit")}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
