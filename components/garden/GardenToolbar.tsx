"use client";

import { useState } from "react";
import { Bed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlantDialog } from "./PlantDialog";
import { BedDialog } from "./BedDialog";
import { Sprout, Plus } from "lucide-react";

export function GardenToolbar({ beds }: { beds: Bed[] }) {
  const [plantOpen, setPlantOpen] = useState(false);
  const [bedOpen, setBedOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setPlantOpen(true)}>
        <Sprout className="h-4 w-4" /> What are you planting?
      </Button>
      <Button variant="outline" onClick={() => setBedOpen(true)}>
        <Plus className="h-4 w-4" /> Add a bed
      </Button>

      {plantOpen && <PlantDialog beds={beds} open={plantOpen} onOpenChange={setPlantOpen} />}
      {bedOpen && <BedDialog open={bedOpen} onOpenChange={setBedOpen} />}
    </div>
  );
}
