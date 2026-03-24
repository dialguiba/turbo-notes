"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/providers";
import Link from "next/link";
import { PasswordInput } from "@/components/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Minimum 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password);
      router.push("/notes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6 px-6">
      <Image
        src="/images/sleeping_cat.png"
        alt="Sleeping cat mascot"
        width={200}
        height={200}
        className="h-auto min-w-[120px]"
        style={{ width: "14.7vw" }}
        priority
      />

      <h1
        className="text-center font-heading font-bold text-title-brown"
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
      >
        Yay, New Friend!
      </h1>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className={`text-xs ${error ? "text-red-600" : "text-muted-foreground"}`}>
            {error || "Minimum 8 characters"}
          </p>
        </div>

        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>
      </form>

      <Link href="/login" className="text-xs underline">We&apos;re already friends!</Link>
    </div>
  );
}
