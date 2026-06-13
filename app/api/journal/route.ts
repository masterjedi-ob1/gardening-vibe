import { createGuestDataClient } from "@/lib/supabase/data";
import { getActiveGardenId } from "@/lib/garden";
import { NextRequest } from "next/server";

// Guest-mode journal access goes through the service-role client; the anon client
// would be blocked by RLS for the seeded (gardener_id NULL) garden. See
// lib/supabase/data.ts.

export async function GET() {
  try {
    const supabase = createGuestDataClient();
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*, plants(name, type)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return Response.json({ entries: data ?? [] });
  } catch {
    return Response.json({ entries: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const gardenId = await getActiveGardenId();
    if (!gardenId) {
      return Response.json({ error: "No garden found yet." }, { status: 404 });
    }

    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note) {
      return Response.json({ error: "Add a note for this entry." }, { status: 400 });
    }

    const supabase = createGuestDataClient();
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        garden_id: gardenId,
        plant_id: body.plant_id ?? null,
        note,
        photo_url: body.photo_url ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ entry: data });
  } catch (error) {
    console.error("Journal error:", error);
    return Response.json({ error: "Could not save journal entry." }, { status: 500 });
  }
}
