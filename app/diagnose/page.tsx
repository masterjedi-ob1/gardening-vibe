"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Loader2, X, AlertCircle, CheckCircle2, Leaf } from "lucide-react";

interface DiagnosisResult {
  plant: string;
  health: string;
  confidence: number;
  summary: string;
  advice: string;
  flags: string[];
  model: string;
}

const HEALTH_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  healthy: { color: "text-garden-700 bg-garden-50 border-garden-200", icon: CheckCircle2, label: "Healthy" },
  stressed: { color: "text-amber-700 bg-amber-50 border-amber-200", icon: AlertCircle, label: "Stressed" },
  diseased: { color: "text-red-700 bg-red-50 border-red-200", icon: AlertCircle, label: "Diseased" },
  "pest-damaged": { color: "text-orange-700 bg-orange-50 border-orange-200", icon: AlertCircle, label: "Pest damage" },
  "nutrient-deficient": { color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: AlertCircle, label: "Nutrient deficiency" },
  unknown: { color: "text-stone-600 bg-stone-50 border-stone-200", icon: Leaf, label: "Unknown" },
};

export default function DiagnosePage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  }

  function reset() {
    setPhoto(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  async function diagnose() {
    if (!photo) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", photo);
      const res = await fetch("/api/diagnose", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyse photo.");
    } finally {
      setLoading(false);
    }
  }

  const hConfig = result ? (HEALTH_CONFIG[result.health] ?? HEALTH_CONFIG.unknown) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-xl mx-auto w-full px-4 py-8 space-y-6 flex-1">

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-stone-800">Diagnose a Plant</h1>
          <p className="text-stone-400 text-sm">Snap a photo — the Green Thumb will take a look</p>
          <p className="text-xs text-stone-300">Claude Haiku vision · Qwen2.5-VL coming soon</p>
        </div>

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-56 rounded-2xl border-2 border-dashed border-stone-300 hover:border-garden-400 hover:bg-garden-50 transition-colors flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-garden-600"
          >
            <Camera className="h-10 w-10" />
            <div>
              <p className="font-medium">Tap to take or choose a photo</p>
              <p className="text-xs mt-0.5">JPG, PNG, HEIC up to 10 MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Plant photo" className="w-full max-h-72 object-cover rounded-2xl shadow-sm" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!result && (
              <Button onClick={diagnose} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
                ) : "Diagnose this plant"}
              </Button>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && hConfig && (
          <div className="space-y-4 animate-fade-in">
            <Card className={`border ${hConfig.color}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <hConfig.icon className="h-5 w-5" />
                    <span className="font-semibold">{hConfig.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize">{result.plant}</p>
                    <p className="text-xs opacity-60">{Math.round(result.confidence * 100)}% confidence</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2">
                <p className="font-medium text-stone-700 text-sm flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-garden-500" /> Advice from the Green Thumb
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">{result.advice}</p>
                {result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.flags.map((flag) => (
                      <span key={flag} className="text-xs bg-stone-100 text-stone-600 rounded-full px-2 py-0.5">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-stone-400 pt-1">
                  Powered by {result.model} · Always consult a local extension service for serious issues.
                </p>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={reset} className="w-full">
              Diagnose another plant
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
