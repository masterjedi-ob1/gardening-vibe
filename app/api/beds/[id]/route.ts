import { createAdminClient } from "@/lib/supabase/admin";
import { isBedType } from "@/lib/types";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
    if (isBedType(body.type)) update.type = body.type;
    if (body.notes !== undefined) update.notes = typeof body.notes === "string" ? body.notes.trim() || null : null;

    if (Object.keys(update).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("beds")
      .update(update)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return Response.json({ bed: data });
  } catch (error) {
    console.error("Update bed error:", error);
    return Response.json({ error: "Could not update that bed." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Plants in this bed have bed_id set to null via the FK (on delete set null).
    const supabase = createAdminClient();
    const { error } = await supabase.from("beds").delete().eq("id", params.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Delete bed error:", error);
    return Response.json({ error: "Could not remove that bed." }, { status: 500 });
  }
}
