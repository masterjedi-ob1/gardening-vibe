// Shared option lists for inventory forms. Kept client-safe (no server imports).
import { BedType, PlantStatus, SunRequirement } from "@/lib/types";

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

export const PLANT_STATUSES: { value: PlantStatus; label: string }[] = [
  { value: "wishlist", label: "On the wishlist" },
  { value: "planned", label: "Planned" },
  { value: "planted", label: "Planted" },
  { value: "growing", label: "Growing" },
  { value: "harvesting", label: "Harvesting" },
  { value: "done", label: "Done for the season" },
];

export const SUN_OPTIONS: { value: SunRequirement; label: string }[] = [
  { value: "full", label: "Full sun" },
  { value: "partial", label: "Partial sun" },
  { value: "shade", label: "Shade" },
];

export const BED_TYPES: { value: BedType; label: string }[] = [
  { value: "raised", label: "Raised bed" },
  { value: "container", label: "Container" },
  { value: "in-ground", label: "In-ground" },
  { value: "pot", label: "Planter pots" },
];
