"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/providers";
import { CoreButton, CoreInput, TextLink } from "@/components/core";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/notes");
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
        className="h-auto min-w-[60px]"
        style={{ width: "7.4vw" }}
        priority
      />

      <h1
        className="text-center font-heading font-bold text-title-brown"
        style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
      >
        Yay, You&apos;re Back!
      </h1>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <CoreInput
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <CoreInput
          variant="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <CoreButton
          type="submit"
          variant="outlined"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </CoreButton>
      </form>

      <TextLink href="/signup">Oops! I&apos;ve never been here before</TextLink>
    </div>
  );
}
