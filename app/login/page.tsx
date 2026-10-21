// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, FormMessage, PasswordField, SubmitButton, TextField } from "@/components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("confirm")
          ? "Please confirm your email before signing in."
          : "Invalid email or password."
      );
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      variant="login"
      headline="Welcome back to your kitchen."
      text="Sign in to pick up your meals, pantry and plans right where you left off."
    >
      <h1 className="font-serif text-4xl tracking-tight">Welcome back.</h1>
      <p className="mt-3 leading-6 text-muted-foreground">
        Sign in to keep your meals, pantry, planner and preferences synced.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="rounded text-sm font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <FormMessage kind="error">{error}</FormMessage>}

        <SubmitButton loading={loading} loadingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="rounded font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}