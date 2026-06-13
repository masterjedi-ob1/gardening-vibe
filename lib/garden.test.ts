import { describe, it, expect } from "vitest";
import { formatGardenContext } from "./garden";

describe("formatGardenContext", () => {
  it("returns null when there are no plants", () => {
    expect(formatGardenContext([], [])).toBeNull();
    expect(formatGardenContext(null, null)).toBeNull();
  });

  it("formats active plants with qty, type, and notes", () => {
    const ctx = formatGardenContext(
      [
        { name: "Cherokee Purple Tomato", type: "tomato", qty: 1, status: "planted", notes: "needs support" },
        { name: "Sweet Basil", type: "herb", qty: 3, status: "growing", notes: "" },
      ],
      [{ name: "Main Raised Bed" }]
    );
    expect(ctx).toContain("Beds: Main Raised Bed");
    expect(ctx).toContain("Active plants (2)");
    expect(ctx).toContain("Cherokee Purple Tomato ×1 (tomato, needs support)");
    expect(ctx).toContain("Sweet Basil ×3 (herb)");
  });

  it("separates wishlist plants from active ones", () => {
    const ctx = formatGardenContext(
      [
        { name: "Sun Gold Tomato", type: "tomato", qty: 1, status: "planted" },
        { name: "Beefsteak Tomato", type: "tomato", qty: 1, status: "wishlist" },
      ],
      []
    );
    expect(ctx).toContain("Active plants (1)");
    expect(ctx).toContain("Wishlist: Beefsteak Tomato");
    expect(ctx).not.toContain("Beefsteak Tomato ×1");
  });

  it("handles no beds gracefully", () => {
    const ctx = formatGardenContext(
      [{ name: "Chard", type: "leafy-green", qty: 4, status: "planted" }],
      []
    );
    expect(ctx).toContain("Beds: none");
  });
});
