import { NextRequest, NextResponse } from "next/server";

// ── Google OAuth2 helper ──────────────────────────────────────────────────────
async function getAccessToken(): Promise<string | null> {
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
  return data.access_token ?? null;
}

// ── Generate every 30-min slot from 9 AM – 5 PM ──────────────────────────────
function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    slots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const allSlots = generateSlots();

  const token = await getAccessToken();
  if (!token) {
    // Google Calendar not configured — return all slots
    return NextResponse.json({ slots: allSlots });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
  // Use Pacific time offset — update if Dennis moves
  const timeMin = `${date}T00:00:00-07:00`;
  const timeMax = `${date}T23:59:59-07:00`;

  const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: "America/Los_Angeles",
      items: [{ id: calendarId }],
    }),
  });

  const fbData = await fbRes.json();
  const busy: { start: string; end: string }[] =
    fbData.calendars?.[calendarId]?.busy ?? [];

  const available = allSlots.filter((slot) => {
    const slotStart = new Date(`${date}T${slot}:00-07:00`);
    const slotEnd   = new Date(slotStart.getTime() + 30 * 60 * 1000);
    return !busy.some((b) => {
      const bStart = new Date(b.start);
      const bEnd   = new Date(b.end);
      return slotStart < bEnd && slotEnd > bStart;
    });
  });

  return NextResponse.json({ slots: available });
}
