// app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MESSAGES, errorMessage } from "@/lib/messages";
import {
  AuthShell,
  Captcha,
  captchaEnabled,
  FormMessage,
  GoogleButton,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    if (searchParams.get("reason") === "idle") {
      setNotice(MESSAGES.auth.signOutIdle);
    } else if (searchParams.get("error") === "auth") {
      setNotice(MESSAGES.auth.linkExpired);
    } else if (searchParams.get("reason") === "expired") {
      setNotice(MESSAGES.auth.sessionExpired);
    }
  }, [searchParams]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (captchaEnabled && !captchaToken) {
      return setError("Please wait for the security check to finish, then try again.");
    }

    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken ?? undefined },
    });
    
    setLoading(false);
    setCaptchaToken(null);
    setCaptchaReset((n) => n + 1);

    if (error) {
      if (error.message.toLowerCase().includes("confirm")) {
        setError("Please confirm your email before signing in.");
      } else {
        setError(MESSAGES.auth.invalidCredentials);
      }
      return;
    }

    // Redirect to intended page or dashboard
    router.replace(nextRoute);
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
        {notice && <FormMessage kind="info">{notice}</FormMessage>}

        <GoogleButton label="Continue with Google" onError={() => setError(MESSAGES.network.generic)} />

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

        <Captcha onToken={setCaptchaToken} resetKey={captchaReset} />

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