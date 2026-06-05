import { Header } from "@/components/layout/Header";
import { MessageCircle } from "lucide-react";

export default function CoachPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto w-full px-4 py-16 flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <MessageCircle className="h-12 w-12 text-zen-400" />
        <h1 className="text-2xl font-bold text-stone-700">The Green Thumb</h1>
        <p className="text-stone-400 max-w-xs">
          Your AI garden coach, grounded in your real garden state — coming Day 2.
        </p>
      </main>
    </div>
  );
}
