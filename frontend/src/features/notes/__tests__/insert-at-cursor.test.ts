import { describe, it, expect } from "vitest";
import { insertAtCursor } from "../insert-at-cursor";

describe("insertAtCursor", () => {
  it("inserts text at the beginning of empty content", () => {
    const result = insertAtCursor("", 0, "hello");

    expect(result).toEqual({ newContent: "hello", newCursorPos: 5 });
  });

  it("inserts text at the beginning of existing content (no space prepended at pos 0)", () => {
    const result = insertAtCursor("world", 0, "hello");

    expect(result).toEqual({ newContent: "helloworld", newCursorPos: 5 });
  });

  it("prepends a space separator when inserting at a non-zero position with no preceding space", () => {
    const result = insertAtCursor("helloworld", 5, "beautiful");

    expect(result).toEqual({
      newContent: "hello beautifulworld",
      newCursorPos: 15,
    });
  });

  it("does not prepend a space if preceding character is already a space", () => {
    const result = insertAtCursor("hello world", 6, "beautiful");

    expect(result).toEqual({
      newContent: "hello beautifulworld",
      newCursorPos: 15,
    });
  });

  it("appends to end when cursor position equals content length", () => {
    const result = insertAtCursor("hello", 5, "world");

    expect(result).toEqual({ newContent: "hello world", newCursorPos: 11 });
  });

  it("returns updated cursor position advanced by the inserted length", () => {
    const result = insertAtCursor("abc", 1, "XY");

    // non-zero pos, 'a' is not space → prepend space → " XY" inserted
    expect(result.newCursorPos).toBe(1 + 3); // " XY".length = 3
    expect(result.newContent).toBe("a XYbc");
  });
});
