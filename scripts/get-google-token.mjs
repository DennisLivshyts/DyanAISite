/**
 * One-time script to obtain a Google Calendar OAuth2 refresh token.
 *
 * Usage:
 *   1. Fill in CLIENT_ID and CLIENT_SECRET below (from Google Cloud Console).
 *   2. Run:  node scripts/get-google-token.mjs
 *   3. Open the URL printed in your terminal and authorize the app.
 *   4. Google will redirect to localhost:3001 — the script captures the code
 *      automatically and prints your GOOGLE_REFRESH_TOKEN.
 *   5. Paste the refresh token into .env.local.
 *
 * You only ever need to run this once. The refresh token doesn't expire
 * unless you revoke access in your Google account settings.
 */

import http from "http";
import { exec } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
// Option A: fill in directly here
let CLIENT_ID     = "";
let CLIENT_SECRET = "";

// Option B: read from .env.local automatically (preferred)
const __dir    = dirname(fileURLToPath(import.meta.url));
const envPath  = resolve(__dir, "../.env.local");

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const [key, ...rest] = line.split("=");
    const val = rest.join("=").trim();
    if (key?.trim() === "GOOGLE_CLIENT_ID")     CLIENT_ID     = val;
    if (key?.trim() === "GOOGLE_CLIENT_SECRET") CLIENT_SECRET = val;
  }
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\n❌  GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.\n" +
    "    Either fill them into .env.local or edit this script directly.\n"
  );
  process.exit(1);
}

// ── OAuth setup ───────────────────────────────────────────────────────────────
const REDIRECT_URI = "http://localhost:3001/oauth/callback";
const SCOPES       = "https://www.googleapis.com/auth/calendar";

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;          // force consent screen so we always get a refresh token

console.log("\n🚀  Opening browser for Google authorization…");
console.log("    If it doesn't open, paste this URL manually:\n");
console.log("   ", authUrl, "\n");

// Try to open the browser cross-platform
const open =
  process.platform === "win32"  ? `start "" "${authUrl}"` :
  process.platform === "darwin" ? `open "${authUrl}"` :
                                  `xdg-open "${authUrl}"`;
exec(open);

// ── Local callback server ─────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth/callback")) {
    res.writeHead(404); res.end(); return;
  }

  const url  = new URL(req.url, "http://localhost:3001");
  const code = url.searchParams.get("code");
  const err  = url.searchParams.get("error");

  if (err || !code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h2>Authorization failed: ${err ?? "no code"}</h2><p>Close this tab.</p>`);
    server.close();
    return;
  }

  // Exchange code for tokens
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      throw new Error(tokens.error_description ?? tokens.error);
    }

    console.log("\n✅  Success! Add this to your .env.local:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log("\n   (Access token below — not needed in .env.local)\n");
    console.log(`   access_token: ${tokens.access_token?.slice(0, 40)}…`);
    console.log(`   expires_in:   ${tokens.expires_in}s\n`);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <html><body style="font-family:sans-serif;padding:40px;background:#0a1628;color:#fff">
        <h2 style="color:#52B788">✅ Authorization complete!</h2>
        <p>Check your terminal for the <code style="color:#2DD4BF">GOOGLE_REFRESH_TOKEN</code>.</p>
        <p style="color:#9CA3AF">You can close this tab.</p>
      </body></html>
    `);
  } catch (e) {
    console.error("\n❌  Token exchange failed:", e.message);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h2>Token exchange failed</h2><pre>${e.message}</pre>`);
  }

  server.close();
});

server.listen(3001, () => {
  console.log("⏳  Waiting for Google to redirect to localhost:3001…\n");
});
