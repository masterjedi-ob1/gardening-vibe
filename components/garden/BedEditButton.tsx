"use client";

import { useState } from "react";
import { Bed } from "@/lib/types";
import { BedDialog } from "./BedDialog";
import { Pencil } from "lucide-react";

export function BedEditButton({ bed }: { bed: Bed }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-stone-300 hover:text-garden-600 transition-colors"
        aria-label={`Tend ${bed.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      {open && <BedDialog bed={bed} open={open} onOpenChange={setOpen} />}
    </>
  );
}
