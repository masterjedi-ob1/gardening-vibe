// Thin vision interface — swap Qwen2.5-VL in here when Andrew's endpoint is ready
// Day 1-3 fallback: Claude Haiku vision

export interface DiagnosisResult {
  plant: string;
  health: "healthy" | "stressed" | "diseased" | "pest-damaged" | "nutrient-deficient" | "unknown";
  confidence: number; // 0–1
  summary: string;    // calm, one-line summary
  advice: string;     // warm, practical next steps
  flags: string[];    // e.g. ["overwatering", "aphids"]
  model: string;
}

export async function diagnoseImage(
  imageBase64: string,
  mimeType: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  const endpoint = process.env.VISION_ENDPOINT_URL;

  if (endpoint) {
    return diagnoseWithQwen(imageBase64, mimeType, endpoint, gardenContext);
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

  const systemPrompt = `You are the Green Thumb, a warm and knowledgeable garden coach. Analyze this plant photo and respond ONLY with valid JSON matching this schema:
{
  "plant": "common name or 'unknown'",
  "health": "healthy|stressed|diseased|pest-damaged|nutrient-deficient|unknown",
  "confidence": 0.85,
  "summary": "One calm sentence about what you see.",
  "advice": "Two to three warm, practical sentences of next steps.",
  "flags": ["optional", "issue", "tags"]
}
${gardenContext ? `\n\nGarden context: ${gardenContext}` : ""}
Be encouraging, never alarming. Suggest consulting a local extension service for serious issues.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: systemPrompt,
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
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return { ...parsed, model: "claude-haiku-vision" } as DiagnosisResult;
}

async function diagnoseWithQwen(
  imageBase64: string,
  mimeType: string,
  endpoint: string,
  gardenContext?: string
): Promise<DiagnosisResult> {
  // Andrew Brown's Qwen2.5-VL endpoint — same JSON schema as Haiku above
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
  const json = await res.json();
  return { ...json, model: "qwen2.5-vl" } as DiagnosisResult;
}
