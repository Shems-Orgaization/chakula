// components/views/detail-cook-mode.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { type Recipe } from "@/lib/recipes";

export function DetailCookMode({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const last = recipe.instructions.length - 1;

  // Keep the screen awake (floury hands).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      } catch {}
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };
    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, []);

  // Keyboard: arrows move, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, last));
      else if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Cook mode: ${recipe.name}`} className="fixed inset-0 z-[70] flex flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border p-5">
        <div>
          <p className="eyebrow">Cook mode</p>
          <h2 className="font-serif text-2xl">{recipe.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close cook mode" className="rounded-lg p-2 transition hover:bg-secondary">
          <X className="size-5" />
        </button>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8 text-center">
        <div className="max-w-2xl">
          <span className="font-serif text-8xl text-accent/30">{String(step + 1).padStart(2, "0")}</span>
          <p className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">{recipe.instructions[step] ?? ""}</p>
          <p className="mt-5 text-muted-foreground">
            Step {step + 1} of {recipe.instructions.length}
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-border p-5">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="rounded-full border border-border px-6 py-3 font-semibold transition hover:bg-secondary disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => (step >= last ? onClose() : setStep((s) => s + 1))}
          className="rounded-full bg-accent px-8 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
        >
          {step >= last ? "Done" : "Next"}
        </button>
      </footer>
    </div>
  );
}