import type { ReportReason } from "@/types/database";

/** Display labels live in messages/*.json under "labels.reportReason". */
export const reportReasonValues: ReportReason[] = [
  "spam",
  "incorrect",
  "offensive",
  "copyright",
  "false_info",
  "duplicate",
  "other",
];
