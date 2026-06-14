#!/usr/bin/env node
// Vision verification — proves the configured Qwen provider actually answers (and
// that you're on Qwen, not the Haiku fallback). Mirrors the request lib/vision
// sends. Run it where outbound network is allowed (your machine or the deploy).
//
// Usage (reads .env.local-style vars from the environment):
//   VISION_PROVIDER=openrouter \
//   VISION_MODEL=qwen/qwen2.5-vl-72b-instruct \
//   VISION_API_KEY=sk-or-... \
//     node scripts/verify-vision.mjs
//
// Keep these preset URLs in sync with lib/vision/providers.ts.
const PRESETS = {
  huggingface: "https://router.huggingface.co/v1/chat/completions",
  hyperbolic: "https://api.hyperbolic.xyz/v1/chat/completions",
  together: "https://api.together.xyz/v1/chat/completions",
  novita: "https://api.novita.ai/v3/openai/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};
const DEFAULT_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";

const provider = (process.env.VISION_PROVIDER || "").trim().toLowerCase();
const url = process.env.VISION_API_URL || process.env.VISION_HF_URL || PRESETS[provider];
const model = process.env.VISION_MODEL || DEFAULT_MODEL;
const key =
  process.env.VISION_API_KEY || process.env.VISION_ENDPOINT_TOKEN || process.env.HF_TOKEN;

if (!url) {
  console.error("✗ No Qwen provider configured. Set VISION_PROVIDER (e.g. openrouter) or VISION_API_URL.");
  process.exit(1);
}
console.log(`→ provider: ${provider || "(explicit url)"}\n→ url:      ${url}\n→ model:    ${model}`);

// 1x1 PNG — enough to exercise the vision request path end to end.
const PIXEL =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const body = {
  model,
  max_tokens: 200,
  messages: [
    { role: "system", content: "You are a plant vision assistant. Reply with a short JSON object." },
    {
      role: "user",
      content: [
        { type: "text", text: 'Reply with {"ok":true,"note":"vision reachable"} as JSON.' },
        { type: "image_url", image_url: { url: `data:image/png;base64,${PIXEL}` } },
      ],
    },
  ],
};

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`\n✗ HTTP ${res.status}\n${text.slice(0, 400)}`);
    console.error(
      "\nIf this is a 400 about the model, the id likely doesn't match what the provider serves\n" +
        "(OpenRouter 72B = qwen/qwen2.5-vl-72b-instruct, 7B = qwen/qwen-2.5-vl-7b-instruct).\n" +
        "A wrong id makes the app silently fall back to Haiku."
    );
    process.exit(1);
  }
  let content = "";
  try {
    content = JSON.parse(text)?.choices?.[0]?.message?.content ?? "";
  } catch {
    content = text.slice(0, 200);
  }
  console.log(`\n✓ HTTP ${res.status} — the provider answered.`);
  console.log(`  model reply: ${String(content).slice(0, 160)}`);
  console.log(`\nRESULT: PASS — Qwen vision is reachable via ${provider || url}. 🌱`);
} catch (err) {
  console.error(`\n✗ Request failed: ${err?.message ?? err}`);
  process.exit(1);
}
