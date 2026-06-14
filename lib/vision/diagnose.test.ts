import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Shared mock for the Anthropic Haiku fallback. The vision module does
// `const { Anthropic } = await import("@anthropic-ai/sdk")`, so we mock both the
// named and default exports.
const haikuCreate = vi.hoisted(() => vi.fn());
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    messages = { create: haikuCreate };
    constructor(_opts?: unknown) {}
  }
  return { default: Anthropic, Anthropic };
});

import { diagnoseImage } from "./index";

const HAIKU_JSON =
  '{"plant":"Tomato","health":"healthy","confidence":0.88,"summary":"Looks good.","advice":"Keep it up.","flags":[]}';
const QWEN_JSON =
  '{"plant":"Basil","health":"stressed","confidence":0.6,"summary":"Wilting.","advice":"Water.","flags":["underwatering"]}';

function haikuTextResponse(text: string) {
  return { content: [{ type: "text", text }], stop_reason: "end_turn" };
}

const ENV_KEYS = [
  "VISION_ENDPOINT_URL",
  "VISION_PROVIDER",
  "VISION_ENDPOINT_TOKEN",
  "VISION_API_URL",
  "VISION_HF_URL",
  "VISION_API_KEY",
  "VISION_MODEL",
  "HF_TOKEN",
  "ANTHROPIC_API_KEY",
];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.ANTHROPIC_API_KEY = "test-key";
  haikuCreate.mockReset();
  vi.restoreAllMocks();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("diagnoseImage routing", () => {
  it("uses the Haiku fallback when no provider is configured", async () => {
    haikuCreate.mockResolvedValue(haikuTextResponse(HAIKU_JSON));
    const r = await diagnoseImage("BASE64", "image/jpeg");
    expect(haikuCreate).toHaveBeenCalledOnce();
    expect(r.model).toBe("claude-haiku-vision");
    expect(r.plant).toBe("Tomato");
  });

  it("uses an OpenAI-compatible provider preset (hyperbolic) and sends the right URL/model", async () => {
    process.env.VISION_PROVIDER = "hyperbolic";
    process.env.VISION_API_KEY = "provider-key";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: QWEN_JSON } }] }), { status: 200 })
    );
    const r = await diagnoseImage("BASE64", "image/png");
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.hyperbolic.xyz/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer provider-key");
    expect(JSON.parse(init.body as string).model).toBe("Qwen/Qwen2.5-VL-7B-Instruct");
    expect(haikuCreate).not.toHaveBeenCalled();
    expect(r.model).toBe("hyperbolic:Qwen/Qwen2.5-VL-7B-Instruct");
    expect(r.plant).toBe("Basil");
  });

  it("still supports the HuggingFace router preset (back-compat)", async () => {
    process.env.VISION_PROVIDER = "huggingface";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: QWEN_JSON } }] }), { status: 200 })
    );
    const r = await diagnoseImage("BASE64", "image/png");
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(r.model).toContain("huggingface:");
  });

  it("falls back to Haiku when the Qwen provider fails", async () => {
    process.env.VISION_PROVIDER = "hyperbolic";
    process.env.VISION_API_KEY = "provider-key";
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("upstream boom", { status: 503 }));
    haikuCreate.mockResolvedValue(haikuTextResponse(HAIKU_JSON));
    const r = await diagnoseImage("BASE64", "image/jpeg");
    expect(haikuCreate).toHaveBeenCalledOnce(); // fell back
    expect(r.model).toBe("claude-haiku-vision");
  });

  it("uses the custom Qwen endpoint when VISION_ENDPOINT_URL is set", async () => {
    process.env.VISION_ENDPOINT_URL = "https://qwen.example.com/diagnose";
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ answer: QWEN_JSON }), { status: 200 })
    );
    const r = await diagnoseImage("BASE64", "image/jpeg");
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(r.model).toBe("qwen2.5-vl");
    expect(r.plant).toBe("Basil");
  });

  it("falls back to Haiku when the custom Qwen endpoint fails", async () => {
    process.env.VISION_ENDPOINT_URL = "https://qwen.example.com/diagnose";
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));
    haikuCreate.mockResolvedValue(haikuTextResponse(HAIKU_JSON));
    const r = await diagnoseImage("BASE64", "image/jpeg");
    expect(haikuCreate).toHaveBeenCalledOnce();
    expect(r.model).toBe("claude-haiku-vision");
  });

  it("passes a normalised media_type to Haiku (never the raw HEIC/unknown)", async () => {
    haikuCreate.mockResolvedValue(haikuTextResponse(HAIKU_JSON));
    await diagnoseImage("BASE64", "image/jpg"); // mislabelled jpg
    const arg = haikuCreate.mock.calls[0][0];
    expect(arg.messages[0].content[0].source.media_type).toBe("image/jpeg");
  });
});
