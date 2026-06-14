import { describe, it, expect } from "vitest";
import {
  resolveOpenAIVisionConfig,
  resolveVisionToken,
  DEFAULT_VISION_MODEL,
} from "./providers";

describe("resolveOpenAIVisionConfig", () => {
  it("returns null when nothing is configured", () => {
    expect(resolveOpenAIVisionConfig({})).toBeNull();
  });

  it("resolves a named provider preset (hyperbolic)", () => {
    const cfg = resolveOpenAIVisionConfig({ VISION_PROVIDER: "hyperbolic" });
    expect(cfg?.url).toBe("https://api.hyperbolic.xyz/v1/chat/completions");
    expect(cfg?.model).toBe(DEFAULT_VISION_MODEL);
    expect(cfg?.label).toBe(`hyperbolic:${DEFAULT_VISION_MODEL}`);
  });

  it("is case-insensitive and trims the provider name", () => {
    const cfg = resolveOpenAIVisionConfig({ VISION_PROVIDER: "  Together " });
    expect(cfg?.url).toBe("https://api.together.xyz/v1/chat/completions");
  });

  it("honours an explicit VISION_API_URL over a preset", () => {
    const cfg = resolveOpenAIVisionConfig({
      VISION_PROVIDER: "hyperbolic",
      VISION_API_URL: "https://custom.example.com/v1/chat/completions",
      VISION_MODEL: "Qwen/Qwen2.5-VL-72B-Instruct",
    });
    expect(cfg?.url).toBe("https://custom.example.com/v1/chat/completions");
    expect(cfg?.model).toBe("Qwen/Qwen2.5-VL-72B-Instruct");
  });

  it("keeps VISION_HF_URL working for back-compat", () => {
    const cfg = resolveOpenAIVisionConfig({ VISION_HF_URL: "https://router.huggingface.co/v1/chat/completions" });
    expect(cfg?.url).toContain("huggingface");
  });

  it("returns null for an unknown provider with no explicit URL", () => {
    expect(resolveOpenAIVisionConfig({ VISION_PROVIDER: "nope" })).toBeNull();
  });
});

describe("resolveVisionToken", () => {
  it("prefers VISION_API_KEY, then VISION_ENDPOINT_TOKEN, then HF_TOKEN", () => {
    expect(resolveVisionToken({ VISION_API_KEY: "a", VISION_ENDPOINT_TOKEN: "b", HF_TOKEN: "c" })).toBe("a");
    expect(resolveVisionToken({ VISION_ENDPOINT_TOKEN: "b", HF_TOKEN: "c" })).toBe("b");
    expect(resolveVisionToken({ HF_TOKEN: "c" })).toBe("c");
    expect(resolveVisionToken({})).toBeUndefined();
  });
});
