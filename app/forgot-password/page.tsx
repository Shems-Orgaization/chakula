"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError("Unable to send a reset email. Please try again.");
    else
      setMessage(
        "If an account exists for that email, a password reset link is on its way.",
      );
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form onSubmit={submit} className="panel w-full max-w-md">
        <p className="eyebrow text-accent">account recovery</p>
        <h1 className="mt-3 font-serif text-4xl">Reset your password.</h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          Enter your email and we will send a secure reset link.
        </p>
        <label className="field-label mt-8">
          Email
          <input
            className="text-input mt-2 w-full"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 text-sm text-accent" role="status">
            {message}
          </p>
        )}
        <button className="primary-button mt-6 w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <Link
          className="mt-5 block text-center text-sm font-semibold text-accent hover:underline"
          href="/login"
        >
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
