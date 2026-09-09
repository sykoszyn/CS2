import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ContentTypeEnum, ReportReason } from "@/types/database";

export interface PendingReport {
  id: string;
  contentType: ContentTypeEnum;
  contentId: string;
  reason: ReportReason;
  description: string | null;
  reporterUsername: string;
  createdAt: string;
  /** Null when the reported content was already deleted before the report got reviewed. */
  target: { title: string; href: string } | null;
}

const TARGET_TABLE: Partial<Record<ContentTypeEnum, { table: "lineups" | "boosts" | "plays"; base: string }>> = {
  lineup: { table: "lineups", base: "/lineups" },
  boost: { table: "boosts", base: "/boosts" },
  play: { table: "plays", base: "/plays" },
};

async function resolveTargets(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  contentType: ContentTypeEnum,
  contentIds: string[],
): Promise<Map<string, { title: string; href: string }>> {
  const result = new Map<string, { title: string; href: string }>();
  const spec = TARGET_TABLE[contentType];
  if (!spec || contentIds.length === 0) return result;

  const titleColumn = spec.table === "plays" ? "title" : "name";
  const { data } = await supabase.from(spec.table).select(`id, slug, ${titleColumn}`).in("id", contentIds);

  for (const row of (data ?? []) as unknown as { id: string; slug: string; name?: string; title?: string }[]) {
    result.set(row.id, { title: row.name ?? row.title ?? "", href: `${spec.base}/${row.slug}` });
  }

  return result;
}

/** Reports with status = 'pending', newest first, with the reported content's title/link resolved. */
export async function getPendingReports(): Promise<PendingReport[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("reports")
      .select("id, content_type, content_id, reason, description, created_at, profiles!reporter_id ( username )")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = data as unknown as {
      id: string;
      content_type: ContentTypeEnum;
      content_id: string;
      reason: ReportReason;
      description: string | null;
      created_at: string;
      profiles: { username: string } | null;
    }[];

    const byType = new Map<ContentTypeEnum, string[]>();
    for (const row of rows) {
      byType.set(row.content_type, [...(byType.get(row.content_type) ?? []), row.content_id]);
    }

    const targetsByType = new Map<ContentTypeEnum, Map<string, { title: string; href: string }>>();
    for (const [contentType, ids] of byType) {
      targetsByType.set(contentType, await resolveTargets(supabase, contentType, ids));
    }

    return rows.map((row) => ({
      id: row.id,
      contentType: row.content_type,
      contentId: row.content_id,
      reason: row.reason,
      description: row.description,
      reporterUsername: row.profiles?.username ?? "usuario eliminado",
      createdAt: row.created_at,
      target: targetsByType.get(row.content_type)?.get(row.content_id) ?? null,
    }));
  } catch {
    return [];
  }
}
