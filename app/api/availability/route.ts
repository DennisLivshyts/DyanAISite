import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, availableSlots } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date required" }, { status: 400 });
  }

  try {
    const token = await getAccessToken();
    const slots = await availableSlots(date, token);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json({ error: "Could not load availability" }, { status: 502 });
  }
}
