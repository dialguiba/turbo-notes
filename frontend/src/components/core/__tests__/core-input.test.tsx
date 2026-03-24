import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CoreInput } from "../index";

describe("CoreInput password variant", () => {
  it("renders as password field with toggle that cycles password → text → password", async () => {
    const user = userEvent.setup();
    render(<CoreInput variant="password" placeholder="Password" />);

    const input = screen.getByPlaceholderText("Password");
    const toggle = screen.getByRole("button", { name: /toggle password/i });

    // Initially type=password
    expect(input).toHaveAttribute("type", "password");

    // Click toggle → reveals text
    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");

    // Click again → hides password
    await user.click(toggle);
    expect(input).toHaveAttribute("type", "password");
  });
});
