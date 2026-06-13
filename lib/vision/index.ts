// Thin vision interface for plant diagnosis.
//
// Routing (first match wins):
//   1. VISION_ENDPOINT_URL set      → Andrew Brown's custom Qwen2.5-VL endpoint
//   2. VISION_PROVIDER=huggingface  → HuggingFace Inference API (Qwen2.5-VL)
//   3. otherwise                    → Claude Haiku vision (always-on fallback)

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
function normalizeDiagnosis(parsed: Record<string, unknown>, model: string): DiagnosisResult {
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
function parseDiagnosis(text: string, model: string): DiagnosisResult {
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
  // Try the configured provider first; fall back to Haiku on any failure so a
  // flaky/unavailable Qwen provider can never break diagnosis.
  try {
    if (endpoint) {
      return await diagnoseWithQwen(imageBase64, mimeType, endpoint, gardenContext);
    }
    if (process.env.VISION_PROVIDER === "huggingface") {
      return await diagnoseWithHuggingFace(imageBase64, mimeType, gardenContext);
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
            source: { type: "base64", media_type: mimeType as "image/jpeg", data: imageBase64 },
          },
          { type: "text", text: "Please diagnose this plant." },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  return parseDiagnosis(text, "claude-haiku-vision");
}

// HuggingFace Inference API — OpenAI-compatible chat completions with image input.
// Defaults to the HF router; set VISION_MODEL to pick a different VLM.
async function diagnoseWithHuggingFace(
  imageBase64: string,
  mimeType: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  const token = process.env.VISION_ENDPOINT_TOKEN || process.env.HF_TOKEN;
  const model = process.env.VISION_MODEL || "Qwen/Qwen2.5-VL-7B-Instruct";
  const url = process.env.VISION_HF_URL || "https://router.huggingface.co/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`HuggingFace vision request failed (${res.status})`);
  }

  const json = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "{}";
  return parseDiagnosis(text, `huggingface:${model}`);
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
