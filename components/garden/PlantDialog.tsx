"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bed, Plant } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PLANT_TYPES, PLANT_STATUS_OPTIONS, SUN_OPTIONS } from "./options";
import { Trash2 } from "lucide-react";

interface PlantDialogProps {
  beds: Bed[];
  plant?: Plant;          // present → edit mode; absent → add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlantDialog({ beds, plant, open, onOpenChange }: PlantDialogProps) {
  const router = useRouter();
  const isEdit = !!plant;

  const [name, setName] = useState(plant?.name ?? "");
  const [type, setType] = useState(plant?.type ?? "herb");
  const [qty, setQty] = useState(plant?.qty ?? 1);
  const [sun, setSun] = useState(plant?.sun ?? "full");
  const [bedId, setBedId] = useState(plant?.bed_id ?? "");
  const [status, setStatus] = useState(plant?.status ?? "planted");
  const [notes, setNotes] = useState(plant?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("This little one needs a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { name, type, qty, sun, bed_id: bedId || null, status, notes };
      const res = await fetch(isEdit ? `/api/plants/${plant!.id}` : "/api/plants", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went sideways.");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save just now.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!plant) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not remove that plant.");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove that plant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Tending ${plant!.name}` : "What are you planting?"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update how this one's coming along."
              : "Add something new to the garden — every seed counts."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="plant-name">Name</Label>
            <Input
              id="plant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cherokee Purple Tomato"
              autoFocus={!isEdit}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="plant-type">Type</Label>
              <Select id="plant-type" value={type} onChange={(e) => setType(e.target.value)}>
                {PLANT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="plant-qty">How many?</Label>
              <Input
                id="plant-qty"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="plant-sun">Sunlight</Label>
              <Select id="plant-sun" value={sun} onChange={(e) => setSun(e.target.value as Plant["sun"])}>
                {SUN_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="plant-status">Status</Label>
              <Select id="plant-status" value={status} onChange={(e) => setStatus(e.target.value as Plant["status"])}>
                {PLANT_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="plant-bed">Where's it growing?</Label>
            <Select id="plant-bed" value={bedId} onChange={(e) => setBedId(e.target.value)}>
              <option value="">No bed yet</option>
              {beds.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="plant-notes">Notes</Label>
            <Textarea
              id="plant-notes"
              rows={2}
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Needs staking before it sets fruit…"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <Button onClick={save} disabled={saving} className="flex-1">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add to garden"}
            </Button>
            {isEdit && (
              <Button variant="destructive" size="icon" onClick={remove} disabled={saving} aria-label="Remove plant">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
