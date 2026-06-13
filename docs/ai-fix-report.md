# GardZen — AI Fix Report 🌱✅

> Outcome of the AI-features production triage. Companion to
> [`ai-features-audit.md`](./ai-features-audit.md) (what was broken) and
> [`ai-debug-plan.md`](./ai-debug-plan.md) (the task list, all checked off).

## TL;DR

The AI features weren't broken at the model layer — Haiku 4.5 and the
Qwen→Haiku vision routing were sound. They were broken by a **systemic
guest-mode / Row-Level-Security mismatch** (reads through the anon client
returned nothing for the seeded `gardener_id = NULL` garden) plus a handful of
**provider-handling bugs** (HEIC photos, hard 500s on a missing key, false
"saved!" on failed check-ins, a streak that never advanced). All are fixed,
covered by a new 38-test suite, and the app type-checks and builds clean.

## What was broken → what changed

### 1. Coach gave generic, ungrounded advice (P0)
- **Was:** `fetchGardenContext()` read via the anon client; RLS returned no rows;
  the "grounded in your real garden" system block was never added.
- **Now:** Reads via the new `createGuestDataClient()` (service role). Context is
  built by the extracted, unit-tested `formatGardenContext()`.

### 2. Coach 500'd on a missing key / refusal / empty reply (P0)
- **Was:** `Anthropic` client built at module load (threw on missing key); reply
  read straight from `content[0].text` with no `refusal`/empty handling.
- **Now:** Lazy client; missing key → calm in-thread message; `extractAssistantText()`
  handles `refusal` (gentle redirect) and empty content (gentle retry). Unit-tested.

### 3. Vision failed on iPhone HEIC photos (P0)
- **Was:** UI advertised HEIC; the Haiku path cast the mime to `image/jpeg`;
  Anthropic vision rejects HEIC → generic "Could not analyse photo."
- **Now:** `lib/vision/mime.ts` normalises/validates the mime; the route returns a
  calm, actionable **415** for HEIC/unsupported formats; Haiku always receives a
  valid `media_type`; the diagnose UI advertises the real set (JPG/PNG/WebP).
  Unit-tested.

### 4. Diagnoses were never persisted (P1)
- **Was:** Persistence used the anon client → garden lookup empty → insert skipped.
- **Now:** Persists via `createGuestDataClient()`; persistence failures are logged,
  not swallowed silently.

### 5. Garden & journal rendered empty (P1)
- **Was:** Both read via the anon client (RLS-blocked).
- **Now:** Both use the guest data client; journal POST requires a note and resolves
  the garden via `getActiveGardenId()`.

### 6. Check-in reported false success; streak never advanced (P1)
- **Was:** POST used the anon client (RLS blocked the insert → 500), but the client
  ignored `res.ok` and always showed "saved!" with a 1-day streak. The "yesterday"
  lookup used `.eq("gardener_id", null)`, which never matches NULL rows.
- **Now:** Writes via the guest client; lookup uses `.is("gardener_id", null)`; the
  extracted, unit-tested `computeStreak()` advances on consecutive days, holds when
  already checked in today, and resets after a gap; the UI surfaces real failures.

### Provider quirks addressed (Haiku & Qwen)
- **Haiku:** correct `media_type`; `refusal` stop reason handled; calls correctly
  omit `effort`/`thinking` (unsupported on Haiku); model id `claude-haiku-4-5-20251001`
  confirmed current — no migration needed.
- **Qwen / HuggingFace:** routing + Haiku fallback verified by integration tests
  (custom-endpoint failure and HF failure both fall back to Haiku); JSON parsing
  tolerates prose, markdown fences, and malformed output without throwing.

## UI/UX improvements (mindfulness intent preserved)
- Diagnose: honest format hint; a warm, instructive message for HEIC instead of a
  blunt error.
- Check-in: no longer claims a reflection was saved when it wasn't — a quiet inline
  message, consistent with the calm tone.
- Coach: degrades to gentle, in-character messages ("I'm resting just now…")
  instead of red error states.
All copy stays warm and Zen; no new clutter or nagging.

## Test results
`npm test` → **38 passing across 7 files**:
- `lib/ai/prompts.test.ts` — daily rotation determinism & bounds
- `lib/ai/anthropic.test.ts` — text extraction, refusal, empty
- `lib/garden.test.ts` — garden-context formatting
- `lib/streak.test.ts` — streak math (consecutive, same-day, gap, month boundary)
- `lib/vision/mime.test.ts` — mime normalisation/validation (incl. HEIC)
- `lib/vision/parse.test.ts` — JSON parsing (clean/fenced/prose/malformed)
- `lib/vision/diagnose.test.ts` — provider routing + Haiku fallback (mocked SDK/fetch)

`npx tsc --noEmit` → clean. `next build` → succeeds (17 routes; `/garden` dynamic).

## Known limitations & follow-ups
1. **Live end-to-end is unverified here (hard blocker).** This environment has no
   `ANTHROPIC_API_KEY`, no Supabase keys, and the referenced Supabase project
   (`frvzezqfslypkkbcrrbb`) is unreachable. Verification was build + typecheck +
   a mocked suite. **To verify live:** set the env vars from `.env.local.example`,
   run `supabase/migrations/001` + `002` (or `scripts/run-migrations.mjs`), then
   exercise `/coach`, `/diagnose` (with a real JPEG and a HEIC), `/checkin`, and
   `/garden`.
2. **Guest-mode shim is intentional and temporary.** `createGuestDataClient()` uses
   the service role to make the single seeded garden usable without auth. **Before
   multi-user launch**, wire sign-in to create per-user gardens and revert these
   call sites to the request-scoped anon client so RLS enforces isolation (a single
   `TODO(auth)` marks the spot). Add a public-read RLS policy if guest browsing
   must persist.
3. **No React Native app exists.** The locked MVP ships mobile via the responsive
   PWA (native is Phase 2 in `CLAUDE.md`). The triage brief's "React Native" target
   doesn't match the repo; mobile was validated as the same routes on a phone-width
   build, not a separate native app.
4. **NotebookLM** runs via an `execFile` CLI spawn that can't succeed on Vercel
   serverless; it degrades to `null` cleanly and is gated behind
   `NOTEBOOKLM_NOTEBOOK_ID`. Left as-is; a hosted HTTP endpoint would be the proper
   Phase-2 replacement.
5. **Unused `ai` dependency** (v6) is in `package.json` but imported nowhere — safe
   to drop in a routine dependency cleanup (left untouched to stay within the AI-fix
   scope).
6. **HEIC is rejected, not converted.** Server-side HEIC→JPEG conversion (e.g.
   `sharp`/`heic-convert`) is the future enhancement if iPhone "Most Compatible" is
   too much to ask of users; deferred to keep dependencies lean.
