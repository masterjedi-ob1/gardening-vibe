import { createClient } from "@/lib/supabase/server";
import { diagnoseImage } from "@/lib/vision";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const plantId = formData.get("plant_id") as string | undefined;
    const gardenContext = formData.get("garden_context") as string | undefined;

    if (!file) {
      return Response.json({ error: "No photo provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await diagnoseImage(base64, mimeType, gardenContext);

    // Persist to Supabase if connected
    try {
      const supabase = await createClient();
      const { data: gardens } = await supabase.from("gardens").select("id").limit(1).single();
      if (gardens?.id) {
        await supabase.from("diagnoses").insert({
          garden_id: gardens.id,
          plant_id: plantId ?? null,
          photo_url: "", // would be Supabase Storage URL in prod
          model: result.model,
          label: result.plant,
          confidence: result.confidence,
          advice: result.advice,
          raw_response: result,
        });
      }
    } catch {
      // Best-effort persistence
    }

    return Response.json(result);
  } catch (error) {
    console.error("Diagnose error:", error);
    return Response.json({ error: "Could not analyse photo." }, { status: 500 });
  }
}
