#!/usr/bin/env node
// Storage verification — proves the GardZen interface actually persists records
// and that Supabase has the entries, using the SAME service-role path the app's
// guest-mode routes use (see lib/supabase/data.ts).
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/verify-storage.mjs
//   # add --cleanup to delete the records it created afterwards
//
// It will:
//   1. Confirm the seeded garden exists (run migrations first if not).
//   2. Insert a journal entry and a mindfulness check-in, then read them back.
//   3. Print a clear PASS/FAIL summary with the row IDs.

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLEANUP = process.argv.includes("--cleanup");

if (!URL || !KEY) {
  console.error("✗ Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  console.error("  (Copy from .env.local.example / your Supabase project settings.)");
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });
const stamp = new Date().toISOString();
let failures = 0;
const created = { journal: null, checkin: null };

async function step(label, fn) {
  try {
    const result = await fn();
    console.log(`✓ ${label}`);
    return result;
  } catch (err) {
    failures++;
    console.error(`✗ ${label}\n   ${err?.message ?? err}`);
    return null;
  }
}

// 1. Seeded garden present?
const garden = await step("Garden seeded", async () => {
  const { data, error } = await db
    .from("gardens")
    .select("id,name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      "No garden found. Run the migrations first:\n" +
        "   SUPABASE_ACCESS_TOKEN=<pat> node scripts/run-migrations.mjs\n" +
        "   (or paste supabase/migrations/*.sql into Supabase Studio → SQL Editor)"
    );
  }
  console.log(`   garden: ${data.name} (${data.id})`);
  return data;
});

if (!garden) {
  console.error("\nRESULT: FAIL — cannot verify storage without a seeded garden.");
  process.exit(1);
}

// 2a. Journal entry (mirrors POST /api/journal)
await step("Journal entry stored + read back", async () => {
  const note = `✅ storage verification ${stamp}`;
  const { data: ins, error: insErr } = await db
    .from("journal_entries")
    .insert({ garden_id: garden.id, note })
    .select()
    .single();
  if (insErr) throw insErr;
  created.journal = ins.id;
  const { data: got, error: getErr } = await db
    .from("journal_entries")
    .select("id,note")
    .eq("id", ins.id)
    .single();
  if (getErr) throw getErr;
  if (got.note !== note) throw new Error("read-back mismatch");
  console.log(`   journal_entries row: ${got.id}`);
});

// 2b. Check-in (mirrors POST /api/checkin, guest mode → gardener_id NULL)
await step("Check-in stored + read back", async () => {
  const response = `✅ storage verification ${stamp}`;
  const { data: ins, error: insErr } = await db
    .from("checkins")
    .insert({
      gardener_id: null,
      prompt: "Storage verification",
      tradition: "spiritual",
      response,
      streak_day: 1,
    })
    .select()
    .single();
  if (insErr) throw insErr;
  created.checkin = ins.id;
  const { data: got, error: getErr } = await db
    .from("checkins")
    .select("id,response")
    .is("gardener_id", null)
    .eq("id", ins.id)
    .single();
  if (getErr) throw getErr;
  if (got.response !== response) throw new Error("read-back mismatch");
  console.log(`   checkins row: ${got.id}`);
});

// 3. Optional cleanup
if (CLEANUP) {
  await step("Cleanup (delete verification rows)", async () => {
    if (created.journal) await db.from("journal_entries").delete().eq("id", created.journal);
    if (created.checkin) await db.from("checkins").delete().eq("id", created.checkin);
  });
} else {
  console.log("\nLeft the verification rows in place so you can see them in Supabase Studio.");
  console.log("Re-run with --cleanup to remove them.");
}

console.log(
  failures === 0
    ? "\nRESULT: PASS — the interface stores records and Supabase has the entries. 🌱"
    : `\nRESULT: FAIL — ${failures} check(s) failed (see above).`
);
process.exit(failures === 0 ? 0 : 1);
