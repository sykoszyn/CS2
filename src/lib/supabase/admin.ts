import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses RLS entirely — only for trusted server-side
 * moderation/admin actions (Server Actions or Route Handlers), never for
 * requests scoped to "the current user". The `server-only` import makes any
 * accidental client-bundle usage a build error instead of a leaked secret.
 */
export function createAdminSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
