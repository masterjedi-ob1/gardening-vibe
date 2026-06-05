// Mindfulness prompt bank — Stoic, Buddhist, spiritual traditions
// Rotated daily; tagged so the AI coach can reference them

export interface DailyPrompt {
  id: string;
  tradition: "stoic" | "buddhist" | "spiritual";
  prompt: string;
  gardenTie: string; // how it connects to tending the garden
}

export const PROMPT_BANK: DailyPrompt[] = [
  // Stoic
  {
    id: "s1",
    tradition: "stoic",
    prompt: "What in your garden today is within your control — and what must you simply let be?",
    gardenTie: "Stoic dichotomy of control applied to weather, pests, and growth.",
  },
  {
    id: "s2",
    tradition: "stoic",
    prompt: "If this were the last day you could tend your garden, what would you do with care?",
    gardenTie: "Memento mori — presence and intentional action.",
  },
  {
    id: "s3",
    tradition: "stoic",
    prompt: "What small obstacle in the garden today can you reframe as an opportunity to practice patience?",
    gardenTie: "Amor fati — loving what is.",
  },
  {
    id: "s4",
    tradition: "stoic",
    prompt: "Which garden task feels like a chore? Can you approach it as a chosen act of care instead?",
    gardenTie: "Voluntary hardship — choosing discomfort with purpose.",
  },
  {
    id: "s5",
    tradition: "stoic",
    prompt: "What virtue — courage, wisdom, justice, or temperance — does your garden ask of you today?",
    gardenTie: "The four Stoic virtues in practice.",
  },
  // Buddhist
  {
    id: "b1",
    tradition: "buddhist",
    prompt: "Notice one thing in your garden that is impermanent. How does it feel to hold that lightly?",
    gardenTie: "Anicca (impermanence) — all things change, including plants.",
  },
  {
    id: "b2",
    tradition: "buddhist",
    prompt: "Can you water or weed with complete attention — no phone, no rush, just the task?",
    gardenTie: "Mindful action — beginner's mind.",
  },
  {
    id: "b3",
    tradition: "buddhist",
    prompt: "What attachment to outcome in your garden can you soften today?",
    gardenTie: "Non-attachment to harvest or perfection.",
  },
  {
    id: "b4",
    tradition: "buddhist",
    prompt: "Breathe in the scent of soil or a leaf. What does this moment ask nothing of you?",
    gardenTie: "Present-moment awareness — the garden as refuge.",
  },
  {
    id: "b5",
    tradition: "buddhist",
    prompt: "How is your garden an expression of interdependence — soil, sun, water, insects, you?",
    gardenTie: "Interbeing — Thich Nhat Hanh's lens on interconnection.",
  },
  // Spiritual / gratitude
  {
    id: "sp1",
    tradition: "spiritual",
    prompt: "What in your garden today fills you with quiet gratitude?",
    gardenTie: "Gratitude practice — noticing abundance.",
  },
  {
    id: "sp2",
    tradition: "spiritual",
    prompt: "Spend one minute touching the earth. What does it communicate to you?",
    gardenTie: "Grounding practice — connecting to the frequency of nature.",
  },
  {
    id: "sp3",
    tradition: "spiritual",
    prompt: "If your garden were a mirror, what quality of yours is it reflecting back right now?",
    gardenTie: "Inner–outer correspondence — the garden as teacher.",
  },
  {
    id: "sp4",
    tradition: "spiritual",
    prompt: "What would Beatrice McCarthy notice in your garden today that you might have missed?",
    gardenTie: "Ancestral connection — honoring those who tended before us.",
  },
  {
    id: "sp5",
    tradition: "spiritual",
    prompt: "What seed — literal or metaphorical — are you planting in yourself this season?",
    gardenTie: "Inner growth mirroring outer growth.",
  },
];

// Pick today's prompt deterministically from the bank
export function getTodaysPrompt(dayOffset = 0): DailyPrompt {
  const start = new Date("2026-06-05").getTime();
  const today = new Date().getTime();
  const dayIndex = Math.floor((today - start) / 86_400_000) + dayOffset;
  return PROMPT_BANK[Math.abs(dayIndex) % PROMPT_BANK.length];
}
