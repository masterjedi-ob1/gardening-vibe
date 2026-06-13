import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveGardenId } from "@/lib/garden";
import { PlantStatus, SunRequirement } from "@/lib/types";
import { NextRequest } from "next/server";

const STATUSES: PlantStatus[] = ["wishlist", "planned", "planted", "growing", "harvesting", "done"];
const SUNS: SunRequirement[] = ["full", "partial", "shade"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return Response.json({ error: "A plant needs a name." }, { status: 400 });
    }

    const gardenId = await getActiveGardenId();
    if (!gardenId) {
      return Response.json({ error: "No garden found yet." }, { status: 404 });
    }

    const status: PlantStatus = STATUSES.includes(body.status) ? body.status : "planted";
    const sun: SunRequirement = SUNS.includes(body.sun) ? body.sun : "full";

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("plants")
      .insert({
        garden_id: gardenId,
        bed_id: body.bed_id || null,
        name,
        type: String(body.type ?? "herb").trim() || "herb",
        qty: Math.max(1, Number(body.qty) || 1),
        sun,
        notes: body.notes?.trim() || null,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ plant: data });
  } catch (error) {
    console.error("Create plant error:", error);
    return Response.json({ error: "Could not plant that just yet." }, { status: 500 });
  }
}
