// components/landing-navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChefHat, Menu, X } from "lucide-react";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#meals", label: "Meals" },
  { href: "#faq", label: "FAQ" },
];

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid
          ? "border-border bg-background/90 text-foreground backdrop-blur"
          : "border-transparent text-white"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Chakula home" className={`flex items-center gap-2.5 rounded-lg ${focus}`}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <ChefHat className="size-5" />
          </span>
          <span className="font-serif text-2xl leading-none">Chakula</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${focus} ${
                  solid
                    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/login"
            className={`inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${focus} ${
              solid ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/10"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 ${focus}`}
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className={`flex size-11 items-center justify-center rounded-lg transition-colors lg:hidden ${focus} ${
            solid ? "hover:bg-secondary" : "hover:bg-white/10"
          }`}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background px-5 pb-6 pt-3 text-foreground lg:hidden">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center rounded-lg px-2 text-base font-medium hover:bg-secondary"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 border-t border-border pt-5">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold hover:bg-secondary"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}