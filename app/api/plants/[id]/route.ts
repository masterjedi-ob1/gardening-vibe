import { createAdminClient } from "@/lib/supabase/admin";
import { PlantStatus, SunRequirement } from "@/lib/types";
import { NextRequest } from "next/server";

const STATUSES: PlantStatus[] = ["wishlist", "planned", "planted", "growing", "harvesting", "done"];
const SUNS: SunRequirement[] = ["full", "partial", "shade"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
    if (typeof body.type === "string" && body.type.trim()) update.type = body.type.trim();
    if (body.qty !== undefined) update.qty = Math.max(1, Number(body.qty) || 1);
    if (SUNS.includes(body.sun)) update.sun = body.sun;
    if (STATUSES.includes(body.status)) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes?.trim() || null;
    if (body.bed_id !== undefined) update.bed_id = body.bed_id || null;

    if (Object.keys(update).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("plants")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json({ plant: data });
  } catch (error) {
    console.error("Update plant error:", error);
    return Response.json({ error: "Could not update that plant." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("plants").delete().eq("id", params.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Delete plant error:", error);
    return Response.json({ error: "Could not remove that plant." }, { status: 500 });
  }
}
