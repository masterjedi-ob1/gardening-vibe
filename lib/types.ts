export type PlantStatus = "wishlist" | "planned" | "planted" | "growing" | "harvesting" | "done";
export type SunRequirement = "full" | "partial" | "shade";
export type BedType = "raised" | "container" | "in-ground" | "pot";

export interface Gardener {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Garden {
  id: string;
  gardener_id: string | null;
  name: string;
  season: string | null;
  dedication: string | null;
  created_at: string;
}

export interface Bed {
  id: string;
  garden_id: string;
  name: string;
  type: BedType;
  notes: string | null;
  created_at: string;
  plants?: Plant[];
}

export interface Plant {
  id: string;
  garden_id: string;
  bed_id: string | null;
  name: string;
  type: string;
  qty: number;
  sun: SunRequirement;
  notes: string | null;
  status: PlantStatus;
  planted_at: string | null;
  created_at: string;
}

export interface Supply {
  id: string;
  garden_id: string;
  item: string;
  qty: number | null;
  spec: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  garden_id: string;
  plant_id: string | null;
  bed_id: string | null;
  note: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  garden_id: string;
  plant_id: string | null;
  bed_id: string | null;
  type: string;
  title: string;
  due_at: string | null;
  status: "pending" | "done" | "skipped";
  created_at: string;
}

export interface Checkin {
  id: string;
  gardener_id: string;
  prompt: string;
  tradition: "stoic" | "buddhist" | "spiritual" | null;
  response: string | null;
  streak_day: number;
  created_at: string;
}
