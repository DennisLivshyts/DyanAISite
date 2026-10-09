import { pacificISO } from "./pacific";

// ── Google OAuth2 helper ──────────────────────────────────────────────────────
// null only when Google Calendar isn't configured at all. Configured but broken
// (e.g. a revoked refresh token) throws, so a booking never "succeeds" without
// the slot check and the calendar event.
export async function getAccessToken(): Promise<string | null> {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type:    "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Google token refresh failed: ${data.error ?? res.status}`);
  return data.access_token;
}

export const calendarId = () => process.env.GOOGLE_CALENDAR_ID ?? "primary";

// ── Every 30-min slot from 9 AM – 5 PM Pacific ───────────────────────────────
export const ALL_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
})();

/** Open slots for a YYYY-MM-DD date. All slots if Google Calendar isn't configured. */
export async function availableSlots(date: string, token: string | null): Promise<string[]> {
  if (!token) return ALL_SLOTS;

  const id = calendarId();
  const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin:  pacificISO(date, "00:00"),
      timeMax:  pacificISO(date, "23:59"),
      timeZone: "America/Los_Angeles",
      items: [{ id }],
    }),
  });
  if (!fbRes.ok) throw new Error(`freeBusy failed: ${fbRes.status}`);

  const fbData = await fbRes.json();
  const busy: { start: string; end: string }[] = fbData.calendars?.[id]?.busy ?? [];

  return ALL_SLOTS.filter((slot) => {
    const slotStart = new Date(pacificISO(date, slot));
    const slotEnd   = new Date(slotStart.getTime() + 30 * 60 * 1000);
    return !busy.some((b) => slotStart < new Date(b.end) && slotEnd > new Date(b.start));
  });
}
