// components/auth-shell.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  ArrowLeft, Check, ChefHat, Clock3, Eye, EyeOff, Loader2,
  Moon, Sun, Utensils, Wallet,
} from "lucide-react";

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-2 focus:ring-accent/20";
const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const card = "rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl";

const MEALS = [
  { name: "Ugali & Sukuma Wiki", cost: "KES 65–110", time: "28 min" },
  { name: "Rice & Beans", cost: "KES 90–140", time: "80 min" },
  { name: "Ugali & Omena", cost: "KES 130–200", time: "35 min" },
];

const WEEK = [
  { day: "Mon", slot: "Dinner", icon: Moon, name: "Ugali & Sukuma Wiki" },
  { day: "Tue", slot: "Lunch", icon: Sun, name: "Rice & Beans" },
  { day: "Wed", slot: "Dinner", icon: Moon, name: "Ugali & Omena" },
];

const LIST = [
  { name: "Sukuma wiki", done: true },
  { name: "Tomato", done: true },
  { name: "Onion", done: false },
  { name: "Beans", done: false },
];

function ExampleTag() {
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Example
    </span>
  );
}

function LoginShowcase() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className={`${card} relative z-10 w-[88%]`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="size-4 text-accent" />
            Nina KES
          </p>
          <ExampleTag />
        </div>
        <p className="mt-3 font-serif text-5xl leading-none">250</p>
        <p className="mt-2 text-xs text-muted-foreground">Showing meals under KES 250</p>
      </div>
      <div className={`${card} relative z-20 -mt-5 ml-auto w-[94%]`}>
        <p className="text-sm font-semibold">Perfect right now</p>
        <ul className="mt-3 grid gap-2">
          {MEALS.map((m) => (
            <li key={m.name} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-accent">
                <Utensils className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-serif text-base leading-tight">{m.name}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{m.cost}</span>
                  <Clock3 className="size-3" />
                  {m.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SignupShowcase() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className={`${card} relative z-10 w-[94%]`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">This week</p>
          <ExampleTag />
        </div>
        <ul className="mt-3 grid gap-2">
          {WEEK.map(({ day, slot, icon: Icon, name }) => (
            <li key={day} className="flex items-center gap-3 rounded-xl bg-secondary/60 p-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-xs font-semibold text-accent">
                {day}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base leading-tight">{name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3" />
                  {slot}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          Estimated cost
          <span className="text-sm font-semibold text-foreground">KES 450</span>
        </p>
      </div>
      <div className={`${card} relative z-20 -mt-4 ml-auto w-[80%]`}>
        <p className="text-sm font-semibold">Shopping list</p>
        <ul className="mt-3 grid gap-2">
          {LIST.map((item) => (
            <li key={item.name} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  item.done ? "border-accent bg-accent text-accent-foreground" : "border-border"
                }`}
              >
                {item.done && <Check className="size-3" />}
              </span>
              <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Optional photo: put public/auth/login.jpg or public/auth/signup.jpg. If the file is missing nothing shows. */
function PhotoLayer({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <>
      <img
        ref={ref}
        src={src}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
        className={`absolute inset-0 size-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {loaded && <div aria-hidden className="absolute inset-0 bg-primary/75" />}
    </>
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
    <main className="min-h-svh bg-background p-3 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-6xl rounded-3xl border border-border bg-card p-2.5 sm:min-h-[calc(100svh-2.5rem)] sm:p-3 lg:grid-cols-2">
        {/* Showcase panel */}
        <aside className="relative hidden overflow-hidden rounded-2xl bg-primary text-primary-foreground lg:block">
          <PhotoLayer src={`/auth/${variant}.jpg`} />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div aria-hidden className="absolute -right-28 -top-28 size-96 rounded-full border border-primary-foreground/10" />
          <div aria-hidden className="absolute -right-12 -top-12 size-64 rounded-full border border-primary-foreground/10" />

          <div className="relative flex h-full flex-col justify-between gap-10 p-10">
            <Link href="/" className={`flex w-fit items-center gap-2.5 rounded-lg ${ring}`}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ChefHat className="size-5" />
              </span>
              <span className="font-serif text-2xl leading-none">Chakula</span>
            </Link>

            {variant === "login" ? <LoginShowcase /> : <SignupShowcase />}

            <div>
              <h2 className="max-w-md font-serif text-4xl leading-tight tracking-tight">{headline}</h2>
              <p className="mt-4 max-w-md leading-7 text-primary-foreground/80">{text}</p>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex flex-col px-5 py-6 sm:px-12 sm:py-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className={`-ml-2 inline-flex h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${ring}`}
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
            <Link href="/" aria-label="Chakula home" className={`flex items-center gap-2 rounded-lg lg:hidden ${ring}`}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <ChefHat className="size-4" />
              </span>
              <span className="font-serif text-xl leading-none">Chakula</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center">
            <div className="mx-auto w-full max-w-sm py-10">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function TextField({
  id,
  label,
  ...props
}: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input id={id} {...props} className={`mt-2 ${inputBase}`} />
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
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`${inputBase} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className={`absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground ${ring}`}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function FormMessage({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        kind === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
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
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60 ${ring} focus-visible:ring-offset-2`}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
}