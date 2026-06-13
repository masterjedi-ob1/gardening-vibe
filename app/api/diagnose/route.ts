import { createGuestDataClient } from "@/lib/supabase/data";
import { diagnoseImage } from "@/lib/vision";
import { isSupportedImageType, UNSUPPORTED_IMAGE_MESSAGE } from "@/lib/vision/mime";
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

    // Reject unsupported formats (notably iPhone HEIC) up front with a calm,
    // actionable message instead of letting the vision provider 400.
    if (!isSupportedImageType(file.type)) {
      return Response.json({ error: UNSUPPORTED_IMAGE_MESSAGE }, { status: 415 });
    }

    // The Haiku fallback can't run without a key; if no vision provider is
    // configured either, fail clearly rather than throwing deep in the stack.
    const hasProvider =
      !!process.env.VISION_ENDPOINT_URL ||
      process.env.VISION_PROVIDER === "huggingface" ||
      !!process.env.ANTHROPIC_API_KEY;
    if (!hasProvider) {
      return Response.json(
        { error: "Plant diagnosis isn't configured yet — add a vision provider or an Anthropic API key." },
        { status: 503 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const result = await diagnoseImage(base64, mimeType, gardenContext);

    // Persist to Supabase if connected (best-effort). Guest-mode writes go
    // through the service-role client — the anon client is blocked by RLS for the
    // seeded (gardener_id NULL) garden. See lib/supabase/data.ts.
    try {
      const supabase = createGuestDataClient();
      const { data: gardens } = await supabase.from("gardens").select("id").limit(1).maybeSingle();
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
    } catch (persistError) {
      console.error("Diagnose persistence skipped:", persistError);
    }

    return Response.json(result);
  } catch (error) {
    console.error("Diagnose error:", error);
    return Response.json({ error: "Could not analyse photo. Please try again." }, { status: 500 });
  }
}
