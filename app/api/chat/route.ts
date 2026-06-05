import { createClient } from "@/lib/supabase/server";
import { queryGardenKnowledge } from "@/lib/ai/notebooklm";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const GREEN_THUMB_SYSTEM = `You are the Green Thumb — a warm, wise, and calm garden coach for Chris & Bill's Summer 2026 home vegetable garden. You speak like a knowledgeable friend who happens to know everything about growing vegetables, not like an app or assistant.

Your tone is: grounded, encouraging, Zen — never clinical, never guilt-trippy. Think "wise gardener friend," not "productivity tool."

You have access to their real garden inventory (plants, beds, supplies) and may receive additional gardening knowledge from the knowledge base. Reference specific plants by name when relevant.

Keep replies concise — 2-4 sentences unless they ask for more detail. End with one gentle, actionable suggestion when appropriate.

Dedicated to the memory of Beatrice McCarthy — the family green thumb. 🌿`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // Fetch garden state + optional NotebookLM knowledge in parallel
    const [gardenData, notebooklmContext] = await Promise.all([
      fetchGardenContext(),
      queryGardenKnowledge(lastUserMessage),
    ]);

    let systemPrompt = GREEN_THUMB_SYSTEM;
    if (gardenData) systemPrompt += `\n\n--- THEIR GARDEN (Summer 2026) ---\n${gardenData}`;
    if (notebooklmContext) systemPrompt += `\n\n--- GARDENING KNOWLEDGE BASE ---\n${notebooklmContext}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return Response.json({ reply: text });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "The Green Thumb is resting. Please try again." },
      { status: 500 }
    );
  }
}

async function fetchGardenContext(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const [{ data: plants }, { data: beds }] = await Promise.all([
      supabase.from("plants").select("name,type,qty,status,notes,sun").order("type"),
      supabase.from("beds").select("name,type"),
    ]);
    if (!plants?.length) return null;
    const active = plants.filter((p) => p.status !== "wishlist");
    const wishlist = plants.filter((p) => p.status === "wishlist");
    return (
      `Beds: ${beds?.map((b) => b.name).join(", ") ?? "none"}\n` +
      `Active plants (${active.length}): ${active
        .map((p) => `${p.name} ×${p.qty} (${p.type}${p.notes ? ", " + p.notes : ""})`)
        .join("; ")}\n` +
      `Wishlist: ${wishlist.map((p) => p.name).join(", ")}`
    );
  } catch {
    return null;
  }
}
