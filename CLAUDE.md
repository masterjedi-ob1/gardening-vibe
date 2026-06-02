# CLAUDE.md — GardZen 🌱🧘

> Guidance for Claude Code (and humans) working in this repo.
> **Name:** GardZen · **In-app AI coach persona:** "the Green Thumb" · **Dedication:** In memory of **Beatrice McCarthy**, the family green thumb.

## What this is

A web-first (mobile-next) app that helps Chris & Bill grow and tend a home vegetable
garden over Summer 2026 — part **practical garden manager**, part **mindfulness companion**.
The AI is a calm, encouraging "green thumb" that tracks the garden, diagnoses plant health
from photos, suggests next actions, and gently keeps the gardeners accountable while
nurturing a sense of connection to nature.

Origin brief (from Chris's Granola note, Jun 1 2026): manage the full garden lifecycle —
clearing space → building above-ground beds → soil/fertilizer → planting starters with
correct spacing & support → protecting plants from breakage and animals — with
**vision-enabled AI** to understand plant health and environment, wrapped in **Zen /
healing / spiritual** themes about touching grass, frequency, and connectedness with nature.

## Product pillars

1. **Garden Manager** — inventory of plants & supplies, beds/zones, planting calendar,
   watering/feeding schedules, task reminders, growth journal with photos.
2. **AI Green Thumb** — conversational coach grounded in the user's actual garden state;
   proactive suggestions ("stake the Cherokee Purple before it sets fruit").
3. **Vision Diagnosis** — snap a photo → identify plant, assess health, flag
   disease/pest/nutrient issues, recommend treatment.
4. **Mindfulness & Accountability** — a **gamified daily-question practice** rooted in
   **Stoic, Buddhist, and spiritual/meditative** traditions: short daily reflective prompts
   tied to tending the garden, with streaks/gentle progression. Calm Zen-themed UI;
   accountability is encouraging, never nagging.

## Real seed data

`data/garden-inventory.json` holds the actual Summer 2026 garden (15 plant types incl.
3 basils, Sun Gold + Cherokee Purple tomatoes, banana & Hungarian black peppers, cantaloupe,
eggplant, chard, etc.), a tomato wishlist, and supplies on hand. Use it to bootstrap the DB.

## Tech stack (LOCKED for MVP)

> Optimized for one vibe-coder using Claude Code, free tiers, and a 2–3 day path to a
> launchable MVP. Web-first and **mobile-friendly/responsive (PWA)** — **no iOS/Android app
> store until Phase 2** (post-MVP).

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Responsive,
  installable **PWA** (camera, home-screen icon, offline-ish) — great on a phone browser
  without any app store. Native (Expo/Capacitor) deferred to Phase 2.
- **Backend/data:** Supabase (Postgres + Auth + Storage for plant photos). Free tier.
- **Hosting:** Vercel (free hobby tier) for the starter. Vercel MCP available in this workspace.
- **AI text/coach:** Anthropic Claude (default to **Haiku** for cost; escalate to Sonnet for
  hard reasoning). Prompts grounded in live garden state via tool calls / context.
- **AI vision:** **Qwen2.5-VL** (open-weight, Apache-2.0) is the chosen vision model —
  **Andrew Brown** is helping host/tune it (likely Ollama/HF endpoint). Claude Haiku vision is
  the fallback while Qwen is being stood up. Optional later: a small on-device plant-disease
  classifier (MobileNetV2) for offline first-pass labels. See `docs/AI_MODELS.md`.

## Repo layout (planned)

```
/data        seed data (garden-inventory.json)
/docs        PROJECT_PLAN.md, AI_MODELS.md, RESEARCH_*.md (competitive + vision research)
/app         Next.js app (to be scaffolded)
/components  UI
/lib         db, ai, vision clients
```

## Conventions

- **Tone everywhere** (UI copy, AI replies, commit-able content): warm, grounded, Zen —
  never clinical or guilt-trippy. Think "wise gardener friend," not "productivity app."
- Keep dependencies lean; prefer free tiers; note any new paid service in `docs/`.
- Photos are user data — store in Supabase Storage, never commit images to the repo.
- Match existing code style; keep comments at the density of surrounding code.

## How we collaborate (remote / on-the-go)

Chris drives from claude.ai (Claude Code web), and on the go via **Dispatch (mobile)** and
**Slack**. Plans, status, and questions get sent to Chris on Slack. Keep async updates short
and skimmable.

## Status

Greenfield. Foundation docs + seed data committed. Next: confirm stack, scaffold Next.js +
Supabase, model the schema from `garden-inventory.json`, build the inventory + journal MVP,
then layer in AI coach and vision. See `docs/PROJECT_PLAN.md`.
