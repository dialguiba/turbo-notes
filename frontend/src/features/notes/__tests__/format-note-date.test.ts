import { describe, it, expect, vi, afterEach } from "vitest";
import { subDays, startOfDay, addHours, subMinutes } from "date-fns";
import { formatNoteDate } from "../format-note-date";

/**
 * Helper: builds ISO strings relative to a fixed "now" in local time,
 * so tests aren't affected by the runner's timezone.
 */
function setupNow() {
  const now = new Date();
  now.setHours(14, 0, 0, 0); // 2 PM local time today
  vi.setSystemTime(now);
  return now;
}

describe("formatNoteDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for a date today', () => {
    const now = setupNow();
    const earlier = addHours(startOfDay(now), 2); // 2 AM today
    expect(formatNoteDate(earlier.toISOString())).toBe("Today");
  });

  it('returns "Today" for right now', () => {
    const now = setupNow();
    expect(formatNoteDate(now.toISOString())).toBe("Today");
  });

  it('returns "Yesterday" for a date yesterday', () => {
    const now = setupNow();
    const yesterday = addHours(startOfDay(subDays(now, 1)), 10); // 10 AM yesterday
    expect(formatNoteDate(yesterday.toISOString())).toBe("Yesterday");
  });

  it('returns "Yesterday" for late yesterday (midnight edge case)', () => {
    // Set "now" to just after midnight
    const now = new Date();
    now.setHours(0, 5, 0, 0);
    vi.setSystemTime(now);

    const lateYesterday = subMinutes(startOfDay(now), 5); // 11:55 PM yesterday
    expect(formatNoteDate(lateYesterday.toISOString())).toBe("Yesterday");
  });

  it('returns "Mon DD" format for older dates', () => {
    const now = setupNow();
    const fiveDaysAgo = subDays(now, 5);
    const result = formatNoteDate(fiveDaysAgo.toISOString());
    // Should be "Mon D" format, e.g. "Mar 19"
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  it("does not show the year for older dates", () => {
    const now = setupNow();
    const longAgo = subDays(now, 90);
    const result = formatNoteDate(longAgo.toISOString());
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    expect(result).not.toMatch(/\d{4}/);
  });

  it("formats single-digit days without leading zero", () => {
    // Use a fixed date where day < 10
    vi.setSystemTime(new Date(2026, 2, 24, 14, 0, 0)); // March 24
    expect(formatNoteDate(new Date(2026, 2, 1, 10, 0, 0).toISOString())).toBe(
      "Mar 1"
    );
  });
});
