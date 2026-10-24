// app/signup/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MESSAGES } from "@/lib/messages";
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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (password.length < 8) return setError(MESSAGES.auth.passwordTooShort);
    if (password !== confirm) return setError(MESSAGES.auth.passwordMismatch);
    if (captchaEnabled && !captchaToken) {
      return setError("Please wait for the security check to finish, then try again.");
    }

    setLoading(true);
    const { data, error: authError } = await createClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: { display_name: name.trim() },
        captchaToken: captchaToken ?? undefined,
      },
    });
    
    setLoading(false);
    setCaptchaToken(null);
    setCaptchaReset((n) => n + 1);

    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        return setError(MESSAGES.auth.emailInUse);
      }
      return setError(MESSAGES.network.generic);
    }

    if (data.session) router.replace("/dashboard");
    else
      setMessage(
        "Account created. Check your email to confirm your account, then sign in.",
      );
  }

  return (
    <AuthShell
      variant="signup"
      headline="Make meals yours."
      text="Create an account to keep your pantry, plans and favourites synced across every device."
    >
      <h1 className="font-serif text-4xl tracking-tight">Create your account.</h1>
      <p className="mt-3 leading-6 text-muted-foreground">
        Takes a minute. You will confirm your email, then sign in.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-5">
        <GoogleButton label="Sign up with Google" onError={() => setError(MESSAGES.network.generic)} />

        <TextField
          id="name"
          label="Full name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Your name"
        />
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
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint="At least 8 characters."
        />
        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <Captcha onToken={setCaptchaToken} resetKey={captchaReset} />

        {error && <FormMessage kind="error">{error}</FormMessage>}
        {message && <FormMessage kind="success">{message}</FormMessage>}

        <SubmitButton loading={loading} loadingText="Creating account…">
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="rounded font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}