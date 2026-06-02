# GardZen 🌱🧘 — Project Plan

> A web-first garden manager + mindfulness companion for Chris & Bill, Summer 2026.
> In-app AI coach persona: "the Green Thumb." **In memory of Beatrice McCarthy.**
> Sources: Granola note "Garden App w/ Inventory" (Jun 1 2026) · `RESEARCH_APPS.md` ·
> `RESEARCH_VISION.md` · `AI_MODELS.md`.

## 1. Vision
A calm, AI-powered "green thumb" that manages the full garden lifecycle and keeps Chris & Bill
connected to the work — practical garden manager fused with a Zen mindfulness companion. The
differentiator (validated by research): **edible-garden lifecycle + AI vision diagnosis +
genuine mindfulness** — a center nobody else occupies.

## 2. Target users
Chris & Bill (primary, shared garden). Built personal-first; generalizes to home veg growers.

## 3. MVP scope
**Core**
1. **Garden inventory** — plants, beds/zones, supplies; photos. Seeded from `data/garden-inventory.json` (real 2026 garden).
2. **Photo diagnosis** — snap a leaf → ID + health/disease/pest read + calm treatment advice. (Vision strategy below.)
3. **AI Greenthumb chat** — grounded in the user's actual inventory + hardiness zone + journal history (the moat). Tone: wise gardener friend.
4. **Calm reminders** — water/feed/sow/harvest, zone/weather-aware, framed as rituals — never red-badge nagging.
5. **Growth journal** — timeline photos + notes per plant/bed; harvest log.
6. **Zone-aware planting calendar** — frost dates from geolocation; what to sow/transplant now.

**Mindfulness wedge (core to GardZen — ship in MVP)**
7. **Gamified daily-question practice.** Each day surfaces a short reflective question tied to
   tending the garden, drawn from **Stoic, Buddhist, and spiritual/meditative** traditions
   (e.g. Stoic "what is in my control today?", Buddhist impermanence/non-attachment, gratitude
   & presence). Answering builds a gentle **streak/progression** (calm gamification — growth,
   seasons, "blooms unlocked" — never punitive). A small curated prompt bank, tagged by
   tradition, rotated daily; answers saved to the journal so the AI coach can reference them.
   Zen/healing visual theme; a seasonal "almanac clock" rhythm rather than a task list.

**Deferred (Phase 2+):** native iOS/Android (app store), community feed, companion-planting
engine, family sharing UI polish, light meter, marketplace/affiliate.

## 4. Architecture & stack (LOCKED for MVP)
- **Web:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, shipped as a responsive, installable **PWA** (camera, offline-ish, home-screen icon) — **mobile-friendly via browser, no app store until Phase 2**.
- **Data/auth/storage:** Supabase (Postgres + RLS + Auth + Storage for photos; `pgvector` later to ground the assistant). Free tier.
- **Hosting:** Vercel free tier for the starter (Vercel MCP available here).
- **AI coach:** Anthropic Claude — Haiku default for cost (prompt caching), Sonnet for hard reasoning. Grounded via tool calls over live garden state.
- **AI vision:** **Qwen2.5-VL** (open-weight, Apache-2.0) is the chosen model — **Andrew Brown** is helping stand it up (Ollama / HF Inference Endpoint), called behind a thin `lib/vision` interface. **Claude Haiku vision is the fallback** so the diagnosis flow can ship day 1 while Qwen is wired in. Optional later: on-device **MobileNetV2** classifier for offline first-pass; Pl@ntNet free tier (≤500/day) for pure ID. Always show confidence + "consult a human" fallback. See `AI_MODELS.md`.
- **Mobile (Phase 2):** Expo/React Native (or Capacitor wrap) sharing Supabase + API layer.
- **Payments (later):** Stripe (web), RevenueCat (mobile).

Run cost target: **≈ $0–few $/month** through MVP.

## 5. Data model (first cut)
`gardeners`, `gardens`, `beds` (raised/container/in-ground), `plants` (species, qty, sun,
support needs, planted_at, bed_id), `supplies`, `journal_entries` (plant/bed, photo, note,
ts), `diagnoses` (photo, model, label, confidence, advice), `tasks` (type, due, zone/weather
basis, status), `checkins` (mindfulness, streak). Seed from `garden-inventory.json`.

## 6. Roadmap
- **Phase 0 — Foundation (this session):** docs + seed data committed; confirm stack. ✅ in progress
- **Phase 1 — Skeleton:** scaffold Next.js + Tailwind + Supabase; schema + migrations; seed the real garden; auth; inventory CRUD + bed view.
- **Phase 2 — Journal + reminders:** photo journal/timeline; zone detection + planting calendar; calm reminder engine.
- **Phase 3 — AI Greenthumb:** Claude chat grounded in garden state (tool calls); proactive suggestions.
- **Phase 4 — Vision diagnosis:** photo → Haiku vision (+ optional MobileNet/Kindwise); structured advice; confidence + human fallback.
- **Phase 5 — Mindfulness layer:** daily check-in, guided moment, seasonal-clock UI, Zen theming.
- **Phase 6 — Polish & PWA:** installable, offline-ish, "garden glance"; trust-first onboarding.

## 7. Design principles
1. **Tone is the product** — warm, grounded, Zen; never clinical or guilt-trippy.
2. **Ground the AI in real state** — the moat vs. generic GPT wrappers.
3. **Calm over gamified** — gentle streaks, ritual framing, no punitive badges.
4. **Trust-first** — transparent pricing later, easy cancel, data persists. (Anti-PictureThis.)
5. **Cheap & solo-friendly** — free tiers, lean deps; note any paid service in `docs/`.
6. **Polish like Flighty** — ruthless info hierarchy; the diagnosis flow is make-or-break.

## 8. Decisions (LOCKED — Chris, Jun 2 2026)
1. **Name:** **GardZen** (AI coach persona = "the Green Thumb").
2. **Stack:** confirmed — Next.js + Supabase + Vercel as a responsive **web PWA**. Mobile-friendly via browser; **no app store until Phase 2**.
3. **Vision:** **Qwen2.5-VL** — **Andrew Brown** assisting with hosting/tuning. Claude Haiku vision is the day-1 fallback.
4. **Timeline:** launchable **MVP in 2–3 days** (lean slice below).
5. **Mindfulness:** gamified **daily-question practice** rooted in **Stoic / Buddhist / spiritual-meditative** traditions, with a calm streak/progression. Core to MVP.

## 8a. 2–3 day MVP cut (build order)
Lean but complete vertical slice — each day ships something usable:
- **Day 1 — Skeleton + Garden:** scaffold Next.js PWA + Tailwind/shadcn; Supabase project + schema + migrations; seed the real garden from `garden-inventory.json`; auth; inventory list + bed view; calm Zen theme + layout.
- **Day 2 — Journal + Mindfulness + Coach:** photo journal (Supabase Storage) + harvest log; **gamified daily-question practice** (prompt bank + streak); AI Green Thumb chat grounded in garden state (Claude w/ tool calls).
- **Day 3 — Diagnosis + Polish + Deploy:** photo → vision diagnosis (Claude Haiku now, Qwen swap-in via `lib/vision`); structured advice + confidence; PWA install/offline polish; deploy to Vercel; smoke-test on phone.
- _Trim levers if time-tight: reminders/planting-calendar can slip a day; diagnosis can ship as "beta."_

## 9. Collaboration
Chris drives from claude.ai (Claude Code web) and on the go via **Dispatch** + **Slack**.
Plan/status/questions go to Slack; keep async updates short.
