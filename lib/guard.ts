import type { NextRequest } from "next/server";

/** Escape user input before it goes into an email's HTML. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Trim, collapse to one line, cap length. Non-strings become "". */
export function cleanLine(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";
}

export function cleanText(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[A-Za-z]{2,}$/;
export const isEmail = (s: string) => s.length <= 254 && EMAIL_RE.test(s);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory, so each warm serverless instance keeps its own count. That stops a
// script hammering the endpoint from one IP, which is the realistic threat here;
// it is not a hard global limit.
const hits = new Map<string, number[]>();

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.ip || "unknown";
}

/** True if this key has made fewer than `limit` calls in the last `windowMs`. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return true;
}
