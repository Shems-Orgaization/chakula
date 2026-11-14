// components/auth-shell.tsx
"use client";

import Link from "next/link";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Carrot,
  ChefHat,
  Cookie,
  Eye,
  EyeOff,
  Heart,
  Leaf,
  Loader2,
  Lock,
  Mail,
  Salad,
  Soup,
  User,
  Wheat,
} from "lucide-react";
import { Photo } from "@/components/landing-photo";
import { createClient } from "@/lib/supabase/client";
import { LANDING_IMAGES } from "@/lib/landing-images";

const inputBase =
  "h-13 w-full rounded-full border border-input bg-background px-5 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20";
const iconChip =
  "pointer-events-none absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-accent";
const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const ringOnGreen =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#17402E]";

// ---------- Brand panel content ----------

const ART: Record<"login" | "signup", { photo: keyof typeof LANDING_IMAGES; alt: string }> = {
  login: { photo: "pilau", alt: "Beef pilau, spiced rice with tender beef" },
  signup: { photo: "nyamaChoma", alt: "Charcoal-grilled beef with kachumbari" },
};

const STEPS = [
  { title: "Set your budget", text: "Pick what you can spend and how much time you have." },
  { title: "Choose a meal", text: "Browse real Kenyan meals with cost estimates." },
  { title: "Plan, shop and cook", text: "Add it to your week, then cook step by step." },
];

function BrandPanel({
  variant,
  headline,
  text,
}: {
  variant: "login" | "signup";
  headline: string;
  text: string;
}) {
  const art = ART[variant];

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-[100dvh] lg:self-start lg:p-4">
      {/* Inset rounded panel: a full food photo under a green-to-dark fade, so the text always reads. */}
      <div className="relative isolate flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[2rem] bg-[#0F2E21] p-8 text-white shadow-2xl ring-1 ring-black/5 xl:p-10">
        <Photo
          srcs={LANDING_IMAGES[art.photo]}
          alt={art.alt}
          className="absolute inset-0 -z-20 size-full object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-[#1F5A40]/45 via-[#12301F]/60 to-[#0B2218]/95"
        />
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-highlight/25 blur-3xl" />

        <Link
          href="/"
          aria-label="Chakula home"
          className={`relative flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-4 backdrop-blur-md ${ringOnGreen}`}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#D8F3E4] text-[#14432E]">
            <ChefHat className="size-[18px]" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Chakula</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md font-serif text-4xl leading-[1.05] tracking-tight xl:text-5xl">{headline}</h2>
          <p className="mt-3 max-w-md leading-7 text-white/80">{text}</p>

          <ol className="relative mt-6 grid gap-3 pl-7">
            <span aria-hidden className="absolute bottom-6 left-[7px] top-6 w-px bg-white/25" />
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <span
                  aria-hidden
                  className="absolute -left-7 top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-white/50 bg-[#0F2E21]"
                />
                <p className="text-sm font-bold">
                  <span className="mr-2 font-serif italic text-highlight">0{index + 1}</span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-white/70 [@media(max-height:780px)]:hidden">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}

/** Soft line-art food doodles around the form card (wide screens only). */
function Doodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden sm:block lg:hidden xl:block">
      <Soup className="absolute left-[6%] top-[16%] size-14 -rotate-12 text-primary/20" strokeWidth={1.25} />
      <Salad className="absolute right-[7%] top-[24%] size-16 rotate-12 text-primary/20" strokeWidth={1.25} />
      <Wheat className="absolute bottom-[24%] left-[5%] size-14 rotate-[18deg] text-primary/20" strokeWidth={1.25} />
      <Carrot className="absolute bottom-[12%] right-[8%] size-14 -rotate-12 text-primary/20" strokeWidth={1.25} />
      <Cookie className="absolute left-[4%] top-[48%] size-10 rotate-6 text-primary/15" strokeWidth={1.25} />
      <Leaf className="absolute bottom-[7%] left-[34%] size-10 -rotate-45 text-primary/20" strokeWidth={1.25} />
      <Heart className="absolute right-[30%] top-[9%] size-7 rotate-12 text-warm/40" strokeWidth={1.5} />
    </div>
  );
}

export function AuthShell({
  variant,
  headline,
  text,
  children,
}: {
  variant: "login" | "signup";
  headline: string;
  text: string;
  children: ReactNode;
}) {
  return (
    // Locked to screen height, hiding overflow.
    <main className="h-[100dvh] overflow-hidden bg-background text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel variant={variant} headline={headline} text={text} />

      {/* Form side */}
      <section className="relative isolate flex h-[100dvh] flex-col overflow-hidden px-3 pb-4 pt-4 sm:px-8 lg:px-12">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_oklab,var(--primary)_16%,transparent)_1.2px,transparent_1.2px)] bg-size-[26px_26px]"
        />
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-80 rounded-full bg-highlight/25 blur-3xl" />
        <div aria-hidden className="absolute -bottom-28 -left-24 -z-10 size-80 rounded-full bg-primary/10 blur-3xl" />
        <Doodles />

        <div className="flex shrink-0 items-center justify-between">
          <Link
            href="/"
            className={`inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card/80 px-4 text-sm font-semibold text-muted-foreground backdrop-blur transition-colors hover:text-foreground ${ring}`}
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link href="/" aria-label="Chakula home" className={`flex items-center gap-2 rounded-full lg:hidden ${ring}`}>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ChefHat className="size-[18px]" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Chakula</span>
          </Link>
        </div>

        {/* Reduced py-12 to py-4 to remove vertical scrolling */}
        <div className="flex min-h-0 flex-1 items-center justify-center py-4">
          <div className="relative isolate w-full max-w-md">
            <div aria-hidden className="absolute -right-5 -top-5 -z-10 size-40 rotate-12 rounded-[2.5rem] bg-highlight/70" />
            <div aria-hidden className="absolute -bottom-6 -left-6 -z-10 size-44 rounded-full bg-primary/15" />

            {/* Reduced padding top/bottom slightly to fit more comfortably */}
            <div className="relative rounded-[2rem] border border-border bg-card px-4 pb-8 pt-10 shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--primary)_55%,transparent)] sm:px-8 sm:pb-9">
              <span
                aria-hidden
                className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background"
              >
                <ChefHat className="size-6" />
              </span>
              {children}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ---------- Form fields ----------

export function TextField({
  id,
  label,
  type,
  ...props
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const Icon = type === "email" ? Mail : id === "name" ? User : null;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span aria-hidden className={iconChip}>
            <Icon className="size-4" />
          </span>
        )}
        <input id={id} type={type} {...props} className={`${inputBase} ${Icon ? "pl-14" : ""}`} />
      </div>
    </div>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <span aria-hidden className={iconChip}>
          <Lock className="size-4" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`${inputBase} pl-14 pr-14`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className={`absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground ${ring}`}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 pl-2 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm ${
        kind === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : kind === "info"
            ? "border-border bg-secondary text-foreground"
            : "border-accent/30 bg-accent/5 text-foreground"
      }`}
    >
      {children}
    </p>
  );
}

export function SubmitButton({
  loading,
  loadingText,
  children,
}: {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`group inline-flex h-14 w-full items-center justify-between gap-3 rounded-full bg-primary pl-12 pr-2 text-sm font-bold text-primary-foreground transition hover:opacity-95 disabled:opacity-60 ${ring} focus-visible:ring-offset-2 focus-visible:ring-offset-card`}
    >
      <span className="flex-1 text-center">{loading ? loadingText : children}</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-highlight text-highlight-foreground transition group-hover:translate-x-0.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      </span>
    </button>
  );
}

// ---------- Optional sign-in helpers ----------

/** True only when NEXT_PUBLIC_GOOGLE_AUTH_ENABLED is "true" (set it after Google is enabled in Supabase). */
export const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function GoogleButton({
  label,
  onError,
}: {
  label: string;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  if (!googleEnabled) return null;

  async function start() {
    setLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setLoading(false);
      onError("Google sign-in is not available right now. Please use your email.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={`inline-flex h-13 w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 text-sm font-semibold transition hover:bg-secondary disabled:opacity-60 ${ring}`}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 48 48" aria-hidden className="size-5">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        {loading ? "Opening Google…" : label}
      </button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}