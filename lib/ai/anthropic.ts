import type Anthropic from "@anthropic-ai/sdk";

// Calm, in-character degraded messages — never a raw stack trace or red error.
export const COACH_NO_KEY =
  "I'm resting just now — the garden's AI coach needs an Anthropic API key configured before I can chat. Once that's set, I'll be right here. 🌿";
export const COACH_DECLINED =
  "That's a little outside what I can help with as your garden coach. Let's bring it back to the garden — what are you noticing in your plants today? 🌱";
export const COACH_EMPTY =
  "I lost my train of thought there. Could you ask me again?";

// Safely pull the assistant's text out of a Messages API response.
//
// Handles the cases the original code missed: a `refusal` stop reason (the model
// declined — possible on safety-adjacent gardening questions), and an empty or
// non-text content array. Returns a calm fallback string rather than "" so the
// chat thread always reads naturally.
export function extractAssistantText(message: Anthropic.Message): string {
  if (message.stop_reason === "refusal") return COACH_DECLINED;
  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
  return text || COACH_EMPTY;
}
