import { describe, it, expect } from "vitest";
import { torontoDayStart, torontoDaysAgoStart } from "./tz";

// The day boundary drives session counts. Using UTC midnight instead of
// Toronto midnight would shift bands by 4–5 hours for a Toronto user —
// a 3am session would count toward the wrong day. Pin the behavior.

describe("torontoDayStart", () => {
  it("returns a Date earlier than or equal to the input", () => {
    const now = new Date("2026-05-08T16:30:00Z");
    const start = torontoDayStart(now);
    expect(start.getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it("represents 00:00 in America/Toronto for the input's local date", () => {
    // 2026-05-08T16:30:00Z is May 8, 12:30 PM in Toronto (EDT, UTC-4).
    // Toronto-local midnight that day is 2026-05-08T04:00:00Z.
    const now = new Date("2026-05-08T16:30:00Z");
    const start = torontoDayStart(now);
    expect(start.toISOString()).toBe("2026-05-08T04:00:00.000Z");
  });

  it("rolls back to the previous day when called just after Toronto midnight UTC-equivalent", () => {
    // 2026-05-08T03:30:00Z is May 7, 11:30 PM in Toronto. Day-start
    // should be the Toronto midnight that started May 7, which is
    // 2026-05-07T04:00:00Z.
    const now = new Date("2026-05-08T03:30:00Z");
    const start = torontoDayStart(now);
    expect(start.toISOString()).toBe("2026-05-07T04:00:00.000Z");
  });

  it("handles winter (EST, UTC-5)", () => {
    // 2026-01-15T12:00:00Z is Jan 15, 7am Toronto.
    // Toronto midnight Jan 15 is 2026-01-15T05:00:00Z.
    const now = new Date("2026-01-15T12:00:00Z");
    const start = torontoDayStart(now);
    expect(start.toISOString()).toBe("2026-01-15T05:00:00.000Z");
  });
});

describe("torontoDaysAgoStart", () => {
  it("zero days ago equals torontoDayStart", () => {
    const now = new Date("2026-05-08T16:30:00Z");
    expect(torontoDaysAgoStart(0, now).toISOString()).toBe(
      torontoDayStart(now).toISOString(),
    );
  });

  it("six days ago is six 24h periods before today's Toronto midnight", () => {
    const now = new Date("2026-05-08T16:30:00Z");
    const sixAgo = torontoDaysAgoStart(6, now);
    const today = torontoDayStart(now);
    expect(today.getTime() - sixAgo.getTime()).toBe(6 * 24 * 3600 * 1000);
  });
});
