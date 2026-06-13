import { Bed, Plant } from "@/lib/types";
import { PlantCard } from "./PlantCard";
import { Layers } from "lucide-react";

interface BedSectionProps {
  bed: Bed & { plants: Plant[] };
  beds?: Bed[];
  editable?: boolean;
}

const BED_TYPE_LABEL: Record<string, string> = {
  raised: "Raised Bed",
  container: "Container",
  "in-ground": "In-Ground",
  pot: "Planter Pots",
};

export function BedSection({ bed, beds = [], editable = false }: BedSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-garden-500" />
        <h2 className="font-semibold text-stone-700">{bed.name}</h2>
        <span className="text-xs text-stone-400 bg-stone-100 rounded-full px-2 py-0.5">
          {BED_TYPE_LABEL[bed.type] ?? bed.type}
        </span>
        <span className="text-xs text-stone-400">{bed.plants.length} plants</span>
      </div>
      {bed.notes && (
        <p className="text-xs text-stone-500 italic">{bed.notes}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {bed.plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} beds={beds} editable={editable} />
        ))}
      </div>
    </section>
  );
}
