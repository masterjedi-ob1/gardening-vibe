"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bed, Plant } from "@/lib/types";
import { Leaf, Sun, CloudSun, Cloudy, Pencil } from "lucide-react";
import { PlantDialog } from "./PlantDialog";

const TYPE_EMOJI: Record<string, string> = {
  tomato: "🍅",
  pepper: "🌶️",
  herb: "🌿",
  squash: "🥒",
  melon: "🍈",
  "leafy-green": "🥬",
  eggplant: "🍆",
};

const SUN_ICON = {
  full: Sun,
  partial: CloudSun,
  shade: Cloudy,
};

interface PlantCardProps {
  plant: Plant;
  beds?: Bed[];
  editable?: boolean;
}

export function PlantCard({ plant, beds = [], editable = false }: PlantCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const emoji = TYPE_EMOJI[plant.type] ?? "🌱";
  const SunIcon = SUN_ICON[plant.sun] ?? Sun;
  const isWishlist = plant.status === "wishlist";

  return (
    <Card className={`group animate-fade-in transition-shadow hover:shadow-md ${isWishlist ? "opacity-70 border-dashed" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none mt-0.5" role="img" aria-label={plant.type}>
              {emoji}
            </span>
            <div>
              <p className="font-medium text-stone-900 leading-tight">{plant.name}</p>
              <p className="text-xs text-stone-500 capitalize mt-0.5">{plant.type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant={plant.status as never}>{plant.status}</Badge>
            {plant.qty > 1 && (
              <span className="text-xs text-stone-400">×{plant.qty}</span>
            )}
          </div>
        </div>

        {plant.notes && (
          <p className="mt-2.5 text-xs text-stone-500 leading-relaxed flex items-start gap-1">
            <Leaf className="h-3 w-3 mt-0.5 text-garden-400 shrink-0" />
            {plant.notes}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <SunIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>{plant.sun} sun</span>
          </div>
          {editable && (
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1 text-xs text-garden-600 hover:text-garden-800 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Tend ${plant.name}`}
            >
              <Pencil className="h-3 w-3" /> Tend
            </button>
          )}
        </div>
      </CardContent>

      {editable && editOpen && (
        <PlantDialog beds={beds} plant={plant} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </Card>
  );
}
