// Bookings are in Pacific time. The UTC offset is -07:00 in summer (PDT) and
// -08:00 in winter (PST), so it has to be looked up per date, never hardcoded.

const offsetFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  timeZoneName: "longOffset",
});

/** "2026-11-10", "09:00" -> "2026-11-10T09:00:00-08:00" */
export function pacificISO(date: string, time: string): string {
  // Probe roughly the same instant (Pacific is 7–8h behind UTC) and read the
  // offset Los Angeles was on at that moment.
  const probe = new Date(new Date(`${date}T${time}:00Z`).getTime() + 8 * 3_600_000);
  const tz = offsetFmt.formatToParts(probe).find((p) => p.type === "timeZoneName")?.value ?? "GMT-08:00";
  const offset = tz.replace("GMT", "") || "+00:00";
  return `${date}T${time}:00${offset}`;
}

/** Today's date in Los Angeles as YYYY-MM-DD. */
export function pacificToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}
