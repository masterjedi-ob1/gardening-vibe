import { describe, it, expect } from "vitest";
import { parseDiagnosis, normalizeDiagnosis } from "./index";

describe("parseDiagnosis", () => {
  it("parses clean JSON", () => {
    const r = parseDiagnosis(
      '{"plant":"Tomato","health":"healthy","confidence":0.9,"summary":"Looks great.","advice":"Keep watering.","flags":["none"]}',
      "test-model"
    );
    expect(r.plant).toBe("Tomato");
    expect(r.health).toBe("healthy");
    expect(r.confidence).toBe(0.9);
    expect(r.flags).toEqual(["none"]);
    expect(r.model).toBe("test-model");
  });

  it("extracts JSON embedded in prose / markdown fences", () => {
    const text =
      'Here is what I see:\n```json\n{"plant":"Basil","health":"stressed","confidence":0.7,"summary":"Wilting.","advice":"Water more.","flags":["underwatering"]}\n```\nHope that helps!';
    const r = parseDiagnosis(text, "m");
    expect(r.plant).toBe("Basil");
    expect(r.health).toBe("stressed");
    expect(r.flags).toEqual(["underwatering"]);
  });

  it("degrades to safe defaults on non-JSON prose (never throws)", () => {
    const r = parseDiagnosis("I'm not sure what plant this is.", "m");
    expect(r.plant).toBe("unknown");
    expect(r.health).toBe("unknown");
    expect(r.confidence).toBe(0);
    expect(r.flags).toEqual([]);
  });

  it("degrades to safe defaults on malformed JSON", () => {
    const r = parseDiagnosis('{"plant": "Tomato", health: }', "m");
    expect(r.plant).toBe("unknown");
    expect(r.flags).toEqual([]);
  });
});

describe("normalizeDiagnosis", () => {
  it("fills missing fields so the UI never reads undefined", () => {
    const r = normalizeDiagnosis({}, "m");
    expect(r.plant).toBe("unknown");
    expect(r.health).toBe("unknown");
    expect(r.confidence).toBe(0);
    expect(r.summary).toBe("");
    expect(r.advice).toBe("");
    expect(r.flags).toEqual([]);
    expect(r.model).toBe("m");
  });

  it("coerces non-array flags and non-number confidence safely", () => {
    const r = normalizeDiagnosis({ flags: "aphids", confidence: "high" }, "m");
    expect(r.flags).toEqual([]);
    expect(r.confidence).toBe(0);
  });

  it("stringifies array flag members", () => {
    const r = normalizeDiagnosis({ flags: ["aphids", 7] }, "m");
    expect(r.flags).toEqual(["aphids", "7"]);
  });
});
