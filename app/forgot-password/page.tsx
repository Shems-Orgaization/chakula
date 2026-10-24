// app/forgot-password/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { MESSAGES } from "@/lib/messages";

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
    
    if (error) {
      setError(MESSAGES.network.generic);
    } else {
      setMessage(MESSAGES.auth.forgotPasswordSuccess);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form onSubmit={submit} className="panel w-full max-w-md p-6 sm:p-8 border border-border/60 rounded-2xl bg-card">
        <p className="eyebrow text-accent">account recovery</p>
        <h1 className="mt-3 font-serif text-4xl">Reset your password.</h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          Enter your email and we will send a secure reset link.
        </p>
        <label className="field-label mt-8 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
          <input
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        
        {error && (
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400" role="status">
            {message}
          </p>
        )}
        
        <button className="primary-button mt-6 w-full rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 transition" disabled={loading}>
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