import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service-role key. Use for trusted server-side
// writes (inventory CRUD) so guest-mode mutations succeed regardless of RLS.
// NEVER import this into client components — the service role bypasses RLS.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
