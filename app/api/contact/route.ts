import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { allow, clientIp, cleanLine, cleanText, escapeHtml, isEmail } from "@/lib/guard";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "livshytsd@dyanailabs.com";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot: a hidden field real visitors never fill. Pretend it worked.
  if (body.website) return NextResponse.json({ success: true });

  const name     = cleanLine(body.name, 100);
  const email    = cleanLine(body.email, 254);
  const business = cleanLine(body.business, 150);
  const message  = cleanText(body.message, 5000);

  if (!name || !isEmail(email) || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!allow(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages" }, { status: 429 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const hName     = escapeHtml(name);
  const hEmail    = escapeHtml(email);
  const hBusiness = escapeHtml(business);
  const hMessage  = escapeHtml(message);

  const { error } = await resend.emails.send({
    from: "DyanAI Labs Contact <contact@dyanailabs.com>",
    to: CONTACT_EMAIL,
    reply_to: email,
    subject: `New inquiry from ${name}${business ? ` — ${business}` : ""}`,
    text: `Name: ${name}\nEmail: ${email}\nBusiness: ${business || "N/A"}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A1628; color: #fff; border-radius: 8px;">
        <h2 style="color: #52B788; margin-top: 0;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #9CA3AF; width: 100px;">Name</td><td style="padding: 8px 0;">${hName}</td></tr>
          <tr><td style="padding: 8px 0; color: #9CA3AF;">Email</td><td style="padding: 8px 0;"><a href="mailto:${hEmail}" style="color: #52B788;">${hEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #9CA3AF;">Business</td><td style="padding: 8px 0;">${hBusiness || "—"}</td></tr>
        </table>
        <hr style="border-color: #162B55; margin: 16px 0;" />
        <p style="color: #9CA3AF; margin-bottom: 8px;">Message</p>
        <p style="white-space: pre-wrap; line-height: 1.6;">${hMessage}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
