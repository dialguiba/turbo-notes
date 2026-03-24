import { format } from "date-fns";

export function formatEditorDate(dateString: string): string {
  const date = new Date(dateString);
  return `Last Edited: ${format(date, "MMMM d, yyyy 'at' h:mmaaa")}`;
}
