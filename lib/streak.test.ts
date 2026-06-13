import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("starts at 1 when there is no previous check-in", () => {
    expect(computeStreak(null, null, "2026-06-13")).toBe(1);
    expect(computeStreak(undefined, undefined, "2026-06-13")).toBe(1);
  });

  it("increments on a consecutive day", () => {
    expect(computeStreak("2026-06-12", 4, "2026-06-13")).toBe(5);
  });

  it("crosses month boundaries correctly", () => {
    expect(computeStreak("2026-05-31", 2, "2026-06-01")).toBe(3);
  });

  it("holds the streak if already checked in today (no double count)", () => {
    expect(computeStreak("2026-06-13", 7, "2026-06-13")).toBe(7);
  });

  it("resets to 1 after a gap", () => {
    expect(computeStreak("2026-06-10", 9, "2026-06-13")).toBe(1);
  });

  it("treats a missing/zero prior streak as at least 1", () => {
    expect(computeStreak("2026-06-12", 0, "2026-06-13")).toBe(2);
    expect(computeStreak("2026-06-12", undefined, "2026-06-13")).toBe(2);
  });
});
