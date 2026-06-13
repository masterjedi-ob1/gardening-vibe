"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedType } from "@/lib/types";
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
import { BED_TYPES } from "./options";

interface BedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BedDialog({ open, onOpenChange }: BedDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<BedType>("raised");
  const [notes, setNotes] = useState("");
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
      const res = await fetch("/api/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not add that bed.");
      onOpenChange(false);
      setName("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that bed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make room to grow</DialogTitle>
          <DialogDescription>A new bed, container, or patch of ground.</DialogDescription>
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
              {BED_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="bed-notes">Notes</Label>
            <Textarea
              id="bed-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Primary grow space, gets morning sun…"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? "Adding…" : "Add bed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
