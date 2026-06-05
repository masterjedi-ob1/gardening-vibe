import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
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
    const supabase = await createClient();
    const body = await request.json();

    const { data: garden } = await supabase
      .from("gardens")
      .select("id")
      .limit(1)
      .single();

    if (!garden?.id) {
      return Response.json({ error: "No garden found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        garden_id: garden.id,
        plant_id: body.plant_id ?? null,
        note: body.note,
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
