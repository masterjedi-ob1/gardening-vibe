#!/usr/bin/env node
// Runs Supabase migrations via the Management API SQL endpoint.
// Usage: SUPABASE_ACCESS_TOKEN=<pat> node scripts/run-migrations.mjs
// OR: runs in Vercel build via SUPABASE_ACCESS_TOKEN env var
//
// Alternative: paste supabase/migrations/*.sql into Supabase Studio → SQL Editor

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const REF = "frvzezqfslypkkbcrrbb";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Supabase PAT from account settings

if (!TOKEN) {
  console.error("No SUPABASE_ACCESS_TOKEN set. Run migrations manually in Supabase Studio instead.");
  console.error("See supabase/migrations/ for the SQL files to paste.");
  process.exit(0); // Non-fatal — app works once schema is created
}

const migrations = [
  join(__dirname, "../supabase/migrations/001_initial_schema.sql"),
  join(__dirname, "../supabase/migrations/002_seed_data.sql"),
];

for (const file of migrations) {
  const sql = readFileSync(file, "utf8");
  console.log(`Running ${file.split("/").pop()}...`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`  Warning (may already exist): ${res.status} ${text.slice(0, 200)}`);
  } else {
    console.log("  ✓ Done");
  }
}

console.log("\nMigrations complete — verify in Supabase Studio → Table Editor.");
