"use client";

import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { PasswordInput } from "@/components/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/notes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 px-6">
      <Image
        src="/images/cactus_mascot.png"
        alt="Cactus mascot"
        width={100}
        height={100}
        className="h-auto min-w-15"
        style={{ width: "7.4vw" }}
        priority
      />

      <h1
        className="font-heading text-title-brown text-center font-bold"
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
      >
        Yay, You&apos;re Back!
      </h1>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>

      <Link href="/signup" className="text-xs underline">Oops! I&apos;ve never been here before</Link>
    </div>
  );
}
