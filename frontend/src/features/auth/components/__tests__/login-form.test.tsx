import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = vi.fn();
vi.mock("@/app/providers", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

import { LoginForm } from "../login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls login and redirects to /notes on valid submission", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email address"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "mypassword");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@test.com", "mypassword");
      expect(mockPush).toHaveBeenCalledWith("/notes");
    });
  });
});
