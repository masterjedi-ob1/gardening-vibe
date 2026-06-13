"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bed, BedType } from "@/lib/types";
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
import { BED_TYPE_OPTIONS } from "./options";
import { Trash2 } from "lucide-react";

interface BedDialogProps {
  bed?: Bed;              // present → edit mode; absent → add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BedDialog({ bed, open, onOpenChange }: BedDialogProps) {
  const router = useRouter();
  const isEdit = !!bed;
  const [name, setName] = useState(bed?.name ?? "");
  const [type, setType] = useState<BedType>(bed?.type ?? "raised");
  const [notes, setNotes] = useState(bed?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) {
      setError("Give the bed a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(isEdit ? `/api/beds/${bed!.id}` : "/api/beds", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save that bed.");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that bed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!bed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/beds/${bed.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not remove that bed.");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove that bed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Tending ${bed!.name}` : "Make room to grow"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this bed — plants stay put if you remove it."
              : "A new bed, container, or patch of ground."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="bed-name">Name</Label>
            <Input
              id="bed-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Raised Bed"
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bed-type">Type</Label>
            <Select id="bed-type" value={type} onChange={(e) => setType(e.target.value as BedType)}>
              {BED_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bed-notes">Notes</Label>
            <Textarea
              id="bed-notes"
              rows={2}
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Primary grow space, gets morning sun…"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-2">
            <Button onClick={save} disabled={saving} className="flex-1">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add bed"}
            </Button>
            {isEdit && (
              <Button variant="destructive" size="icon" onClick={remove} disabled={saving} aria-label="Remove bed">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
