import type { ReportReason } from "@/types/database";

export const reportReasonLabels: Record<ReportReason, string> = {
  spam: "Spam",
  incorrect: "No funciona / información incorrecta",
  offensive: "Contenido ofensivo",
  copyright: "Copyright",
  false_info: "Información falsa",
  duplicate: "Contenido duplicado",
  other: "Otro",
};

export const reportReasonOptions = Object.entries(reportReasonLabels).map(([value, label]) => ({
  value: value as ReportReason,
  label,
}));
