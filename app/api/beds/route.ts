import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveGardenId } from "@/lib/garden";
import { BedType } from "@/lib/types";
import { NextRequest } from "next/server";

const BED_TYPES: BedType[] = ["raised", "container", "in-ground", "pot"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return Response.json({ error: "Give the bed a name." }, { status: 400 });
    }

    const gardenId = await getActiveGardenId();
    if (!gardenId) {
      return Response.json({ error: "No garden found yet." }, { status: 404 });
    }

    const type: BedType = BED_TYPES.includes(body.type) ? body.type : "raised";

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("beds")
      .insert({
        garden_id: gardenId,
        name,
        type,
        notes: body.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ bed: data });
  } catch (error) {
    console.error("Create bed error:", error);
    return Response.json({ error: "Could not add that bed." }, { status: 500 });
  }
}
