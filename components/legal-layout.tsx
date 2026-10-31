// components/legal-layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/" className="text-sm font-semibold text-accent hover:underline">
        ← Back to {LEGAL.appName}
      </Link>
      <h1 className="section-title mt-6">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LEGAL.lastUpdated}</p>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}