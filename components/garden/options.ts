// UI option lists for inventory forms. Derived from the canonical vocabularies
// in lib/types.ts so the dropdowns can never drift from what the API accepts.
// Client-safe (no server imports).
import { BED_TYPES, PLANT_STATUSES, SUN_REQUIREMENTS, BedType, PlantStatus, SunRequirement } from "@/lib/types";

// Plant `type` is free text in the schema; these are friendly presets.
export const PLANT_TYPES: { value: string; label: string }[] = [
  { value: "tomato", label: "🍅 Tomato" },
  { value: "pepper", label: "🌶️ Pepper" },
  { value: "herb", label: "🌿 Herb" },
  { value: "squash", label: "🥒 Squash" },
  { value: "melon", label: "🍈 Melon" },
  { value: "leafy-green", label: "🥬 Leafy green" },
  { value: "eggplant", label: "🍆 Eggplant" },
  { value: "other", label: "🌱 Something else" },
];

const STATUS_LABELS: Record<PlantStatus, string> = {
  wishlist: "On the wishlist",
  planned: "Planned",
  planted: "Planted",
  growing: "Growing",
  harvesting: "Harvesting",
  done: "Done for the season",
};
const SUN_LABELS: Record<SunRequirement, string> = {
  full: "Full sun",
  partial: "Partial sun",
  shade: "Shade",
};
const BED_TYPE_LABELS: Record<BedType, string> = {
  raised: "Raised bed",
  container: "Container",
  "in-ground": "In-ground",
  pot: "Planter pots",
};

export const PLANT_STATUS_OPTIONS = PLANT_STATUSES.map((v) => ({ value: v, label: STATUS_LABELS[v] }));
export const SUN_OPTIONS = SUN_REQUIREMENTS.map((v) => ({ value: v, label: SUN_LABELS[v] }));
export const BED_TYPE_OPTIONS = BED_TYPES.map((v) => ({ value: v, label: BED_TYPE_LABELS[v] }));
