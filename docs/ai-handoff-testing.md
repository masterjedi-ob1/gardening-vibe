# GardZen — QA Handoff: AI Bug List Verification

**For:** the next agent/tester · **From:** triage dev session · **Date:** 2026‑06‑14
**Prod:** https://gardening-vibe.vercel.app · **Repo:** masterjedi-ob1/gardening-vibe (`main`)
**Code under test:** commit `bfe13d7` (deployed, `READY`, target production)

This document maps every issue in the original bug list to its root cause, the
fix, the files touched, and a concrete verification procedure. Read **§0 first** —
two environment conditions will make every fix look broken if not handled.

---

## 0. READ FIRST — environment preconditions (not code bugs)

These are the reason live testing fails even though the code is fixed:

1. **Vercel Deployment Protection (SSO) is ON.** Every request to the prod URL
   returns `401 Authentication Required` and redirects to Vercel SSO, so the app
   is unreachable for end users *and* automated tests. **To test/activate:**
   Vercel → project `gardening-vibe` → Settings → Deployment Protection →
   **Vercel Authentication → Disabled** (or "Only Preview Deployments"). Or use a
   **Protection Bypass for Automation** token:
   `…/path?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=<TOKEN>`.
2. **Database must be migrated + seeded.** Status: **done** — `002_seed_data.sql`
   ran successfully (Summer 2026 garden exists). Note: re‑running
   `001_initial_schema.sql` errors with `policy "…" already exists` (42710) — this
   is expected/harmless (001 was already applied); do **not** treat it as a bug.
3. **Required env vars (set in Vercel):** `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ANTHROPIC_API_KEY`, and vision: `VISION_PROVIDER=openrouter`,
   `VISION_MODEL=qwen/qwen2.5-vl-72b-instruct`, `VISION_API_KEY=<OpenRouter key>`.

### The one root cause behind most "Critical" issues
The app runs in **guest mode** (no login; `middleware.ts` only refreshes the
session). The seeded garden has `gardener_id = NULL`, but every table's RLS policy
is keyed to `auth.uid()`. So **reads/writes through the anon client returned/affected
zero rows** — that's Issues 2, 3, 4, and 5. Fix: guest data access now routes
through the service‑role client via `lib/supabase/data.ts#createGuestDataClient`
(documented, with a `TODO(auth)` to revert once per‑user sign‑in lands).

---

## 1. Fast verification paths

- **Automated (no deploy needed):** `npm install && npm test` → **47 tests, 8 files, all green.** Covers vision parsing/mime/provider‑routing/fallback, garden‑context formatting, streak math, prompt rotation, and Anthropic refusal/empty handling.
- **Storage end‑to‑end:** `npm run verify:storage` (needs `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) → creates a journal entry + check‑in, reads them back, prints PASS/FAIL.
- **Vision provider live:** `npm run verify:vision` (needs the `VISION_*` vars) → sends a tiny image to OpenRouter/Qwen and reports whether **Qwen** answered (vs. the Haiku fallback).
- **Typecheck/build:** `npx tsc --noEmit` and `npm run build` → both clean.

> Run the verify scripts where outbound network is allowed (your machine / the deploy). They cannot run from a locked‑down CI sandbox.

---

## 2. Issue‑by‑issue verification

Legend: ✅ Fixed · 🟡 Resolved by data/config · ⬜ Open

### Issue 1 — Diagnose: photo never reaches the vision model `Critical` ✅
- **Root cause:** the Haiku vision call cast the mime as `media_type: mimeType as "image/jpeg"`. iPhone **HEIC** (and mislabeled types) reach Anthropic, which only accepts jpeg/png/gif/webp → effectively "no usable image."
- **Fix:** `lib/vision/mime.ts` normalises/validates the mime and passes the correct `media_type`; the route returns a calm **415** for unsupported formats (HEIC) instead of a junk diagnosis; vision now routes to **Qwen2.5‑VL via OpenRouter** first (`lib/vision/providers.ts`), Haiku only as fallback.
- **Files:** `lib/vision/index.ts`, `lib/vision/mime.ts`, `lib/vision/providers.ts`, `app/api/diagnose/route.ts`, `app/diagnose/page.tsx` (copy now says JPG/PNG/WebP).
- **Verify:** Upload a **JPEG/PNG** plant photo on `/diagnose` → real diagnosis; the "Powered by …" line should read **`openrouter:qwen/…`**. If it reads `claude-haiku-vision`, the OpenRouter call failed (check the model slug, see §3) — check runtime logs for `falling back to Haiku`. Upload a **HEIC** → friendly 415 message, not a broken result. Automated: `lib/vision/{mime,parse,providers,diagnose}.test.ts`.

### Issue 2 — Reflect: 500 but UI shows false success `Critical` ✅
- **Root cause:** (a) anon client write blocked by RLS → 500; (b) the client never checked `res.ok` and always rendered success + a fake streak; (c) the "yesterday" lookup used `.eq("gardener_id", null)` which never matches NULL rows, so the streak never advanced.
- **Fix:** writes go through the guest data client; lookup uses `.is("gardener_id", null)`; streak via `lib/streak.ts#computeStreak`; the page now throws on `!res.ok` and shows an inline error instead of false success.
- **Files:** `app/api/checkin/route.ts`, `lib/streak.ts`, `app/checkin/page.tsx`.
- **Verify:** `/checkin` → submit → "Beautifully reflected" only on a real 200; submit again next day (or check DB) → streak increments. Automated: `lib/streak.test.ts`. End‑to‑end: `npm run verify:storage` (creates + reads a check‑in).

### Issue 3 — Journal: save 404, fails silently `Critical` ✅
- **Root cause:** journal GET/POST used the anon client → RLS hid the garden → `getActiveGardenId` style lookup returned nothing → 404; entries never persisted.
- **Fix:** journal GET/POST use the guest data client; POST resolves the garden via `getActiveGardenId()` and requires a non‑empty note.
- **Files:** `app/api/journal/route.ts`, `lib/supabase/data.ts`.
- **Verify:** `/journal` → Add entry → text → Save → entry appears; `GET /api/journal` returns it. Automated/E2E: `npm run verify:storage`.

### Issue 4 — Coach not grounded in the user's garden `High` ✅
- **Root cause:** `fetchGardenContext()` used the anon client (RLS → no rows), so the garden block was never added to the system prompt.
- **Fix:** garden context is read via the guest data client and formatted by the unit‑tested `lib/garden.ts#formatGardenContext`; injected into the system prompt. Also hardened: lazy Anthropic client (no module‑load crash on missing key), graceful handling of missing key / `refusal` / empty content (`lib/ai/anthropic.ts`).
- **Files:** `app/api/chat/route.ts`, `lib/garden.ts`, `lib/ai/anthropic.ts`.
- **Verify:** `/coach` → "What plants do I have?" → names real seeded plants (Cherokee Purple, Sun Gold, basils, …). Automated: `lib/garden.test.ts`, `lib/ai/anthropic.test.ts`.

### Issue 5 — Garden/Journal data‑layer endpoints `High` ✅ (root cause) + design note
- **Root cause of the *symptom* ("No plants yet"):** the RLS guest‑read bug (see §0) — **fixed**. The garden page (`app/garden/page.tsx`) is **server‑rendered** and reads Supabase directly via the guest data client; it does not call a JSON API.
- **About the specific status codes you saw:** these are **by design**, not bugs:
  - `GET /api/garden` → 404: **there is no such route** (garden is SSR, not an API).
  - `GET /api/plants` / `GET /api/beds` → 405: those routes implement **POST only** (plus `[id]` PATCH/DELETE for edits); GET was never implemented.
- **Verify:** load `/garden` (SSR) → 15 seeded plants render across beds. Create a bed/plant via the UI → persists (POST routes).
- **Optional enhancement (not done):** add `GET` handlers to `/api/plants` and `/api/beds` returning JSON if you want a documented read API (also handy for lightweight live verification). Low effort; out of triage scope.

### Issue 6 — Coach quick‑prompts reference nonexistent plants `Medium` 🟡
- **Status:** Resolved by data + grounding. "Cherokee Purple" and "Sun Gold" **do exist** in `002_seed_data.sql`, so once the garden is seeded and the coach is grounded (Issue 4), the chips match reality.
- **Optional enhancement (not done):** make the starter chips dynamic from the live garden (or hide when empty) so they stay correct for non‑seed gardens. Chips live in `app/coach/page.tsx` (`STARTERS`).

### Issue 7 — Loading/error states on AI calls `Medium` ✅ (mostly pre‑existing) 
- **Coach:** already shows a typing indicator while loading and catches network errors (`app/coach/page.tsx`).
- **Diagnose:** already shows "Analysing…" and an error card (`app/diagnose/page.tsx`).
- **Check‑in:** was the real gap — **fixed** in Issue 2 (no more false success; inline error on failure).
- **Verify:** trigger each with a forced failure (e.g. bad key in a preview) → honest error, no fake success.

### Issue 8 — PWA manifest icon missing `/icons/icon-192.png` `Low` ⬜ OPEN
- **Status:** **Not fixed.** `public/manifest.json` references icon paths that don't exist under `public/icons/` → 404; affects "Add to Home Screen."
- **Recommended fix (next agent):** add `public/icons/icon-192.png` and `icon-512.png` (PNG, maskable) and confirm `manifest.json` paths match. Optionally add an `apple-touch-icon`. Pure asset work; no logic.

---

## 3. Gotchas the next agent should know

- **OpenRouter model slug is size‑specific** — 72B is `qwen/qwen2.5-vl-72b-instruct`, but 7B is `qwen/qwen-2.5-vl-7b-instruct` (extra hyphen). A wrong slug → OpenRouter 400 → **silent fallback to Haiku**. Confirm via the "Powered by …" line or runtime logs.
- **Haiku is the intended fallback, not the primary** vision model. Seeing `claude-haiku-vision` means the Qwen call failed.
- **Coach/vision still need `ANTHROPIC_API_KEY`** (coach is Haiku; vision fallback is Haiku). Missing key → coach returns a calm "needs a key" message by design (not a crash).
- **Secrets hygiene:** the OpenRouter key and Supabase service‑role key were shared in chat during setup — consider rotating them. They live only in Vercel env / gitignored `.env.local`, never committed.

## 4. Suggested test order (mirrors the original list)
Disable Deployment Protection (§0) → `npm test` (47 green) → live: **1 → 2 → 3 → 5 → 4 → 6 → 7 → 8**, using the per‑issue Verify steps above. For storage‑touching issues (2, 3) `npm run verify:storage`; for vision (1) `npm run verify:vision`.

## 5. Reference — commits in this fix set (on `main`)
- `577cb2a` audit + debug plan + Vitest harness
- `d374b97` guest‑mode RLS fix + coach grounding + check‑in (Issues 2,3,4,5)
- `3bded56` vision HEIC/format + fallback hardening (Issue 1)
- `206f06d` Qwen via OpenAI‑compatible providers
- `bfe13d7` OpenRouter wiring + `verify:vision`
- `1be7740` `verify:storage`
- Full write‑ups: `docs/ai-features-audit.md`, `docs/ai-debug-plan.md`, `docs/ai-fix-report.md`
