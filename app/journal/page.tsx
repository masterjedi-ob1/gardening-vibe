"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Camera, X } from "lucide-react";

interface JournalEntry {
  id: string;
  note: string | null;
  photo_url: string | null;
  created_at: string;
  plants?: { name: string; type: string } | null;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries ?? []); setLoading(false); });
  }, []);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        // For now store as data URL; swap for Supabase Storage in Day 3
        photo_url = photoPreview;
      }
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, photo_url }),
      });
      const data = await res.json();
      if (data.entry) setEntries([data.entry, ...entries]);
      setNote("");
      setPhoto(null);
      setPhotoPreview(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  const fmt = (ts: string) =>
    new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6 flex-1">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Growth Journal</h1>
            <p className="text-stone-400 text-sm mt-0.5">Notes, photos, and observations from the garden</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm" variant={showForm ? "outline" : "default"}>
            {showForm ? <X className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> Add entry</>}
          </Button>
        </div>

        {/* New entry form */}
        {showForm && (
          <Card className="animate-fade-in">
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="What did you notice, harvest, or do in the garden today?…"
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-500 bg-white resize-none"
                />

                {photoPreview && (
                  <div className="relative w-full h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <Camera className="h-4 w-4" /> Add photo
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                  <Button type="submit" size="sm" disabled={!note.trim() || saving} className="ml-auto">
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Entries */}
        {loading ? (
          <p className="text-center text-stone-400 py-12">Loading journal…</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-stone-400 space-y-2">
            <BookOpen className="h-10 w-10 mx-auto opacity-40" />
            <p>Your journal is empty — start with today&apos;s first observation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="animate-fade-in">
                <CardContent className="p-5 space-y-3">
                  {entry.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photo_url}
                      alt="Journal photo"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  )}
                  {entry.note && <p className="text-stone-700 text-sm leading-relaxed">{entry.note}</p>}
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span>{fmt(entry.created_at)}</span>
                    {entry.plants && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{entry.plants.name}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
