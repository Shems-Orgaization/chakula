// components/landing-hero-visual.tsx
"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Clock3, Utensils, Wallet } from "lucide-react";

import { Photo } from "@/components/landing-photo";
import { LANDING_IMAGES } from "@/lib/landing-images";
import { PREVIEW } from "@/lib/landing-shared";

function Float({
  children,
  className,
  delay = 0,
  duration = 5,
  amp = 10,
  rotate = 4,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amp?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amp, 0], rotate: [0, rotate, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

const badge =
  "flex size-14 items-center justify-center rounded-full bg-card p-2.5 shadow-xl ring-4 ring-white/20 sm:size-[4.5rem] sm:p-3";

function Tomato() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="size-full">
      <circle cx="32" cy="37" r="22" fill="#E8573F" />
      <ellipse cx="23" cy="29" rx="6" ry="3.5" fill="#fff" opacity=".35" transform="rotate(-30 23 29)" />
      <path d="M32 14L26 21L17 19L24 26L21 33L30 29L32 36L36 28L45 31L40 24L47 18L38 20Z" fill="#3FA45B" />
    </svg>
  );
}

function Chapati() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="size-full">
      <ellipse cx="32" cy="42" rx="27" ry="10" fill="#C98A2E" />
      <ellipse cx="32" cy="36" rx="27" ry="10" fill="#E9B456" />
      <ellipse cx="32" cy="30" rx="27" ry="10" fill="#F6CF7A" />
      <g fill="#D99A3A">
        <circle cx="22" cy="29" r="2.6" /><circle cx="36" cy="32" r="3" /><circle cx="44" cy="27" r="2.2" /><circle cx="30" cy="25" r="2" />
      </g>
    </svg>
  );
}

function Chai() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="size-full">
      <g stroke="#9AA79E" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".8">
        <path d="M22 14c-3-3 3-5 0-9" /><path d="M32 14c-3-3 3-5 0-9" />
      </g>
      <path d="M10 22h38v12a16 16 0 0 1-16 16h-6A16 16 0 0 1 10 34z" fill="#F6EBD0" stroke="#245C43" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="29" cy="22" rx="19" ry="4" fill="#B9743A" />
      <path d="M48 27h3a6 6 0 0 1 0 12h-5" stroke="#245C43" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <ellipse cx="29" cy="55" rx="20" ry="3" fill="#245C43" opacity=".25" />
    </svg>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mb-8 aspect-[4/5] sm:aspect-square lg:mb-0 lg:aspect-auto lg:min-h-[540px]">
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-primary sm:rounded-[2rem]">
        <div aria-hidden className="absolute -left-24 -top-24 size-72 rounded-full border-[36px] border-white/5" />
        <div aria-hidden className="absolute -bottom-32 -right-20 size-80 rounded-full border-[44px] border-white/5" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square w-[74%] max-w-[440px] overflow-hidden rounded-full bg-white/10 shadow-2xl ring-[10px] ring-white/15">
            <Utensils
              aria-hidden
              className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-white/30"
            />
            <Photo
              srcs={LANDING_IMAGES.hero}
              alt="Charcoal-grilled nyama choma with kachumbari"
              priority
              className="absolute inset-0 size-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* Floating shots */}
      <Float className="absolute left-[3%] top-[27%]" duration={5.5} amp={12} rotate={-6}>
        <div className={badge}><Tomato /></div>
      </Float>
      <Float className="absolute right-[4%] top-[9%]" duration={6.5} delay={0.8} amp={10} rotate={5}>
        <div className={badge}><Chai /></div>
      </Float>
      <Float className="absolute bottom-[24%] right-[5%]" duration={6} delay={1.4} amp={11} rotate={-5}>
        <div className={badge}><Chapati /></div>
      </Float>

      {/* Info chips */}
      <div className="absolute left-3 top-4 flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-xs font-semibold text-card-foreground shadow-lg sm:left-6 sm:top-7 sm:text-sm">
        <span className="size-2.5 rounded-full bg-highlight" />
        Nyama Choma
        <span className="text-muted-foreground">· KES 270–380</span>
      </div>

      <div className="absolute right-3 top-[50%] flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-xs font-semibold text-card-foreground shadow-lg sm:right-6 sm:text-sm">
        <Clock3 className="size-3.5 text-primary" />
        60 min
      </div>

      <Float className="absolute -bottom-6 left-3 sm:-left-6" duration={7} amp={6} rotate={0}>
        <div className="w-[230px] rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xl sm:w-[275px] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Your meal budget</p>
              <p className="mt-1 text-2xl font-extrabold text-primary sm:text-3xl">KES 200</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
              <Wallet className="size-5" />
            </span>
          </div>
          <ul className="mt-3 grid gap-2.5 border-t border-border pt-3">
            {PREVIEW.map((meal) => (
              <li key={meal.name} className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold sm:text-sm">{meal.name}</span>
                <span className="shrink-0 rounded-full bg-highlight px-2 py-0.5 text-[11px] font-bold text-highlight-foreground">
                  {meal.cost}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Float>
    </div>
  );
}