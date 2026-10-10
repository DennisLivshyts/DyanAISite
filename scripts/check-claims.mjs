#!/usr/bin/env node
/**
 * Every factual line on the site must cite an id from the fact sheet.
 *
 *   node scripts/check-claims.mjs [path/to/dyanailabs.yaml]
 *
 * Fails (exit 1) on an evidence id that isn't in the fact sheet, and on a
 * deny-listed word in any case that names an NDA-bound client anonymously.
 * The fact sheet lives outside this repo, so this is a local pre-merge check,
 * not part of `npm run build`.
 */
import { readFileSync } from "node:fs";

const FACTS = process.argv[2] ?? "C:/Users/denik/cortana-dashboard/server/facts/dyanailabs.yaml";
const ids = new Set([...readFileSync(FACTS, "utf8").matchAll(/^\s*-\s*id:\s*([a-z0-9-]+)\s*$/gm)].map((m) => m[1]));

const { CASES, CAPABILITIES, ABOUT } = await import("../content/work.ts");

// Words that would identify the anonymised sports-analytics client.
const DENY = /edge3|kenyon|utrgv|wisconsin|\bpff\b|\b247\b|athlete|football|recruit/i;

const problems = [];
const check = (where, line) => {
  if (!line.evidence?.length) problems.push(`${where}: no evidence cited for "${line.text}"`);
  for (const id of line.evidence ?? []) if (!ids.has(id)) problems.push(`${where}: unknown evidence id "${id}"`);
};

for (const c of CASES) {
  c.lines.forEach((l, i) => check(`case ${c.slug} line ${i + 1}`, l));
  if (c.slug === "sports-analytics") {
    const text = JSON.stringify(c);
    const hit = text.match(DENY);
    if (hit) problems.push(`case sports-analytics: identifying word "${hit[0]}"`);
  }
}
CAPABILITIES.forEach((cap) => check(`capability "${cap.title}"`, cap.body));
check("about", ABOUT);

const cleared = CASES.filter((c) => c.cleared).map((c) => c.slug);
const waiting = CASES.filter((c) => !c.cleared).map((c) => `${c.slug} (${c.waitingOn})`);
console.log(`fact sheet: ${ids.size} ids`);
console.log(`cleared for production: ${cleared.join(", ") || "none"}`);
console.log(`preview-only:           ${waiting.join("; ") || "none"}`);

if (problems.length) {
  console.error("\n" + problems.map((p) => "✗ " + p).join("\n"));
  process.exit(1);
}
console.log("✓ every line cites a known fact");
