import { describe, it, expect } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { extractAssistantText, COACH_DECLINED, COACH_EMPTY } from "./anthropic";

function msg(partial: Partial<Anthropic.Message>): Anthropic.Message {
  return { stop_reason: "end_turn", content: [], ...partial } as Anthropic.Message;
}

describe("extractAssistantText", () => {
  it("returns the joined text of text blocks", () => {
    const m = msg({
      content: [
        { type: "text", text: "Water the " },
        { type: "text", text: "Sun Gold tomatoes." },
      ] as Anthropic.ContentBlock[],
    });
    expect(extractAssistantText(m)).toBe("Water the Sun Gold tomatoes.");
  });

  it("returns a calm decline message on a refusal stop reason", () => {
    const m = msg({ stop_reason: "refusal" });
    expect(extractAssistantText(m)).toBe(COACH_DECLINED);
  });

  it("returns a gentle retry message when content has no text", () => {
    const m = msg({
      content: [{ type: "tool_use", id: "t", name: "x", input: {} }] as Anthropic.ContentBlock[],
    });
    expect(extractAssistantText(m)).toBe(COACH_EMPTY);
  });

  it("returns a gentle retry message on empty content", () => {
    expect(extractAssistantText(msg({ content: [] }))).toBe(COACH_EMPTY);
  });
});
