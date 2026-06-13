import { createAdminClient } from "./admin";

// Guest-mode data access (server-only).
//
// GardZen's MVP runs without sign-in: middleware only refreshes the session and
// the seeded Summer 2026 garden has gardener_id = NULL. Every table has RLS
// policies keyed to auth.uid(), so the anon client returns zero rows for a guest
// — which silently breaks the coach's garden grounding, the garden/journal views,
// diagnosis persistence, and check-in saves.
//
// Writes already use the service-role admin client (see lib/garden.ts); this
// helper makes guest *reads* (and guest writes that RLS would block) consistent
// with that, so the seeded garden is actually usable.
//
// NEVER import this into a client component — the service role bypasses RLS.
// TODO(auth): once sign-in creates per-user gardens, switch these call sites back
// to the request-scoped anon client (lib/supabase/server.ts) so RLS enforces
// per-user isolation, and drop this shim.
export function createGuestDataClient() {
  return createAdminClient();
}
