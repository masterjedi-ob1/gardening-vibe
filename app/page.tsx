import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, BookOpen, MessageCircle, Camera } from "lucide-react";

const FEATURES = [
  {
    icon: Sprout,
    title: "Garden Inventory",
    desc: "Your plants, beds, and supplies — at a glance.",
    href: "/garden",
    color: "text-garden-600 bg-garden-50",
  },
  {
    icon: BookOpen,
    title: "Growth Journal",
    desc: "Log observations, photos, and harvests over time.",
    href: "/journal",
    color: "text-soil-600 bg-soil-50",
  },
  {
    icon: MessageCircle,
    title: "Green Thumb",
    desc: "Your AI garden coach — grounded in your real garden.",
    href: "/coach",
    color: "text-zen-600 bg-zen-50",
  },
  {
    icon: Camera,
    title: "Diagnose a Plant",
    desc: "Snap a photo for health + pest + disease insights.",
    href: "/diagnose",
    color: "text-amber-600 bg-amber-50",
  },
];

export default function Home() {
  const today = new Date();
  const greeting = today.getHours() < 12
    ? "Good morning"
    : today.getHours() < 17
    ? "Good afternoon"
    : "Good evening";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-garden-wash px-4 py-12 text-center">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="text-5xl">🌱</div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
            {greeting}, Chris.
          </h1>
          <p className="text-stone-500 leading-relaxed">
            Your Summer 2026 garden is growing. Take a moment to tend it with care.
          </p>
          <div className="italic text-sm text-stone-400 pt-1">
            In memory of Beatrice McCarthy — the family green thumb.
          </div>
          <div className="pt-2">
            <Button asChild size="lg">
              <Link href="/garden">View My Garden</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Daily check-in nudge */}
      <section className="max-w-3xl mx-auto w-full px-4 py-6">
        <Card className="bg-zen-50 border-zen-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧘</span>
              <div>
                <p className="font-medium text-zen-800">Today&apos;s reflection</p>
                <p className="text-sm text-zen-600 mt-1 italic leading-relaxed">
                  &ldquo;What is one small thing in your garden that is outside your control today — and can you let it be?&rdquo;
                </p>
                <p className="text-xs text-zen-500 mt-2">Stoic practice · Day 1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Feature grid */}
      <section className="max-w-3xl mx-auto w-full px-4 pb-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FEATURES.map(({ icon: Icon, title, desc, href, color }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-sm text-stone-800 leading-tight">{title}</p>
                <p className="text-xs text-stone-400 leading-snug">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
