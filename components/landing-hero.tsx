// components/landing-hero.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Calendar, Heart, Leaf, Play, Wallet } from "lucide-react";

import { Photo } from "@/components/landing-photo";
import { CountUp, Parallax } from "@/components/landing-motion";
import { LANDING_IMAGES } from "@/lib/landing-images";
import { WRAP } from "@/lib/landing-shared";

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

const svg = "size-full drop-shadow-xl";

const Tomato = () => (
  <svg viewBox="0 0 64 64" aria-hidden className={svg}>
    <circle cx="32" cy="37" r="22" fill="#E8573F" />
    <ellipse cx="23" cy="29" rx="6" ry="3.5" fill="#fff" opacity=".35" transform="rotate(-30 23 29)" />
    <path d="M32 14L26 21L17 19L24 26L21 33L30 29L32 36L36 28L45 31L40 24L47 18L38 20Z" fill="#3FA45B" />
  </svg>
);

const Avocado = () => (
  <svg viewBox="0 0 88 98" aria-hidden className={svg}>
    <path d="M44 4C30 4 22 24 14 42C4 66 18 90 44 90C70 90 84 66 74 42C66 24 58 4 44 4Z" fill="#2E7D4A" />
    <path d="M44 12C34 12 28 28 22 44C15 62 26 82 44 82C62 82 73 62 66 44C60 28 54 12 44 12Z" fill="#D5EB8E" />
    <circle cx="44" cy="60" r="15" fill="#9A6238" />
    <ellipse cx="39" cy="55" rx="5" ry="3.5" fill="#fff" opacity=".35" />
  </svg>
);

const LeafArt = () => (
  <svg viewBox="0 0 60 40" aria-hidden className={svg}>
    <path d="M0 30C4 8 20 0 40 0C38 20 24 34 0 30Z" fill="#8FD36A" />
    <path d="M2 28L32 6" stroke="#2F8F55" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const Chapati = () => (
  <svg viewBox="0 0 64 64" aria-hidden className={svg}>
    <ellipse cx="32" cy="42" rx="27" ry="10" fill="#C98A2E" />
    <ellipse cx="32" cy="36" rx="27" ry="10" fill="#E9B456" />
    <ellipse cx="32" cy="30" rx="27" ry="10" fill="#F6CF7A" />
    <g fill="#D99A3A"><circle cx="22" cy="29" r="2.6" /><circle cx="36" cy="32" r="3" /><circle cx="44" cy="27" r="2.2" /></g>
  </svg>
);

const Chai = () => (
  <svg viewBox="0 0 64 64" aria-hidden className={svg}>
    <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7"><path d="M22 14c-3-3 3-5 0-9" /><path d="M32 14c-3-3 3-5 0-9" /></g>
    <path d="M10 22h38v12a16 16 0 0 1-16 16h-6A16 16 0 0 1 10 34z" fill="#F6EBD0" stroke="#245C43" strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="29" cy="22" rx="19" ry="4" fill="#B9743A" />
    <path d="M48 27h3a6 6 0 0 1 0 12h-5" stroke="#F6EBD0" strokeWidth="3.5" strokeLinecap="round" fill="none" />
  </svg>
);

const BUDGET_ARCS = [
  { label: "Staples", value: "KES 40", len: 50.3, off: 0, color: "#245C43", dot: "bg-primary" },
  { label: "Veggies", value: "KES 25", len: 31.4, off: 50.3, color: "#F2C14E", dot: "bg-highlight" },
  { label: "Protein", value: "KES 15", len: 18.8, off: 81.7, color: "#E87952", dot: "bg-warm" },
];

const STATS = [
  { icon: Leaf, label: "Kenyan recipes", value: <CountUp to={110} suffix="+" /> },
  { icon: Wallet, label: "Budget tiers", value: "KES 100–500" },
  { icon: Calendar, label: "Meal planner", value: "7 days" },
];

const PLAN_INTERVAL_MS = 30000;

const PLAN_SLIDES = [
  { name: "Beef Pilau", time: "75 mins", cost: "KES 250–340", img: LANDING_IMAGES.pilau, alt: "Beef pilau" },
  { name: "Chapati & Ndengu", time: "65 mins", cost: "KES 130–200", img: LANDING_IMAGES.chapatiMeat, alt: "Chapati with green gram stew" },
  { name: "Nyama Choma", time: "60 mins", cost: "KES 270–380", img: LANDING_IMAGES.nyamaChoma, alt: "Charcoal-grilled beef with kachumbari" },
  { name: "Coconut Tilapia Stew", time: "40 mins", cost: "KES 250–360", img: LANDING_IMAGES.fishStew, alt: "Tilapia simmered in coconut sauce" },
  { name: "Mukimo & Beef Stew", time: "90 mins", cost: "KES 295–415", img: LANDING_IMAGES.mukimoBeef, alt: "Mukimo served with beef stew" },
  { name: "Golden Chips", time: "30 mins", cost: "KES 150–220", img: LANDING_IMAGES.chips, alt: "Golden chips set into a fluffy omelette" },
  { name: "Spiced Biryani", time: "95 mins", cost: "KES 270–370", img: LANDING_IMAGES.biryani, alt: "Layered biryani with spiced beef" },
  { name: "Swahili Coconut Rice", time: "30 mins", cost: "KES 90–130", img: LANDING_IMAGES.coconutRice, alt: "Fragrant coconut rice" },
];

/** "Today's plan" card. Same design as before; the meal rotates every 30 seconds and pauses on hover or focus. */
function TodaysPlanCard() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % PLAN_SLIDES.length),
      PLAN_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [paused]);

  const meal = PLAN_SLIDES[index];

  return (
    <div
      className="rounded-3xl bg-card p-5 text-card-foreground shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-start justify-between">
        <p className="text-lg font-extrabold tracking-tight">Today&apos;s plan</p>
        <Heart className="size-5 text-warm" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={meal.name}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="mt-0.5 truncate text-sm text-muted-foreground"
        >
          {meal.name} · {meal.time}
        </motion.p>
      </AnimatePresence>
      <div className="relative mt-4 aspect-16/10 overflow-hidden rounded-2xl bg-secondary">
        <AnimatePresence initial={false}>
          <motion.div
            key={meal.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.7 }}
            className="absolute inset-0"
          >
            <Photo srcs={meal.img} alt={meal.alt} className="absolute inset-0 size-full object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <a
          href="#meals"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          View recipe <ArrowRight className="size-4" />
        </a>
        <span className="rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">
          {meal.cost}
        </span>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="relative isolate overflow-hidden bg-linear-to-br from-[#17402E] via-[#1F5A40] to-[#2A7352] text-white">
      {/* texture, ghost word, soft leaves */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.10] bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-size-[24px_24px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-20 -z-10 select-none text-center text-[clamp(5rem,17vw,17rem)] font-black leading-none tracking-tight text-white/[0.07] sm:top-24"
      >
        CHAKULA
      </span>
      <div aria-hidden className="absolute -bottom-10 -left-10 -z-10 h-56 w-40 rotate-25 rounded-[100%_0] bg-[#5CC08F]/30 blur-xl" />
      <div aria-hidden className="absolute -right-10 top-10 -z-10 h-48 w-36 rotate-[-20deg] rounded-[100%_0] bg-[#5CC08F]/20 blur-xl" />

      <div className={WRAP}>
        {/* The extra top padding clears the floating navbar, which now sits on top of this band. */}
        <div className="grid items-center gap-12 pb-12 pt-32 sm:pb-16 sm:pt-40 lg:grid-cols-[1fr_1.05fr_.72fr] lg:gap-6 lg:pb-20 lg:pt-44 xl:min-h-170">
          {/* LEFT: copy */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#D8F3E4] px-3.5 py-1.5 text-xs font-bold text-[#14432E]">
              <Leaf className="size-3.5" />
              Made for Kenyan budgets
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
              Good food for
              <span className="block text-[#5CC08F]">every shilling.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-white/80 sm:text-lg">
              Tell Chakula what you can spend. Get familiar Kenyan meals that fit, plan your week, shop smarter and
              cook step by step.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex h-14 items-center gap-4 rounded-full bg-[#0F2E21] pl-7 pr-2 text-sm font-bold text-white transition hover:bg-[#0B2218] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F5A40]"
              >
                Get started
                <span className="flex size-10 items-center justify-center rounded-full bg-[#3FA06F] transition group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" />
                </span>
              </Link>

              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-3 text-sm font-semibold text-white/90 transition hover:text-white"
              >
                <span className="flex size-14 items-center justify-center rounded-full border border-white/40 transition group-hover:bg-white/10">
                  <Play className="size-4 fill-current" />
                </span>
                See how it works
              </a>
            </div>

            <ul className="mt-12 grid max-w-md grid-cols-3 gap-4">
              {STATS.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 size-6 shrink-0 text-[#5CC08F]" />
                  <div>
                    <p className="text-sm font-extrabold leading-tight sm:text-base">{value}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-white/70">{label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CENTER: hero plate + floating food */}
          <Parallax distance={22} className="relative mx-auto w-full max-w-140">
            <div className="relative aspect-square">
              <div className="absolute inset-[7%] overflow-hidden rounded-full bg-white/10 shadow-2xl ring-14 ring-white/10">
                <Photo
                  srcs={LANDING_IMAGES.hero}
                  alt="Charcoal-grilled nyama choma with kachumbari"
                  priority
                  className="absolute inset-0 size-full object-cover object-center"
                />
              </div>

              <Float className="absolute left-[1%] top-[20%] size-16 sm:size-20" duration={5.5} amp={12} rotate={-8}><Tomato /></Float>
              <Float className="absolute bottom-[12%] right-[6%] size-12 sm:size-14" duration={6} delay={1} amp={10} rotate={8}><Tomato /></Float>
              <Float className="absolute right-[-1%] top-[6%] size-20 sm:size-24" duration={6.5} delay={0.6} amp={10} rotate={6}><Avocado /></Float>
              <Float className="absolute left-[12%] top-[0%] h-9 w-14 sm:h-11 sm:w-16" duration={7} delay={1.2} amp={8} rotate={-10}><LeafArt /></Float>
              <Float className="absolute bottom-[22%] left-[0%] h-10 w-16 sm:h-12 sm:w-20" duration={6} delay={2} amp={9} rotate={10}><LeafArt /></Float>
              <Float className="absolute bottom-[2%] left-[14%] size-16 sm:size-20" duration={6.5} delay={0.4} amp={9} rotate={-6}><Chapati /></Float>
              <Float className="absolute bottom-[-1%] right-[30%] size-14 sm:size-16" duration={5.8} delay={1.6} amp={9} rotate={5}><Chai /></Float>
            </div>
          </Parallax>

          {/* RIGHT: app cards */}
          <div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Float duration={7} amp={6} rotate={0}>
              <TodaysPlanCard />
            </Float>

            <Float duration={8} delay={1} amp={6} rotate={0}>
              <div className="rounded-3xl bg-card p-5 text-card-foreground shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-extrabold tracking-tight">Track your budget</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">Stay on top of your day</p>
                  </div>
                  <Wallet className="size-5 text-primary" />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative size-28 shrink-0">
                    <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
                      <circle cx="50" cy="50" r="40" fill="none" strokeWidth="11" className="stroke-secondary" />
                      {BUDGET_ARCS.map((a) => (
                        <circle
                          key={a.label}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={a.color}
                          strokeWidth="11"
                          strokeDasharray={`${a.len} ${251.3 - a.len}`}
                          strokeDashoffset={-a.off}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold leading-none">120</span>
                      <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground">KES left</span>
                    </div>
                  </div>
                  <ul className="grid gap-2 text-xs font-semibold">
                    {BUDGET_ARCS.map((a) => (
                      <li key={a.label} className="flex items-center gap-2">
                        <span className={`size-2.5 rounded-full ${a.dot}`} />
                        <span className="text-muted-foreground">{a.label}</span>
                        <span className="ml-auto pl-2">{a.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Float>
          </div>
        </div>
      </div>
    </div>
  );
}