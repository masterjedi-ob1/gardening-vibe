// Qwen2.5-VL hosting providers.
//
// Inference providers (Hyperbolic, Together, Novita, OpenRouter, the HF router)
// all speak the OpenAI-compatible /v1/chat/completions shape with image_url
// input — so one code path serves them all; only the base URL, model id, and key
// differ. Qwen is the priority vision model; Claude Haiku is the automatic
// fallback only when no provider is configured or a provider call fails.

export const VISION_PROVIDER_PRESETS: Record<string, string> = {
  huggingface: "https://router.huggingface.co/v1/chat/completions",
  hyperbolic: "https://api.hyperbolic.xyz/v1/chat/completions",
  together: "https://api.together.xyz/v1/chat/completions",
  novita: "https://api.novita.ai/v3/openai/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

export const DEFAULT_VISION_MODEL = "Qwen/Qwen2.5-VL-7B-Instruct";

export interface OpenAIVisionConfig {
  url: string;
  model: string;
  label: string; // shown in the UI as "Powered by …"
}

type Env = Record<string, string | undefined>;

// Resolve an OpenAI-compatible Qwen endpoint from env, or null if not configured.
// Precedence:
//   1. VISION_API_URL — explicit chat-completions URL for any provider
//   2. VISION_HF_URL  — back-compat alias for the same
//   3. VISION_PROVIDER — a named preset (huggingface | hyperbolic | together | …)
export function resolveOpenAIVisionConfig(env: Env = process.env): OpenAIVisionConfig | null {
  const provider = (env.VISION_PROVIDER || "").trim().toLowerCase();
  const explicitUrl = env.VISION_API_URL || env.VISION_HF_URL;
  const url = explicitUrl || (provider ? VISION_PROVIDER_PRESETS[provider] : undefined);
  if (!url) return null;
  const model = env.VISION_MODEL || DEFAULT_VISION_MODEL;
  const label = provider ? `${provider}:${model}` : model;
  return { url, model, label };
}

// The provider key. VISION_API_KEY is the canonical name; the older
// VISION_ENDPOINT_TOKEN / HF_TOKEN are still accepted.
export function resolveVisionToken(env: Env = process.env): string | undefined {
  return env.VISION_API_KEY || env.VISION_ENDPOINT_TOKEN || env.HF_TOKEN || undefined;
}
