import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignup = vi.fn();
vi.mock("@/app/providers", () => ({
  useAuth: () => ({ signup: mockSignup }),
}));

import { SignupForm } from "../signup-form";

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows inline error when password is shorter than 8 characters", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("Email address"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("calls signup and redirects to /notes on valid submission", async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue(undefined);
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("Email address"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("test@test.com", "password123");
      expect(mockPush).toHaveBeenCalledWith("/notes");
    });
  });

  it("displays server error inline when signup fails", async () => {
    const user = userEvent.setup();
    mockSignup.mockRejectedValue(
      new Error("A user with this email already exists."),
    );
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("Email address"), "taken@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText("A user with this email already exists."),
      ).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears server error when submitting again", async () => {
    const user = userEvent.setup();
    mockSignup
      .mockRejectedValueOnce(new Error("A user with this email already exists."))
      .mockResolvedValueOnce(undefined);
    render(<SignupForm />);

    await user.type(screen.getByPlaceholderText("Email address"), "taken@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(
        screen.getByText("A user with this email already exists."),
      ).toBeInTheDocument();
    });

    // Submit again — error should clear and succeed
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/notes");
    });
  });
});
