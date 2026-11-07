// components/landing-navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChefHat, Menu, X } from "lucide-react";

import { NAV_LINKS, WRAP } from "@/lib/landing-shared";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  // The header is a zero-height sticky wrapper. It reserves no strip of its own,
  // so the hero's full-bleed green runs behind the floating pill, and the pill
  // keeps floating over every other section while you scroll.
  return (
    <header className="sticky top-0 z-50 h-0">
      <div className={`${WRAP} pt-3 sm:pt-4`}>
        <nav
          aria-label="Main"
          className={`flex h-14 items-center justify-between rounded-full border border-border bg-card/90 pl-4 pr-2 backdrop-blur transition-shadow duration-300 sm:h-16 sm:pl-6 ${
            scrolled || open ? "shadow-lg" : "shadow-sm"
          }`}
        >
          <Link href="/" aria-label="Chakula home" className={`flex items-center gap-2.5 rounded-full ${focus}`}>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ChefHat className="size-[18px]" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Chakula</span>
          </Link>

          <ul className="hidden items-center gap-1 rounded-full bg-secondary/70 p-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-card ${focus}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className={`hidden h-10 items-center rounded-full px-4 text-sm font-semibold transition hover:bg-secondary sm:inline-flex ${focus}`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={`inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:px-5 ${focus}`}
            >
              Get started
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`flex size-10 items-center justify-center rounded-full transition hover:bg-secondary md:hidden ${focus}`}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            id="mobile-menu"
            className="mt-2 rounded-3xl border border-border bg-card p-3 shadow-xl md:hidden"
          >
            <ul className="grid">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex h-12 items-center rounded-2xl px-4 text-base font-semibold transition hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex h-12 items-center justify-center rounded-full border border-border text-sm font-semibold transition hover:bg-secondary"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}