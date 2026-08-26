"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")
          setReady(true);
      },
    );
    void supabase.auth
      .getSession()
      .then(({ data }: { data: { session: unknown } }) =>
        setReady(Boolean(data.session)),
      );
    return () => data.subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error)
      return setError(
        "Unable to update your password. Please request a new link.",
      );
    setMessage("Password updated. Redirecting you to Chakula…");
    setTimeout(() => {
      router.replace("/");
    }, 900);
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form onSubmit={submit} className="panel w-full max-w-md">
        <p className="eyebrow text-accent">account recovery</p>
        <h1 className="mt-3 font-serif text-4xl">Choose a new password.</h1>
        <p className="mt-3 leading-6 text-muted-foreground">
          Use at least 8 characters to keep your account secure.
        </p>
        {ready ? (
          <>
            <label className="field-label mt-8">
              New password
              <input
                className="text-input mt-2 w-full"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="field-label mt-4">
              Confirm password
              <input
                className="text-input mt-2 w-full"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <button className="primary-button mt-6 w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            Open the reset link from your email to continue.
          </p>
        )}
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
