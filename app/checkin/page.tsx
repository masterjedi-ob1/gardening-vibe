"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Leaf } from "lucide-react";
import { DailyPrompt } from "@/lib/ai/prompts";

const TRADITION_EMOJI: Record<string, string> = {
  stoic: "⚡",
  buddhist: "🪷",
  spiritual: "✨",
};

const TRADITION_LABEL: Record<string, string> = {
  stoic: "Stoic practice",
  buddhist: "Buddhist wisdom",
  spiritual: "Spiritual reflection",
};

export default function CheckinPage() {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((d) => setPrompt(d.prompt));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim() || !prompt) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.prompt,
          tradition: prompt.tradition,
          response,
          gardener_id: null, // guest mode; wire to auth later
        }),
      });
      const data = await res.json();
      // Only celebrate a real save — don't report success the server didn't give.
      if (!res.ok) throw new Error(data.error ?? "Could not save your reflection.");
      setStreak(data.streak ?? 1);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your reflection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10 space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-stone-800">Daily Reflection</h1>
          <p className="text-stone-400 text-sm">A moment to tend your inner garden</p>
        </div>

        {!prompt ? (
          <div className="text-center text-stone-400 py-12">Loading today&apos;s prompt…</div>
        ) : submitted ? (
          <div className="space-y-4 animate-fade-in">
            <Card className="bg-garden-50 border-garden-200 text-center">
              <CardContent className="p-8 space-y-3">
                <div className="text-5xl">🌸</div>
                <p className="font-semibold text-garden-800">Beautifully reflected.</p>
                <p className="text-garden-600 text-sm">
                  Your answer has been saved to your garden journal.
                </p>
                {streak !== null && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-amber-700">
                      {streak} day{streak !== 1 ? "s" : ""} in a row
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
            <p className="text-center text-xs text-stone-400 italic">
              &ldquo;The gardener learns not from the harvest, but from each day of tending.&rdquo;
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            <Card className="bg-zen-50 border-zen-200">
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zen-500 font-medium uppercase tracking-wide">
                  <span>{TRADITION_EMOJI[prompt.tradition]}</span>
                  <span>{TRADITION_LABEL[prompt.tradition]}</span>
                </div>
                <p className="text-stone-800 text-lg leading-relaxed font-medium">
                  &ldquo;{prompt.prompt}&rdquo;
                </p>
                <p className="text-xs text-stone-400 flex items-center gap-1 pt-1">
                  <Leaf className="h-3 w-3 text-garden-400" />
                  {prompt.gardenTie}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Your reflection</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={5}
                placeholder="Write whatever comes to mind — no right answer, just honest reflection…"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-garden-500 bg-white resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={!response.trim() || loading}>
              {loading ? "Saving…" : "Save reflection"}
            </Button>

            <p className="text-center text-xs text-stone-400">
              Your reflections are private and saved to your garden journal.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
