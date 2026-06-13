# GardZen — AI Debug & Restore Plan ✅

> Ordered, checkable tasks. Prioritised by impact on plant health (plant-care AI
> before mindfulness extras). Each task lists objective, files, verification, and
> expected outcome. Findings in [`ai-features-audit.md`](./ai-features-audit.md);
> outcomes in [`ai-fix-report.md`](./ai-fix-report.md).

## Task 0 — Test harness

- [x] **Objective:** Add a test runner so fixes can be verified.
- **Files:** `package.json`, `vitest.config.ts`.
- **Verify:** `npm test` runs.
- **Outcome:** Vitest wired with the `@/` path alias; `npm test` executes.

## Task 1 — Fix guest-mode data access (RLS root cause) — P0/P1

- [x] **Objective:** Route guest-mode reads/writes through the service-role
  client so the seeded `gardener_id = NULL` garden is visible until per-user auth
  is wired — restoring coach grounding, garden/journal display, diagnosis
  persistence, and check-in saves in one change.
- **Files:** `lib/supabase/data.ts` (new), `app/garden/page.tsx`,
  `app/api/journal/route.ts`, `app/api/chat/route.ts`, `app/api/diagnose/route.ts`,
  `app/api/checkin/route.ts`.
- **Verify:** `npx tsc --noEmit`; `next build`; data-access call sites no longer
  use the anon client for guest data.
- **Outcome:** A single documented `createGuestDataClient()` shim; a TODO marks
  the future swap to per-user RLS once sign-in creates gardens.

## Task 2 — Coach garden grounding — P0

- [x] **Objective:** Make the coach actually condition on the real garden.
- **Files:** `app/api/chat/route.ts`, `lib/garden.ts` (extract
  `formatGardenContext`).
- **Verify:** Unit test for `formatGardenContext`; build.
- **Outcome:** Garden context built from guest-data reads; formatter unit-tested.

## Task 3 — Coach resilience (missing key, refusal, empty) — P0

- [x] **Objective:** Replace the hard 500 with calm, in-character degradation.
- **Files:** `app/api/chat/route.ts`, `lib/ai/anthropic.ts` (new helper).
- **Verify:** Unit tests for the text-extraction/refusal helper; build.
- **Outcome:** Lazy client; missing key → gentle reply; `refusal`/empty handled.

## Task 4 — Vision: HEIC + image-format handling — P0

- [x] **Objective:** Stop the silent HEIC failure; validate/normalise mime;
  give a calm, actionable message for unsupported formats; fix the misleading UI
  copy.
- **Files:** `lib/vision/mime.ts` (new), `lib/vision/index.ts`,
  `app/api/diagnose/route.ts`, `app/diagnose/page.tsx`.
- **Verify:** Unit tests for mime normalisation/validation; build.
- **Outcome:** Supported formats pass with the correct `media_type`; unsupported
  (incl. HEIC) return a friendly message; UI advertises the real set.

## Task 5 — Vision: parsing + provider fallback hardening — P1

- [x] **Objective:** Lock in the JSON parsing/normalisation and provider
  fallback behaviour with tests; clearer degraded message on total failure.
- **Files:** `lib/vision/index.ts` (export `parseDiagnosis`/`normalizeDiagnosis`),
  `app/api/diagnose/route.ts`.
- **Verify:** Unit tests (prose, malformed JSON, fenced JSON, missing fields) +
  fallback-to-Haiku integration test with mocked providers.
- **Outcome:** Parsing never throws; primary-provider failure falls back to Haiku.

## Task 6 — Check-in: real saves + streak math — P1

- [x] **Objective:** Persist check-ins in guest mode and advance the streak
  correctly; stop the UI reporting false success.
- **Files:** `app/api/checkin/route.ts`, `lib/streak.ts` (new),
  `app/checkin/page.tsx`.
- **Verify:** Unit tests for `computeStreak`; build.
- **Outcome:** Guest writes via service role; `is.null` lookup; streak advances on
  consecutive days; client surfaces real save failures.

## Task 7 — Mindfulness prompt determinism — P2

- [x] **Objective:** Lock the daily prompt rotation with tests.
- **Files:** `lib/ai/prompts.ts`.
- **Verify:** Unit tests (in-bounds, deterministic per day, offset, negative).
- **Outcome:** Behaviour pinned; no code change required.

## Task 8 — Regression + full verification

- [x] **Objective:** Ensure non-AI functionality still builds and the suite is
  green.
- **Verify:** `npm test`; `npx tsc --noEmit`; `next build`.
- **Outcome:** All tests pass; typecheck clean; production build succeeds.

## Task 9 — Final report

- [x] **Objective:** Summarise what was broken, what changed, test results, UX
  improvements, and remaining limitations.
- **Files:** `docs/ai-fix-report.md`.
- **Outcome:** Report delivered.

---

### Known hard blocker (documented, not skipped)

Live end-to-end runs against Claude, Qwen/HuggingFace, and Supabase need
credentials not present in this environment, and the referenced Supabase project
is unreachable here. Verification is therefore: production build + typecheck +
a mocked unit/integration suite covering parsing, fallback, mime, grounding, and
streak math. Remaining live checks are enumerated in the fix report.
