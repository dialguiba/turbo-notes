import { describe, it, expect, vi, afterEach } from "vitest";
import { formatEditorDate } from "../format-editor-date";

describe("formatEditorDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats a date as 'Last Edited: Month Day, Year at H:MMam/pm'", () => {
    const date = new Date(2024, 6, 21, 20, 39, 0); // July 21, 2024 8:39 PM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: July 21, 2024 at 8:39pm",
    );
  });

  it("formats AM times correctly", () => {
    const date = new Date(2026, 2, 24, 9, 5, 0); // March 24, 2026 9:05 AM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: March 24, 2026 at 9:05am",
    );
  });

  it("formats 12 PM (noon) correctly", () => {
    const date = new Date(2026, 0, 1, 12, 0, 0); // Jan 1, 2026 12:00 PM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: January 1, 2026 at 12:00pm",
    );
  });

  it("formats 12 AM (midnight) correctly", () => {
    const date = new Date(2026, 5, 15, 0, 0, 0); // June 15, 2026 12:00 AM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: June 15, 2026 at 12:00am",
    );
  });

  it("formats single-digit day without leading zero", () => {
    const date = new Date(2025, 11, 3, 14, 30, 0); // Dec 3, 2025 2:30 PM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: December 3, 2025 at 2:30pm",
    );
  });

  it("formats single-digit minute with leading zero", () => {
    const date = new Date(2026, 3, 10, 7, 5, 0); // April 10, 2026 7:05 AM
    expect(formatEditorDate(date.toISOString())).toBe(
      "Last Edited: April 10, 2026 at 7:05am",
    );
  });
});
