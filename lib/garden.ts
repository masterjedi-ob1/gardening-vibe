import { createAdminClient } from "@/lib/supabase/admin";

// Resolve the active garden id. For this MVP there is a single seeded garden
// (Chris & Bill's Summer 2026); once auth is wired this becomes per-user.
export async function getActiveGardenId(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gardens")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data?.id ?? null;
}
