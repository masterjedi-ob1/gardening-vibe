import { Header } from "@/components/layout/Header";
import { Camera } from "lucide-react";

export default function DiagnosePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto w-full px-4 py-16 flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <Camera className="h-12 w-12 text-amber-400" />
        <h1 className="text-2xl font-bold text-stone-700">Vision Diagnosis</h1>
        <p className="text-stone-400 max-w-xs">
          Snap a photo → AI plant health read. Claude Haiku vision (Day 3), Qwen2.5-VL via Andrew coming soon.
        </p>
      </main>
    </div>
  );
}
