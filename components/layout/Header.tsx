import Link from "next/link";
import { Sprout } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Sprout className="h-5 w-5 text-garden-600 group-hover:text-garden-700 transition-colors" />
          <span className="font-semibold text-stone-800 tracking-tight">GardZen</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/garden"
            className="text-sm text-stone-500 hover:text-garden-600 px-3 py-1.5 rounded-md hover:bg-garden-50 transition-colors"
          >
            Garden
          </Link>
          <Link
            href="/journal"
            className="text-sm text-stone-500 hover:text-garden-600 px-3 py-1.5 rounded-md hover:bg-garden-50 transition-colors"
          >
            Journal
          </Link>
          <Link
            href="/coach"
            className="text-sm text-stone-500 hover:text-garden-600 px-3 py-1.5 rounded-md hover:bg-garden-50 transition-colors"
          >
            Green Thumb
          </Link>
        </nav>
      </div>
    </header>
  );
}
