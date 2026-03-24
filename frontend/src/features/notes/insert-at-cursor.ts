export function insertAtCursor(
  content: string,
  cursorPos: number,
  transcript: string
): { newContent: string; newCursorPos: number } {
  const needsSpace = cursorPos > 0 && content[cursorPos - 1] !== " ";
  const insertion = needsSpace ? ` ${transcript}` : transcript;

  const newContent =
    content.slice(0, cursorPos) + insertion + content.slice(cursorPos);
  const newCursorPos = cursorPos + insertion.length;

  return { newContent, newCursorPos };
}
