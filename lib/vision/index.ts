// Thin vision interface for plant diagnosis.
//
// Routing (first match wins):
//   1. VISION_ENDPOINT_URL set         → Andrew Brown's bespoke Qwen2.5-VL endpoint
//                                        ({image, context} body)
//   2. an OpenAI-compatible Qwen provider (VISION_API_URL / VISION_PROVIDER preset
//      such as hyperbolic | together | novita | huggingface) → that provider
//   3. otherwise                       → Claude Haiku vision (automatic fallback)
//
// Qwen is the priority model; Haiku is only the fallback when no provider is
// configured or a provider call fails.

import { normalizeImageMime } from "./mime";
import {
  resolveOpenAIVisionConfig,
  resolveVisionToken,
  type OpenAIVisionConfig,
} from "./providers";

export interface DiagnosisResult {
  plant: string;
  health: "healthy" | "stressed" | "diseased" | "pest-damaged" | "nutrient-deficient" | "unknown";
  confidence: number; // 0–1
  summary: string;    // calm, one-line summary
  advice: string;     // warm, practical next steps
  flags: string[];    // e.g. ["overwatering", "aphids"]
  model: string;
}

// Shared instruction so every model returns the same JSON shape.
function buildSystemPrompt(gardenContext?: string): string {
  return `You are the Green Thumb, a warm and knowledgeable garden coach. Analyze this plant photo and respond ONLY with valid JSON matching this schema:
{
  "plant": "common name or 'unknown'",
  "health": "healthy|stressed|diseased|pest-damaged|nutrient-deficient|unknown",
  "confidence": 0.85,
  "summary": "One calm sentence about what you see.",
  "advice": "Two to three warm, practical sentences of next steps.",
  "flags": ["optional", "issue", "tags"]
}${gardenContext ? `\n\nGarden context: ${gardenContext}` : ""}
Be encouraging, never alarming. Suggest consulting a local extension service for serious issues.`;
}

// Coerce an arbitrary object into a safe DiagnosisResult so the UI never sees
// undefined fields (it reads result.flags.length and result.confidence).
export function normalizeDiagnosis(parsed: Record<string, unknown>, model: string): DiagnosisResult {
  return {
    plant: typeof parsed.plant === "string" ? parsed.plant : "unknown",
    health: (parsed.health as DiagnosisResult["health"]) ?? "unknown",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    advice: typeof parsed.advice === "string" ? parsed.advice : "",
    flags: Array.isArray(parsed.flags) ? parsed.flags.map(String) : [],
    model,
  };
}

// Pull the first JSON object out of a model's text response; never throws.
export function parseDiagnosis(text: string, model: string): DiagnosisResult {
  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // Model returned prose or malformed JSON — degrade to safe defaults.
  }
  return normalizeDiagnosis(parsed, model);
}

export async function diagnoseImage(
  imageBase64: string,
  mimeType: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  const endpoint = process.env.VISION_ENDPOINT_URL;
  const openai = resolveOpenAIVisionConfig();
  // Try the configured Qwen provider first; fall back to Haiku on any failure so
  // a flaky/unavailable provider can never break diagnosis.
  try {
    if (endpoint) {
      return await diagnoseWithQwen(imageBase64, mimeType, endpoint, gardenContext);
    }
    if (openai) {
      return await diagnoseWithOpenAICompatible(imageBase64, mimeType, openai, gardenContext);
    }
  } catch (err) {
    console.error("Primary vision provider failed; falling back to Haiku:", err);
  }
  return diagnoseWithHaiku(imageBase64, mimeType, gardenContext);
}

async function diagnoseWithHaiku(
  imageBase64: string,
  mimeType: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  const { Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Anthropic vision only accepts jpeg/png/gif/webp. Normalise (HEIC/unknown is
  // rejected upstream in the route) and default to jpeg so we never send a
  // media_type the API will 400 on.
  const mediaType = normalizeImageMime(mimeType) ?? "image/jpeg";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: buildSystemPrompt(gardenContext),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          { type: "text", text: "Please diagnose this plant." },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return parseDiagnosis(text, "claude-haiku-vision");
}

// OpenAI-compatible chat completions with image input — the shared path for any
// Qwen2.5-VL inference provider (Hyperbolic, Together, Novita, OpenRouter, the HF
// router). URL/model/key come from env via resolveOpenAIVisionConfig.
async function diagnoseWithOpenAICompatible(
  imageBase64: string,
  mimeType: string,
  config: OpenAIVisionConfig,
  gardenContext?: string
): Promise<DiagnosisResult> {
  const token = resolveVisionToken();
  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 512,
      messages: [
        { role: "system", content: buildSystemPrompt(gardenContext) },
        {
          role: "user",
          content: [
            { type: "text", text: "Please diagnose this plant. Reply with JSON only." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Qwen vision request failed (${res.status})`);
  }

  const json = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "{}";
  return parseDiagnosis(text, config.label);
}

async function diagnoseWithQwen(
  imageBase64: string,
  mimeType: string,
  endpoint: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  // Andrew Brown's Qwen2.5-VL endpoint — returns the same JSON schema.
  const token = process.env.VISION_ENDPOINT_TOKEN;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      image: `data:${mimeType};base64,${imageBase64}`,
      context: gardenContext ?? "",
    }),
  });

  if (!res.ok) {
    throw new Error(`Qwen vision request failed (${res.status})`);
  }

  const json = await res.json();
  // Custom endpoints may return either the schema directly or a wrapped text blob.
  if (typeof json?.answer === "string" || typeof json?.text === "string") {
    return parseDiagnosis(json.answer ?? json.text, "qwen2.5-vl");
  }
  return normalizeDiagnosis(json ?? {}, "qwen2.5-vl");
}
