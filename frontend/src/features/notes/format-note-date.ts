import { isToday, isYesterday, format } from "date-fns";

export function formatNoteDate(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "MMM d");
}
