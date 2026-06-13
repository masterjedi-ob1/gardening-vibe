// Image format handling for plant diagnosis.
//
// The Claude Haiku vision fallback (and most VLMs) only accept jpeg / png / gif /
// webp. iPhones capture HEIC by default, so a naive `media_type: "image/jpeg"`
// cast lets a HEIC upload reach Anthropic and 400 — surfacing as a generic
// "Could not analyse photo." We validate up front and give a calm, actionable
// message instead.

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

// Normalise a raw mime string to a supported type, or null if unsupported.
// - Lower-cases and strips any "; charset=" suffix.
// - Treats "image/jpg" as "image/jpeg" (common mislabel).
// - Empty/missing → defaults to image/jpeg (the usual browser-upload default).
export function normalizeImageMime(raw: string | null | undefined): SupportedImageType | null {
  const t = (raw ?? "").split(";")[0].trim().toLowerCase();
  if (!t) return "image/jpeg";
  if (t === "image/jpg") return "image/jpeg";
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(t)
    ? (t as SupportedImageType)
    : null;
}

export function isSupportedImageType(raw: string | null | undefined): boolean {
  return normalizeImageMime(raw) !== null;
}

// Friendly, on-brand guidance shown when a photo is in an unsupported format.
export const UNSUPPORTED_IMAGE_MESSAGE =
  "I can read JPEG, PNG, GIF, or WebP photos. If this is an iPhone HEIC photo, " +
  "set Camera → Formats → “Most Compatible”, or pick an existing JPEG, and try again. 🌱";
