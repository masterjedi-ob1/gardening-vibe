import { createClient } from "@/lib/supabase/server";
import { getTodaysPrompt } from "@/lib/ai/prompts";
import { NextRequest } from "next/server";

export async function GET() {
  const prompt = getTodaysPrompt();
  return Response.json({ prompt });
}

export async function POST(request: NextRequest) {
  try {
    const { response, gardener_id, prompt, tradition } = await request.json();
    const supabase = await createClient();

    // Get today's streak
    const today = new Date().toISOString().split("T")[0];
    const { data: last } = await supabase
      .from("checkins")
      .select("streak_day, created_at")
      .eq("gardener_id", gardener_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const lastDate = last?.created_at?.split("T")[0];
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
    const streak = lastDate === yesterday ? (last?.streak_day ?? 0) + 1 : 1;

    const { data, error } = await supabase
      .from("checkins")
      .insert({ gardener_id, prompt, tradition, response, streak_day: streak })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ checkin: data, streak });
  } catch (error) {
    console.error("Checkin error:", error);
    return Response.json({ error: "Could not save check-in." }, { status: 500 });
  }
}
