import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "livshytsd@dyanailabs.com";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, business, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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
          <tr><td style="padding: 8px 0; color: #9CA3AF; width: 100px;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #9CA3AF;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #52B788;">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #9CA3AF;">Business</td><td style="padding: 8px 0;">${business || "—"}</td></tr>
        </table>
        <hr style="border-color: #162B55; margin: 16px 0;" />
        <p style="color: #9CA3AF; margin-bottom: 8px;">Message</p>
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
