import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAccessToken, availableSlots, calendarId, ALL_SLOTS } from "@/lib/calendar";
import { pacificISO, pacificToday } from "@/lib/pacific";
import { allow, clientIp, cleanLine, cleanText, escapeHtml, isEmail } from "@/lib/guard";

const MAX_DAYS_AHEAD = 90;
const MIN_LEAD_MS    = 60 * 60 * 1000; // no bookings starting within the hour

function formatDisplayTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function daysBetween(a: string, b: string): number {
  return (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot: a hidden field real visitors never fill. Pretend it worked.
  if (body.website) return NextResponse.json({ success: true });

  const date  = cleanLine(body.date, 10);
  const time  = cleanLine(body.time, 5);
  const name  = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254);
  const notes = cleanText(body.notes, 2000);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !ALL_SLOTS.includes(time) || !name || !isEmail(email)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const ahead   = daysBetween(pacificToday(), date);
  const startISO = pacificISO(date, time);
  const start    = new Date(startISO);
  if (weekday === 0 || weekday === 6 || ahead > MAX_DAYS_AHEAD || start.getTime() < Date.now() + MIN_LEAD_MS) {
    return NextResponse.json({ error: "That time can't be booked" }, { status: 400 });
  }

  const ip = clientIp(req);
  if (!allow(`book:${ip}`, 3, 60 * 60 * 1000) || !allow(`book-email:${email.toLowerCase()}`, 2, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many bookings. Please email us instead." }, { status: 429 });
  }

  const ownerEmail  = process.env.OWNER_EMAIL ?? "livshytsd@dyanailabs.com";
  const endISO      = new Date(start.getTime() + 30 * 60_000).toISOString();
  const displayDate = start.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles",
  });
  const displayTime = formatDisplayTime(time);

  // ── Re-check the slot, then create the Google Calendar event ───────────────
  let token: string | null;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Booking is temporarily unavailable" }, { status: 502 });
  }
  if (token) {
    try {
      const open = await availableSlots(date, token);
      if (!open.includes(time)) {
        return NextResponse.json({ error: "That slot was just taken. Please pick another time." }, { status: 409 });
      }
    } catch (err) {
      console.error("Slot re-check failed:", err);
      return NextResponse.json({ error: "Could not confirm availability" }, { status: 502 });
    }

    const evRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events?conferenceDataVersion=1`,
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
    if (!evRes.ok) {
      console.error("Calendar event failed:", evRes.status, await evRes.text());
      return NextResponse.json({ error: "Could not create the booking" }, { status: 502 });
    }
  }

  // ── Send confirmation emails via Resend ────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const sharedStyles = `font-family:sans-serif;background:#0A1628;color:#fff;padding:32px;border-radius:12px;max-width:560px;margin:0 auto`;
    const accent = "#52B788";
    const hName  = escapeHtml(name);
    const hEmail = escapeHtml(email);
    const hNotes = escapeHtml(notes).replace(/\n/g, "<br>");

    const results = await Promise.all([
      // Owner notification
      resend.emails.send({
        from:    "DyanAI Labs Booking <contact@dyanailabs.com>",
        to:      ownerEmail,
        reply_to: email,
        subject: `New booking: ${name} — ${displayDate} at ${displayTime}`,
        html: `<div style="${sharedStyles}">
          <h2 style="color:${accent};margin-top:0">New Consultation Booked</h2>
          <p><strong>Client:</strong> ${hName}</p>
          <p><strong>Email:</strong> <a href="mailto:${hEmail}" style="color:${accent}">${hEmail}</a></p>
          <p><strong>Date:</strong> ${displayDate}</p>
          <p><strong>Time:</strong> ${displayTime} PT</p>
          ${notes ? `<p><strong>Notes:</strong> ${hNotes}</p>` : ""}
        </div>`,
      }),
      // Client confirmation
      resend.emails.send({
        from:    "DyanAI Labs <contact@dyanailabs.com>",
        to:      email,
        reply_to: ownerEmail,
        subject: `Your consultation is confirmed — ${displayDate} at ${displayTime} PT`,
        html: `<div style="${sharedStyles}">
          <h2 style="color:${accent};margin-top:0">You're confirmed, ${hName}!</h2>
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
    for (const r of results) if (r.error) console.error("Resend error:", r.error);
  }

  return NextResponse.json({ success: true });
}
