import { Header } from "@/components/layout/Header";
import { BookOpen } from "lucide-react";

export default function JournalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto w-full px-4 py-16 flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <BookOpen className="h-12 w-12 text-soil-400" />
        <h1 className="text-2xl font-bold text-stone-700">Growth Journal</h1>
        <p className="text-stone-400 max-w-xs">
          Photo journal, harvest log, and timeline notes — coming Day 2.
        </p>
      </main>
    </div>
  );
}
