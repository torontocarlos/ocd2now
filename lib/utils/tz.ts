// Day boundary in America/Toronto (the AHC catchment). Do NOT use UTC.
// playbook §0 + §13: count sessions by user-local midnight.

const TZ = "America/Toronto";

export function torontoDayStart(now: Date = new Date()): Date {
  // Format the current instant in Toronto, extract Y-M-D, then re-parse
  // that local-midnight back to a UTC Date.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  // Find the UTC offset of Toronto at this date by formatting `00:00` Toronto.
  // Easiest: build an ISO at local midnight, then iteratively correct for offset.
  const localMidnightUtcGuess = new Date(
    `${year}-${month}-${day}T00:00:00Z`,
  );
  const offsetMs =
    localMidnightUtcGuess.getTime() -
    new Date(
      localMidnightUtcGuess.toLocaleString("en-US", { timeZone: TZ }),
    ).getTime();

  return new Date(localMidnightUtcGuess.getTime() + offsetMs);
}

export function torontoDaysAgoStart(daysAgo: number, now: Date = new Date()): Date {
  const start = torontoDayStart(now);
  return new Date(start.getTime() - daysAgo * 24 * 3600 * 1000);
}
