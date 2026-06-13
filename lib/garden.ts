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
    .maybeSingle();
  return data?.id ?? null;
}

// The shape the coach needs to ground its replies. Kept loose on purpose so the
// formatter works with the trimmed column selection the chat route uses.
export interface GardenContextPlant {
  name: string;
  type: string;
  qty: number;
  status: string | null;
  notes?: string | null;
  sun?: string | null;
}
export interface GardenContextBed {
  name: string;
}

// Pure formatter: turns the live garden into a compact block for the system
// prompt. Returns null when there is nothing to ground on, so the caller can
// skip the section entirely. Extracted so it can be unit-tested without Supabase.
export function formatGardenContext(
  plants: GardenContextPlant[] | null | undefined,
  beds: GardenContextBed[] | null | undefined
): string | null {
  if (!plants?.length) return null;
  const active = plants.filter((p) => p.status !== "wishlist");
  const wishlist = plants.filter((p) => p.status === "wishlist");
  const bedNames = beds?.map((b) => b.name).join(", ") || "none";
  const activeLine = active
    .map((p) => `${p.name} ×${p.qty} (${p.type}${p.notes ? ", " + p.notes : ""})`)
    .join("; ");
  return (
    `Beds: ${bedNames}\n` +
    `Active plants (${active.length}): ${activeLine || "none"}\n` +
    `Wishlist: ${wishlist.map((p) => p.name).join(", ") || "none"}`
  );
}
