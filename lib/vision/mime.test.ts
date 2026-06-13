import { describe, it, expect } from "vitest";
import { normalizeImageMime, isSupportedImageType } from "./mime";

describe("normalizeImageMime", () => {
  it("passes through supported types", () => {
    expect(normalizeImageMime("image/jpeg")).toBe("image/jpeg");
    expect(normalizeImageMime("image/png")).toBe("image/png");
    expect(normalizeImageMime("image/gif")).toBe("image/gif");
    expect(normalizeImageMime("image/webp")).toBe("image/webp");
  });

  it("normalises image/jpg to image/jpeg", () => {
    expect(normalizeImageMime("image/jpg")).toBe("image/jpeg");
  });

  it("is case-insensitive and strips parameters", () => {
    expect(normalizeImageMime("IMAGE/PNG")).toBe("image/png");
    expect(normalizeImageMime("image/jpeg; charset=binary")).toBe("image/jpeg");
  });

  it("defaults empty/missing to image/jpeg (browser upload default)", () => {
    expect(normalizeImageMime("")).toBe("image/jpeg");
    expect(normalizeImageMime(null)).toBe("image/jpeg");
    expect(normalizeImageMime(undefined)).toBe("image/jpeg");
  });

  it("rejects HEIC and other unsupported formats", () => {
    expect(normalizeImageMime("image/heic")).toBeNull();
    expect(normalizeImageMime("image/heif")).toBeNull();
    expect(normalizeImageMime("application/pdf")).toBeNull();
    expect(normalizeImageMime("image/tiff")).toBeNull();
  });
});

describe("isSupportedImageType", () => {
  it("accepts supported formats and an empty default", () => {
    expect(isSupportedImageType("image/png")).toBe(true);
    expect(isSupportedImageType("")).toBe(true);
  });
  it("rejects HEIC (the iPhone default that previously failed silently)", () => {
    expect(isSupportedImageType("image/heic")).toBe(false);
  });
});
