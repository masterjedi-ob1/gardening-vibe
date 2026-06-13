import { describe, it, expect } from "vitest";
import { PROMPT_BANK, getTodaysPrompt } from "./prompts";

describe("getTodaysPrompt", () => {
  it("returns a prompt from the bank with all fields populated", () => {
    const p = getTodaysPrompt();
    expect(PROMPT_BANK).toContainEqual(p);
    expect(p.prompt.length).toBeGreaterThan(0);
    expect(p.gardenTie.length).toBeGreaterThan(0);
    expect(["stoic", "buddhist", "spiritual"]).toContain(p.tradition);
  });

  it("is deterministic for the same day", () => {
    expect(getTodaysPrompt()).toEqual(getTodaysPrompt());
  });

  it("advances by one bank entry per day offset", () => {
    const today = getTodaysPrompt(0);
    const tomorrow = getTodaysPrompt(1);
    const todayIdx = PROMPT_BANK.indexOf(today);
    const tomorrowIdx = PROMPT_BANK.indexOf(tomorrow);
    expect(tomorrowIdx).toBe((todayIdx + 1) % PROMPT_BANK.length);
  });

  it("stays in bounds across a wide range of offsets, including negatives", () => {
    for (let off = -40; off <= 40; off++) {
      expect(PROMPT_BANK).toContain(getTodaysPrompt(off));
    }
  });
});
