import { LoginForm } from "@/features/auth/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Turbo Notes account",
};

export default function LoginPage() {
  return <LoginForm />;
}
