# GardZen — AI Features Audit 🌱🔍

> Written during production triage, June 2026. Covers every AI-adjacent feature,
> its intended behaviour, its actual (broken) behaviour, root-cause hypotheses,
> and the UI/UX gaps observed. The companion task plan lives in
> [`ai-debug-plan.md`](./ai-debug-plan.md); the outcome in
> [`ai-fix-report.md`](./ai-fix-report.md).

## How the system is wired (as found)

- **Frontend:** Next.js App Router (web-first, responsive PWA). There is **no
  React Native app in this repo** — the locked MVP stack (`CLAUDE.md`) ships
  mobile via the responsive PWA, with native deferred to Phase 2. The triage
  brief's reference to "React Native mobile" does not match the codebase; mobile
  is exercised through the same Next.js routes on a phone browser. This is noted,
  not treated as a missing deliverable.
- **AI coach (text):** Anthropic Claude **Haiku 4.5**
  (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk`, in
  `app/api/chat/route.ts`, grounded in live garden state + optional NotebookLM
  knowledge.
- **AI vision (diagnosis):** `lib/vision/index.ts` — a thin interface that routes
  to a custom Qwen2.5-VL endpoint → HuggingFace Qwen → Claude Haiku vision
  (always-on fallback).
- **Mindfulness:** deterministic daily prompt bank (`lib/ai/prompts.ts`) + streak
  tracking (`app/api/checkin/route.ts`).
- **Data:** Supabase (Postgres + Auth + RLS). The app currently runs in **guest
  mode** — `middleware.ts` only refreshes the session and never enforces login;
  the seeded Summer 2026 garden has `gardener_id = NULL`.

## The systemic root cause (affects most "AI is broken" symptoms)

**Guest-mode reads/writes through the anon client are silently blocked by RLS.**

Every table has Row Level Security enabled with policies keyed to
`auth.uid()` (e.g. `gardens: gardener_id in (select id from gardeners where
user_id = auth.uid())`). In guest mode there is no authenticated user, so
`auth.uid()` is `NULL` and **every policy evaluates to "no rows."**

- **Writes already work around this** by using the service-role admin client
  (`lib/supabase/admin.ts`, via `lib/garden.ts#getActiveGardenId`), which bypasses
  RLS.
- **Reads and some writes still use the anon client** (`lib/supabase/server.ts`),
  so they return/affect **zero rows** even when the database is correctly seeded.

This single mismatch explains the bulk of the breakage below: the coach has no
garden context, the garden page renders empty, the journal is always empty,
diagnoses are never persisted, and check-ins silently fail to save.

---

## Feature-by-feature assessment

### 1. AI Green Thumb coach — `app/api/chat/route.ts`, `app/coach/page.tsx`

**Intended:** A calm, garden-grounded chat coach. Each reply is conditioned on
the user's real plants/beds (and optional NotebookLM knowledge) so advice is
specific ("stake the Cherokee Purple…").

**Actual / broken:**
- **Not grounded.** `fetchGardenContext()` uses the anon client → RLS returns no
  plants → `systemPrompt` never gets the garden block → replies are generic. The
  headline feature ("grounded in your real garden") silently doesn't work.
- **Fragile startup.** The `Anthropic` client is constructed at **module load**
  with `process.env.ANTHROPIC_API_KEY`. If the key is missing the route throws on
  first import and returns a generic 500 — there is no graceful "AI not
  configured" state.
- **No `stop_reason` handling.** Reads `response.content[0].text` directly. A
  `refusal` stop reason (possible on safety-adjacent gardening questions about
  pesticides, etc.) or an empty content array yields `""` → the UI shows "Something
  went wrong."
- **NotebookLM on the hot path.** `queryGardenKnowledge` spawns the `notebooklm`
  CLI via `execFile` on **every** message. It is guarded (returns `null` if
  `NOTEBOOKLM_NOTEBOOK_ID` is unset, and catches `ENOENT`), so it degrades, but it
  is a per-request process spawn that can never succeed on Vercel serverless.

**UI/UX:** The chat UI itself is good — calm copy, starter chips, typing
indicator, graceful client-side catch. The gap is entirely server-side
(ungrounded answers, hard 500 on missing key).

### 2. Vision diagnosis — `lib/vision/index.ts`, `app/api/diagnose/route.ts`, `app/diagnose/page.tsx`

**Intended:** Snap a photo → identify plant, assess health, return calm advice as
strict JSON. Qwen2.5-VL primary, Claude Haiku vision fallback.

**Actual / broken:**
- **HEIC photos fail (high impact on mobile).** The UI advertises "JPG, PNG,
  **HEIC** up to 10 MB" and uses `<input accept="image/*" capture>`. iPhones
  capture **HEIC** by default. The Haiku path passes the raw mime through a type
  lie — `media_type: mimeType as "image/jpeg"` — but the Anthropic vision API only
  accepts **jpeg / png / gif / webp**. A HEIC upload returns a 400 from Anthropic,
  which is caught and surfaced as a generic "Could not analyse photo." The most
  common real-world input (an iPhone photo of a sick plant) fails with no
  explanation. This directly blocks the plant-health use case.
- **Coarse error degradation.** On total failure the route returns a single
  generic 500; a missing `ANTHROPIC_API_KEY` (so even the fallback can't run) is
  indistinguishable from a transient provider error.
- **Diagnoses never persisted.** Persistence uses the anon client →
  `gardens` lookup returns nothing → the `diagnoses` insert is skipped. The growth
  history the coach could later draw on is never written.

**Working as designed:** The provider routing + Haiku fallback, and the
defensive JSON parsing (`parseDiagnosis`/`normalizeDiagnosis` never throw and
always return a safe shape) are solid.

**UI/UX:** Loading, error, and result states are well handled and calm. The gaps
are the **misleading format hint** (promises HEIC support that fails) and the
generic error copy.

### 3. Mindfulness check-in / streaks — `app/api/checkin/route.ts`, `app/checkin/page.tsx`

**Intended:** A daily reflective prompt; submitting saves the reflection and
advances a gentle day-streak.

**Actual / broken:**
- **Saves silently fail in guest mode.** The POST uses the anon client; the RLS
  `WITH CHECK` on `checkins` blocks the insert (gardener_id `NULL` ∉ the user's
  gardener rows) → 500. The **client never checks `res.ok`** — it sets
  `submitted = true` and shows "Beautifully reflected… saved to your journal" with
  a 1-day streak regardless. This is silent data loss dressed up as success.
- **Streak never advances.** The "yesterday" lookup is
  `.eq("gardener_id", gardener_id)` with `gardener_id = null`. PostgREST renders
  this as `gardener_id=eq.null`, which never matches `NULL` rows (you must use
  `is.null`). So the previous check-in is never found and the streak resets to 1
  every day.

**UI/UX:** The reflection screen is genuinely calm and on-brand. The integrity
problem is that it **reports success it didn't achieve**.

### 4. Daily prompt selection — `lib/ai/prompts.ts`

**Intended:** Deterministic daily rotation through a Stoic/Buddhist/spiritual
prompt bank.

**Actual:** **Works.** `getTodaysPrompt` is pure and deterministic. Minor
robustness note: it depends on local server time and a fixed epoch; covered with
tests rather than changed.

### 5. Garden inventory (data the AI depends on) — `app/garden/page.tsx`, `app/api/{plants,beds}`

**Intended:** Display the seeded garden; add/edit/remove plants and beds.

**Actual / broken:**
- **Garden renders empty** for guests — the page reads via the anon client (RLS
  blocks). The "No garden found yet." error in the reported screenshot is the
  write-side symptom of the same family: `beds` POST calls `getActiveGardenId()`
  (admin client, correct) which returns `null` only when the `gardens` table is
  genuinely empty — i.e. **migrations/seed were never applied to the connected
  project.** Reads would *still* be empty after seeding until the RLS/guest
  mismatch is fixed.
- Writes (plants/beds CRUD) are correctly on the admin client and are sound.

---

## Cross-cutting gaps

- **No automated tests at all.** `package.json` had no test runner. AI response
  parsing, provider fallback, mime handling, and streak math were entirely
  unverified.
- **Environment/config is a hard external dependency.** No `.env.local`, no
  `ANTHROPIC_API_KEY`, no Supabase keys, and the referenced Supabase project
  (`frvzezqfslypkkbcrrbb`) is not reachable from this environment. True
  end-to-end verification against live Claude/Qwen/Supabase requires credentials
  that are not available here (documented blocker).
- **Model choice is correct and intentional.** Haiku 4.5
  (`claude-haiku-4-5-20251001`) is the locked, cost-optimised choice in `CLAUDE.md`
  and the Anthropic model catalogue — no migration needed. The Haiku calls
  correctly omit `effort`/`thinking` (unsupported on Haiku).

## Severity ranking (by impact on plant health)

| # | Feature | Severity | Why |
|---|---------|----------|-----|
| 1 | Coach garden grounding (RLS guest reads) | **P0** | The plant-care AI gives generic, ungrounded advice |
| 2 | Vision HEIC failure | **P0** | The primary "diagnose my sick plant" input (iPhone) fails |
| 3 | Coach missing-key / refusal handling | **P0** | Hard 500 instead of a calm degraded state |
| 4 | Diagnosis persistence (RLS) | **P1** | Health history the AI could use is lost |
| 5 | Garden + journal empty (RLS) | **P1** | Core data the AI depends on is invisible |
| 6 | Check-in silent-fail + streak (RLS + `is.null`) | **P1** | Mindfulness data loss; broken accountability |
| 7 | NotebookLM on hot path | **P3** | Degrades cleanly; tidy-up only |
