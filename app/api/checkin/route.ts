import { createGuestDataClient } from "@/lib/supabase/data";
import { getTodaysPrompt } from "@/lib/ai/prompts";
import { computeStreak } from "@/lib/streak";
import { NextRequest } from "next/server";

export async function GET() {
  const prompt = getTodaysPrompt();
  return Response.json({ prompt });
}

export async function POST(request: NextRequest) {
  try {
    const { response, gardener_id, prompt, tradition } = await request.json();

    if (typeof response !== "string" || !response.trim()) {
      return Response.json({ error: "Add a reflection before saving." }, { status: 400 });
    }

    // Guest-mode writes go through the service-role client — the anon client is
    // blocked by RLS for guest (gardener_id NULL) check-ins. See
    // lib/supabase/data.ts.
    const supabase = createGuestDataClient();

    // Find the most recent check-in for this gardener. `.eq(col, null)` does NOT
    // match NULL rows in PostgREST — guest check-ins (gardener_id NULL) need
    // `.is()`, otherwise the previous entry is never found and the streak resets.
    const baseQuery = supabase
      .from("checkins")
      .select("streak_day, created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    const { data: last } =
      gardener_id == null
        ? await baseQuery.is("gardener_id", null).maybeSingle()
        : await baseQuery.eq("gardener_id", gardener_id).maybeSingle();

    const today = new Date().toISOString().split("T")[0];
    const lastDate = last?.created_at?.split("T")[0];
    const streak = computeStreak(lastDate, last?.streak_day, today);

    const { data, error } = await supabase
      .from("checkins")
      .insert({ gardener_id: gardener_id ?? null, prompt, tradition, response, streak_day: streak })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ checkin: data, streak });
  } catch (error) {
    console.error("Checkin error:", error);
    return Response.json({ error: "Could not save check-in." }, { status: 500 });
  }
}
