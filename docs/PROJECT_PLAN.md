# AI Greenthumb 🌱 — Project Plan

> Working title. A web-first garden manager + mindfulness companion for Chris & Bill,
> Summer 2026. **In memory of Beatrice McCarthy.**
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

**Mindfulness wedge (ship ≥1)**
7. **Daily garden check-in** + a 2–3 min guided "tend your garden" moment; gentle streak. Zen/healing visual theme; a seasonal "almanac clock" rhythm instead of a task list.

**Deferred (v2):** community feed, companion-planting engine, family sharing UI polish, light meter, marketplace/affiliate, native mobile.

## 4. Architecture & stack (proposed — confirm before locking)
- **Web:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, shipped as an installable **PWA** (camera, offline-ish, home-screen icon) — instant mobile feel, no app store.
- **Data/auth/storage:** Supabase (Postgres + RLS + Auth + Storage for photos; `pgvector` later to ground the assistant). Free tier.
- **Hosting:** Vercel free tier (Vercel MCP available here).
- **AI coach:** Anthropic Claude — Haiku default for cost (prompt caching), Sonnet for hard reasoning. Grounded via tool calls over live garden state.
- **AI vision (two-tier):** (a) cheap multimodal model for ID + health narrative — **Claude Haiku vision** as pragmatic default (same provider as the coach), Gemini 2.5 Flash-Lite as the cheap alt; (b) specialist disease layer added in Phase 1 — **Kindwise crop.health / Plant.id** API, or self-hosted **MobileNetV2** (HF, on-device/offline). Pl@ntNet free tier (≤500/day) for pure ID. Always show confidence + "consult a human" fallback. See `AI_MODELS.md`.
- **Mobile path (later):** Expo/React Native sharing Supabase + API layer. Not in MVP.
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

## 8. Open questions for Chris
1. **Name** — keep "AI Greenthumb," or honor Beatrice directly (e.g. "Beatrice," "Bea's Garden")?
2. **Stack** — OK with Next.js + Supabase + Vercel PWA (web-first), or want native/Expo sooner?
3. **Vision provider** — start on Claude Haiku vision (one provider) and add a specialist API later — good?
4. **Scope for first build** — start with inventory + journal, or jump straight to the photo-diagnosis "wow" moment?
5. **Mindfulness depth** — light (daily check-in + streak) vs. richer (guided meditations, seasonal rituals) for MVP?

## 9. Collaboration
Chris drives from claude.ai (Claude Code web) and on the go via **Dispatch** + **Slack**.
Plan/status/questions go to Slack; keep async updates short.
