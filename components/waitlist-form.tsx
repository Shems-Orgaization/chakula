// components/waitlist-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2, MessageCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

interface WaitlistFormProps {
  source: string;
  brand: string;
}

export function WaitlistForm({ source, brand }: WaitlistFormProps) {
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState(""); // honeypot, must stay empty
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const inputId = `waitlist-${source}`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, source, company }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (response.ok || response.status === 409) {
        setStatus("success");
        return;
      }

      setStatus("error");
      setMessage(payload.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("No connection. Check your internet and try again.");
    }
  };

  if (status === "success") {
    const shareText = `${brand} tells you what to cook for your budget. Join the waitlist: ${window.location.origin}`;
    const shareHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    return (
      <div role="status" className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-5 text-left text-primary-foreground">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Check className="size-5" />
          </span>
          <div>
            <p className="font-semibold">You&apos;re on the list.</p>
            <p className="mt-1 text-sm leading-6 text-primary-foreground/80">
              We&apos;ll contact you when {brand} launches. Know someone who always asks what to cook? Send it to them.
            </p>
            <a
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-background px-4 text-sm font-semibold text-foreground transition hover:opacity-90"
            >
              <MessageCircle className="size-4" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            Email or phone number
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="Email or phone number"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? `${inputId}-error` : undefined}
            className="h-12 w-full rounded-xl border border-primary-foreground/20 bg-background px-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <button
          type="submit"
          disabled={status === "loading" || contact.trim() === ""}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <p
        id={`${inputId}-error`}
        role="alert"
        className="mt-2 min-h-5 text-sm text-red-400"
      >
        {status === "error" ? message : ""}
      </p>
      <p className="text-xs text-primary-foreground/60 text-left">
        Free to join. We&apos;ll only contact you about the launch.
      </p>
    </form>
  );
}