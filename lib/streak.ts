// Pure streak math for the daily mindfulness check-in.
//
// All inputs are ISO date strings (YYYY-MM-DD). Extracted so the rules are
// testable without Supabase, and fixed to handle the cases the original missed:
// already-checked-in-today (don't reset), and a missing previous entry.

function isoMinusOneDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split("T")[0];
}

export function computeStreak(
  lastDate: string | null | undefined,
  lastStreak: number | null | undefined,
  today: string
): number {
  const prev = Math.max(1, lastStreak ?? 1);
  if (!lastDate) return 1;
  if (lastDate === today) return prev; // already reflected today — hold the streak
  if (lastDate === isoMinusOneDay(today)) return prev + 1; // consecutive day
  return 1; // a gap — start fresh
}
