import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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

function addMinutes(dateTimeISO: string, minutes: number): string {
  return new Date(new Date(dateTimeISO).getTime() + minutes * 60_000).toISOString();
}

function formatDisplayTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export async function POST(req: NextRequest) {
  const { date, time, name, email, notes } = await req.json();
  if (!date || !time || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ownerEmail = process.env.OWNER_EMAIL ?? "livshytsd@dyanailabs.com";
  const startISO   = `${date}T${time}:00-07:00`;
  const endISO     = addMinutes(startISO, 30);
  const displayDate = new Date(startISO).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const displayTime = formatDisplayTime(time);

  // ── Create Google Calendar event ───────────────────────────────────────────
  const token = await getAccessToken();
  if (token) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary:     `DyanAI Labs Consultation — ${name}`,
          description: `Client: ${name}\nEmail: ${email}\n\n${notes || "No additional notes."}`,
          start: { dateTime: startISO, timeZone: "America/Los_Angeles" },
          end:   { dateTime: endISO,   timeZone: "America/Los_Angeles" },
          attendees: [{ email: ownerEmail }, { email }],
          conferenceData: { createRequest: { requestId: `dyanailabs-${Date.now()}` } },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email",  minutes: 1440 },
              { method: "popup",  minutes: 30   },
            ],
          },
        }),
      },
    );
  }

  // ── Send confirmation emails via Resend ────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sharedStyles = `font-family:sans-serif;background:#0A1628;color:#fff;padding:32px;border-radius:12px;max-width:560px;margin:0 auto`;
    const accent = "#52B788";

    await Promise.all([
      // Owner notification
      resend.emails.send({
        from:    "DyanAI Labs Booking <contact@dyanailabs.com>",
        to:      ownerEmail,
        subject: `New booking: ${name} — ${displayDate} at ${displayTime}`,
        html: `<div style="${sharedStyles}">
          <h2 style="color:${accent};margin-top:0">New Consultation Booked</h2>
          <p><strong>Client:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:${accent}">${email}</a></p>
          <p><strong>Date:</strong> ${displayDate}</p>
          <p><strong>Time:</strong> ${displayTime} PT</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
        </div>`,
      }),
      // Client confirmation
      resend.emails.send({
        from:    "DyanAI Labs <contact@dyanailabs.com>",
        to:      email,
        replyTo: ownerEmail,
        subject: `Your consultation is confirmed — ${displayDate} at ${displayTime}`,
        html: `<div style="${sharedStyles}">
          <h2 style="color:${accent};margin-top:0">You're confirmed, ${name}!</h2>
          <p>Your free consultation with DyanAI Labs is scheduled for:</p>
          <p style="font-size:18px;font-weight:bold;color:${accent}">${displayDate} at ${displayTime} PT</p>
          <p style="color:#9CA3AF;font-size:14px">Duration: 30 minutes</p>
          <p>We'll reach out if anything changes. See you then!</p>
          <p style="color:#9CA3AF;font-size:13px;margin-top:24px">
            Questions? Reply to this email or reach us at <a href="mailto:${ownerEmail}" style="color:${accent}">${ownerEmail}</a>
          </p>
        </div>`,
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
