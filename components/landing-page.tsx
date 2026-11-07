// components/landing-page.tsx
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChefHat,
  Clock3,
  Flame,
  Heart,
  Home,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

import { Photo } from "@/components/landing-photo";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { BudgetExplorer } from "@/components/landing-budget";
import { Lift, Marquee, MotionProvider, Reveal, ScrollProgress } from "@/components/landing-motion";
import { LANDING_IMAGES } from "@/lib/landing-images";
import { NAV_LINKS, PREVIEW, WRAP } from "@/lib/landing-shared";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const eyebrow = "text-xs font-bold uppercase tracking-[0.2em] text-primary";

const h2 = "mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

const glow =
  "pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100";
const card =
  "group relative isolate h-full overflow-hidden rounded-3xl p-6 transition-[box-shadow,border-color] duration-300 sm:p-8";
const icon = "flex size-11 items-center justify-center rounded-full transition duration-300 group-hover:-rotate-6 group-hover:scale-110";
const SH_PRIMARY = "hover:shadow-[0_28px_60px_-24px_color-mix(in_oklab,var(--primary)_65%,transparent)]";
const SH_GOLD = "hover:shadow-[0_28px_60px_-24px_color-mix(in_oklab,var(--highlight)_90%,transparent)]";
const SH_WARM = "hover:shadow-[0_28px_60px_-24px_color-mix(in_oklab,var(--warm)_70%,transparent)]";

const STEPS = [
  { title: "Set your budget", text: "Pick what you can spend and how much time you have." },
  {
    title: "Choose a meal",
    text: "Browse real Kenyan meals with cost estimates, or match recipes to your pantry.",
  },
  {
    title: "Plan, shop and cook",
    text: "Add it to your week, send ingredients to a shopping list, then cook step by step.",
  },
];

const MEALS = [
  { title: "Coastal Spiced Pilau", dish: "Pilau", cost: "KES 250–340", time: "75 min", img: LANDING_IMAGES.pilau, alt: "Beef pilau, spiced rice with tender beef" },
  { title: "Swahili Coconut Rice", dish: "Wali wa Nazi", cost: "KES 90–130", time: "30 min", img: LANDING_IMAGES.coconutRice, alt: "Fragrant coconut rice" },
  { title: "Charcoal Nyama Choma", dish: "Nyama Choma", cost: "KES 270–380", time: "60 min", img: LANDING_IMAGES.nyamaChoma, alt: "Charcoal-grilled beef with kachumbari" },
  { title: "Coconut Tilapia Stew", dish: "Samaki wa Nazi", cost: "KES 250–360", time: "40 min", img: LANDING_IMAGES.fishStew, alt: "Tilapia simmered in coconut sauce" },
  { title: "Mukimo & Slow Beef Stew", dish: "Mukimo na Nyama", cost: "KES 295–415", time: "90 min", img: LANDING_IMAGES.mukimoBeef, alt: "Mukimo served with beef stew" },
  { title: "Golden Chips", dish: "Chips", cost: "KES 150–220", time: "30 min", img: LANDING_IMAGES.chips, alt: "Golden chips set into a fluffy omelette" },
  { title: "Spiced Coastal Biryani", dish: "Biriani", cost: "KES 270–370", time: "95 min", img: LANDING_IMAGES.biryani, alt: "Layered biryani with spiced beef" },
  { title: "Layered Chapati & Meat", dish: "Chapati na Ndengu", cost: "KES 130–200", time: "65 min", img: LANDING_IMAGES.chapatiMeat, alt: "Soft layered chapati with green gram stew" },
];

const AUDIENCES = [
  { icon: Zap, title: "Students and first-time cooks", text: "One-pot meals, quick cooks and recipes that stretch a small budget." },
  { icon: Heart, title: "Families", text: "Batch-cook stews and leftover-friendly dishes that feed the whole house." },
  { icon: Flame, title: "Home-style and street favourites", text: "Githeri, mukimo, matoke, chips mayai, viazi karai and more." },
];

const DISHES = [
  "Ugali & Sukuma", "Githeri", "Mukimo", "Chips Mayai", "Rolex", "Uji",
  "Rice & Ndengu", "Chapati", "Viazi Karai", "Ugali & Omena", "Matoke", "Mandazi",
];

const FAQ = [
  { q: "Do I need an account?", a: "Yes. An account keeps your favourites, pantry, plans and shopping lists saved. Sign-up takes a minute and you confirm your email." },
  { q: "How accurate are the costs?", a: "Costs are estimates for the ingredients of the whole recipe at Nairobi prices. Gas or charcoal is not included, and prices vary by market and season. Use them to compare meals and plan a budget, not as a receipt." },
  { q: "Can I add my own recipes?", a: "Yes. Create personal recipes, group them into collections and log every time you cook." },
  { q: "Does it work on my phone?", a: "Yes. Chakula is built to work on phones, tablets and laptops." },
  { q: "Are the recipes checked for allergies?", a: "Not yet. Please read the ingredients before you cook if you have an allergy." },
];

const PHONE_NAV = [
  { label: "Home", icon: Home, active: true },
  { label: "Explore", icon: Search, active: false },
  { label: "Planner", icon: Calendar, active: false },
  { label: "Shopping", icon: ShoppingBag, active: false },
  { label: "Meals", icon: Utensils, active: false },
];

function PhoneMockup() {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-[9/19] w-full max-w-[270px] rounded-[2.6rem] border-[7px] border-[#07120D] bg-[#0C1913] shadow-2xl ring-1 ring-white/20"
    >
      {/* notch */}
      <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#07120D]" />

      <div className="absolute inset-0 overflow-hidden rounded-[2.1rem] text-white">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-2.5 text-[9px] font-semibold text-white/80">
          <span>9:41</span>
          <span className="size-1.5 rounded-full bg-white/60" />
        </div>

        {/* app header */}
        <div className="mt-3 flex items-center justify-between px-4">
          <span className="font-serif text-lg font-semibold text-[#3FA06F]">Chakula</span>
          <div className="flex items-center gap-1.5">
            <span className="flex size-6 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <Search className="size-3" />
            </span>
            <span className="flex size-6 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <Bell className="size-3" />
            </span>
            <span className="flex size-6 items-center justify-center rounded-full bg-[#2A7352] text-[10px] font-bold">
              S
            </span>
          </div>
        </div>

        {/* greeting card */}
        <div className="mx-3 mt-3 rounded-2xl bg-linear-to-br from-[#14432E] to-[#1F5A40] p-3.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-semibold">
            <Sparkles className="size-2.5" />
            Good afternoon
          </span>
          <p className="mt-2 text-[17px] font-extrabold leading-[1.1] tracking-tight">
            What&apos;s cooking
            <span className="block text-highlight">today?</span>
          </p>
          <p className="mt-1.5 max-w-[150px] text-[8px] leading-snug text-white/75">
            Familiar, affordable and easy to make. Find your next meal.
          </p>
          <span className="mt-2.5 inline-flex h-7 items-center gap-1 rounded-full bg-highlight px-3 text-[10px] font-bold text-highlight-foreground">
            <Sparkles className="size-3" />
            Surprise me
          </span>
        </div>

        {/* meals you can make */}
        <p className="mt-3.5 px-4 font-serif text-[15px] leading-none">Meals you can make</p>
        <p className="mt-1 px-4 text-[8px] text-highlight/80">Based on the time of day, your pantry and your budget.</p>

        <div className="mx-3 mt-2.5 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1.5 text-[9px] font-semibold">
          <span className="rounded-lg bg-white/10 px-2 py-1">KES 250</span>
          <span className="px-1.5 text-white/60">100</span>
          <span className="px-1.5 text-white/60">200</span>
          <span className="px-1.5 text-white/60">300</span>
        </div>

        {/* meal card */}
        <div className="mx-3 mt-2.5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-16/9 bg-[#12302A]">
            <Photo srcs={LANDING_IMAGES.pilau} alt="" className="absolute inset-0 size-full object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[8px] font-semibold">
              Lunch
            </span>
            <span className="absolute right-2 top-2 rounded-full bg-highlight px-2 py-0.5 text-[8px] font-bold text-highlight-foreground">
              KES 250–340
            </span>
          </div>
          <div className="px-3 py-2">
            <p className="text-[10px] font-bold">Coastal Spiced Pilau</p>
            <p className="text-[8px] text-white/60">75 min</p>
          </div>
        </div>

        {/* bottom nav */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-white/10 bg-[#0A1510]/95 px-1 pb-3 pt-2 backdrop-blur">
          {PHONE_NAV.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-0.5 text-[7px] font-semibold ${
                active ? "text-white" : "text-white/50"
              }`}
            >
              <Icon className={`size-3.5 ${active ? "text-[#3FA06F]" : ""}`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="force-light min-h-screen overflow-x-clip bg-background text-foreground bg-[radial-gradient(color-mix(in_oklab,var(--primary)_16%,transparent)_1.2px,transparent_1.2px)] bg-size-[26px_26px]">
      <MotionProvider>
        <ScrollProgress />
        <LandingNavbar />

        <main>
          {/* HERO (full-bleed, starts at the very top so the green sits behind the navbar) */}
          <section>
            <LandingHero />
          </section>

          {/* DISH MARQUEE */}
          <div className="border-y border-border bg-card py-5">
            <Marquee items={MEALS.map((m) => ({ name: m.dish, cost: m.cost, srcs: m.img }))} />
          </div>

          {/* BUDGET */}
          <section id="budget" className="scroll-mt-28 border-y border-border bg-secondary/70 py-14 sm:py-20">
            <div className={WRAP}>
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="max-w-2xl">
                    <p className={eyebrow}>Start with your pocket</p>
                    <h2 className={h2}>How much do you have today?</h2>
                  </div>
                  <p className="max-w-sm text-base leading-7 text-muted-foreground">
                    Tap a budget to preview the kind of meals that fit. No scrolling through dishes you cannot
                    afford.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <BudgetExplorer />
              </Reveal>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="scroll-mt-28 py-14 sm:py-20">
            <div className={WRAP}>
              <Reveal>
                <div className="max-w-3xl">
                  <p className={eyebrow}>What you get</p>
                  <h2 className={h2}>
                    Everything between &ldquo;what&rsquo;s for dinner?&rdquo; and a clean plate.
                  </h2>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                <Reveal className="lg:col-span-2">
                  <Lift className="h-full">
                    <article
                      className={`${card} ${SH_GOLD} grid gap-6 bg-primary text-primary-foreground md:grid-cols-2 md:items-center`}
                    >
                      <span aria-hidden className={`${glow} bg-linear-to-br from-highlight/30 via-transparent to-white/10`} />
                      <div>
                        <span className={`${icon} bg-highlight text-highlight-foreground`}>
                          <Wallet className="size-5" />
                        </span>
                        <h3 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                          Budget-first discovery
                        </h3>
                        <p className="mt-3 leading-7 text-primary-foreground/80">
                          Filter every meal by what you can spend and how long you have. Start from under KES 100,
                          200 or 300.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-lg">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">Under 100</span>
                          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                            Under 200
                          </span>
                          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">Under 300</span>
                        </div>
                        <ul className="mt-4 grid gap-3">
                          {PREVIEW.map((meal) => (
                            <li key={meal.name} className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{meal.name}</p>
                                <p className="text-xs text-muted-foreground">{meal.time}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground">
                                {meal.cost}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </Lift>
                </Reveal>

                <Reveal delay={0.08}>
                  <Lift className="h-full">
                    <article className={`${card} ${SH_PRIMARY} border border-border bg-card hover:border-primary/40`}>
                      <span aria-hidden className={`${glow} bg-linear-to-br from-secondary via-card to-highlight/25`} />
                      <span className={`${icon} bg-secondary text-primary`}>
                        <Search className="size-5" />
                      </span>
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Pantry match</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        Add what is already in your kitchen. Chakula lists what you have and what is missing.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {["Rice", "Onion", "Tomato"].map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground"
                          >
                            <Check className="size-3.5 text-primary" />
                            {item}
                          </span>
                        ))}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-warm/50 bg-warm/10 px-3 py-1.5 text-xs font-semibold">
                          <Plus className="size-3.5" />
                          Beans
                        </span>
                      </div>
                    </article>
                  </Lift>
                </Reveal>

                <Reveal delay={0.04}>
                  <Lift className="h-full">
                    <article className={`${card} ${SH_PRIMARY} bg-secondary`}>
                      <span aria-hidden className={`${glow} bg-linear-to-br from-primary/20 via-transparent to-highlight/30`} />
                      <span className={`${icon} bg-card text-primary`}>
                        <Calendar className="size-5" />
                      </span>
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-secondary-foreground">
                        Weekly planner
                      </h3>
                      <p className="mt-3 leading-7 text-secondary-foreground/80">
                        Plan breakfast, lunch and dinner across seven days and see the estimated cost of your week.
                      </p>
                      <div className="mt-6 grid grid-cols-7 gap-1.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                          <span
                            key={`${day}-${index}`}
                            className={`flex aspect-square items-center justify-center rounded-full text-xs font-bold ${
                              index === 2 ? "bg-primary text-primary-foreground" : "bg-card text-secondary-foreground"
                            }`}
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </article>
                  </Lift>
                </Reveal>

                <Reveal delay={0.08}>
                  <Lift className="h-full">
                    <article className={`${card} ${SH_WARM} border border-border bg-card hover:border-warm/50`}>
                      <span aria-hidden className={`${glow} bg-linear-to-br from-warm/15 via-card to-highlight/25`} />
                      <span className={`${icon} bg-secondary text-primary`}>
                        <ShoppingBag className="size-5" />
                      </span>
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Shopping lists with budgets</h3>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        Send missing ingredients to a list, add prices and watch the budget bar.
                      </p>
                      <div className="mt-6">
                        <ul className="grid gap-2 text-sm">
                          {[
                            ["Tomatoes", "KES 40"],
                            ["Onions", "KES 20"],
                            ["Cooking oil", "KES 60"],
                          ].map(([name, price]) => (
                            <li key={name} className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className="flex size-4 items-center justify-center rounded border border-border" />
                                {name}
                              </span>
                              <span className="text-muted-foreground">{price}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 h-2 rounded-full bg-secondary">
                          <div className="h-2 w-3/5 rounded-full bg-highlight" />
                        </div>
                        <p className="mt-2 text-xs font-semibold text-muted-foreground">KES 120 of KES 200</p>
                      </div>
                    </article>
                  </Lift>
                </Reveal>

                <Reveal delay={0.12}>
                  <Lift className="h-full">
                    <article className={`${card} ${SH_GOLD} bg-highlight text-highlight-foreground`}>
                      <span aria-hidden className={`${glow} bg-linear-to-br from-white/45 via-transparent to-warm/35`} />
                      <span className={`${icon} bg-highlight-foreground text-highlight`}>
                        <ChefHat className="size-5" />
                      </span>
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Step-by-step cook mode</h3>
                      <p className="mt-3 leading-7 opacity-80">
                        One instruction at a time, full screen, so you can follow along while your hands are busy.
                      </p>
                      <div className="mt-6 rounded-2xl bg-card/70 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Step 3 of 6</p>
                        <p className="mt-2 text-sm font-semibold leading-6">
                          Add the chopped tomatoes and cook for 3 to 4 minutes until they turn saucy.
                        </p>
                      </div>
                    </article>
                  </Lift>
                </Reveal>
              </div>

              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Heart, label: "Save your favourite meals" },
                  { icon: BookOpen, label: "Add your own recipes" },
                  { icon: Utensils, label: "Log every time you cook" },
                ].map(({ icon: Icon, label }, i) => (
                  <li key={label}>
                    <Reveal delay={i * 0.06} y={16}>
                      <div className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                        <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary transition group-hover:scale-110">
                          <Icon className="size-4" />
                        </span>
                        {label}
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how-it-works" className="scroll-mt-28 py-14 sm:py-20">
            <div className={WRAP}>
              <Reveal>
                <div className="grid items-center gap-10 rounded-[2rem] bg-primary p-6 text-primary-foreground sm:rounded-[2.5rem] sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-12">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">How it works</p>
                    <h2 className={h2}>From budget to dinner in three steps.</h2>

                    <ol className="mt-10 grid gap-7">
                      {STEPS.map((step, index) => (
                        <li key={step.title} className="flex gap-5">
                          <span className="font-serif text-4xl italic leading-none text-highlight">0{index + 1}</span>
                          <div>
                            <h3 className="text-xl font-extrabold tracking-tight">{step.title}</h3>
                            <p className="mt-1.5 leading-7 text-primary-foreground/75">{step.text}</p>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <Link
                      href="/login"
                      className={`group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-highlight px-6 text-sm font-semibold text-highlight-foreground transition hover:opacity-90 ${focus}`}
                    >
                      Start planning your meals
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* PHONE UI ILLUSTRATION */}
                  <div className="relative isolate flex items-center justify-center overflow-hidden rounded-3xl bg-secondary/10 px-4 py-10 sm:py-12">
                    <div aria-hidden className="absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-highlight/20 blur-3xl" />
                    <div aria-hidden className="absolute -bottom-20 -left-16 -z-10 size-64 rounded-full bg-white/10 blur-3xl" />
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 opacity-[0.10] bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-size-[22px_22px]"
                    />

                    <PhoneMockup />

                    <div className="absolute left-3 top-[18%] rounded-2xl bg-card px-3.5 py-2.5 text-card-foreground shadow-xl sm:left-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 01</p>
                      <p className="mt-0.5 flex items-center gap-2 text-sm font-extrabold text-primary">
                        KES 200
                        <span className="rounded-full bg-highlight px-2 py-0.5 text-[10px] font-bold text-highlight-foreground">
                          3 meals fit
                        </span>
                      </p>
                    </div>

                    <div className="absolute bottom-[14%] right-3 rounded-2xl bg-card px-3.5 py-2.5 text-card-foreground shadow-xl sm:right-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 03</p>
                      <p className="mt-0.5 flex items-center gap-2 text-sm font-extrabold">
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                        Added to your week
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* MEALS */}
          <section id="meals" className="scroll-mt-28 border-y border-border bg-card py-14 sm:py-20">
            <div className={WRAP}>
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="max-w-2xl">
                    <p className={eyebrow}>A taste of what&apos;s possible</p>
                    <h2 className={h2}>Real meals. Everyday prices.</h2>
                  </div>
                  <Link
                    href="/signup"
                    className={`inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-secondary ${focus}`}
                  >
                    Browse all 110 recipes
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Reveal>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {MEALS.map((meal, i) => (
                  <Reveal key={meal.title} delay={(i % 4) * 0.08} className="min-w-0">
                    <Lift lift={10} className="group">
                      <article>
                        <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-secondary shadow-sm transition-shadow duration-300 group-hover:shadow-[0_28px_60px_-24px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
                          <Utensils
                            aria-hidden
                            className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-primary/25"
                          />
                          <Photo
                            srcs={meal.img}
                            alt={meal.alt}
                            className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <span className="absolute left-3 top-3 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground transition duration-300 group-hover:scale-105">
                            {meal.cost}
                          </span>
                          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold backdrop-blur transition duration-300 group-hover:scale-105">
                            <Clock3 className="size-3.5 text-primary" />
                            {meal.time}
                          </span>
                          <p className="absolute inset-x-4 bottom-4 translate-y-3 font-serif text-2xl italic text-primary-foreground opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                            {meal.dish}
                          </p>
                        </div>

                        <h3 className="mt-4 text-lg font-extrabold leading-tight tracking-tight transition-colors group-hover:text-primary">
                          {meal.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{meal.dish}</p>
                      </article>
                    </Lift>
                  </Reveal>
                ))}
              </div>

              <p className="mt-8 text-xs leading-6 text-muted-foreground">
                Costs are estimates for the ingredients of the whole recipe at Nairobi prices and may vary by market
                and season.
              </p>
            </div>
          </section>

          {/* AUDIENCE + DISHES */}
          <section className="py-14 sm:py-20">
            <div className={WRAP}>
              <Reveal>
                <div className="rounded-[2rem] border border-border bg-card p-6 sm:rounded-[2.5rem] sm:p-10 lg:p-12">
                  <div className="max-w-2xl">
                    <p className={eyebrow}>Made for how Kenya eats</p>
                    <h2 className={h2}>Whether you cook for one or for ten.</h2>
                  </div>

                  <div className="mt-10 grid gap-8 md:grid-cols-3">
                    {AUDIENCES.map(({ icon: Icon, title, text }) => (
                      <article key={title} className="group">
                        <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                          <Icon className="size-5" />
                        </span>
                        <h3 className="mt-5 text-xl font-extrabold tracking-tight">{title}</h3>
                        <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
                      </article>
                    ))}
                  </div>

                  <ul className="mt-10 flex flex-wrap gap-2 border-t border-border pt-8">
                    {DISHES.map((dish, index) => (
                      <li
                        key={dish}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
                          index % 3 === 0
                            ? "bg-secondary text-secondary-foreground"
                            : index % 3 === 1
                              ? "bg-highlight/30 text-foreground"
                              : "border border-border bg-background"
                        }`}
                      >
                        {dish}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-28 border-y border-border bg-secondary/70 py-14 sm:py-20">
            <div className={`${WRAP} grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16`}>
              <Reveal>
                <p className={eyebrow}>Frequently asked questions</p>
                <h2 className={h2}>Good to know.</h2>
                <p className="mt-4 max-w-sm leading-7 text-muted-foreground">
                  A few things you might want to know before getting started.
                </p>
              </Reveal>

              <div className="grid content-start gap-3">
                {FAQ.map((item, i) => (
                  <Reveal key={item.q} delay={i * 0.05} y={16}>
                    <details className="group rounded-2xl border border-border bg-card p-5 transition open:border-primary/40 hover:border-primary/30">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                          <Plus className="size-4 transition-transform group-open:rotate-45" />
                        </span>
                      </summary>
                      <p className="mt-3 leading-7 text-muted-foreground">{item.a}</p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="pb-14 pt-6 sm:pb-20">
            <div className={WRAP}>
              <Reveal>
                <div className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-primary via-[#1E4F39] to-[#12301F] text-primary-foreground sm:rounded-[2.5rem]">
                  <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-highlight/25 blur-3xl" />
                  <div aria-hidden className="absolute -bottom-32 -left-24 -z-10 size-96 rounded-full bg-warm/20 blur-3xl" />
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 opacity-[0.12] bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-size-[22px_22px]"
                  />

                  <div className="grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[1.1fr_.9fr] lg:p-16">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold">
                        <span className="size-2 rounded-full bg-highlight" />
                        Free to join
                      </span>

                      <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                        What&apos;s for dinner{" "}
                        <span className="font-serif font-normal italic text-highlight">tonight?</span>
                      </h2>
                      <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/75 sm:text-lg">
                        Start with what you have. Set your budget. Find a meal worth looking forward to.
                      </p>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href="/signup"
                          className={`group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-highlight pl-8 pr-2 text-sm font-semibold text-highlight-foreground transition hover:opacity-95 ${focus}`}
                        >
                          Get started free
                          <span className="flex size-10 items-center justify-center rounded-full bg-highlight-foreground text-highlight transition group-hover:translate-x-0.5">
                            <ArrowRight className="size-4" />
                          </span>
                        </Link>
                        <Link
                          href="/login"
                          className={`inline-flex h-14 items-center justify-center rounded-full border border-white/30 px-8 text-sm font-semibold transition hover:bg-white/10 ${focus}`}
                        >
                          Log in
                        </Link>
                      </div>

                      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-primary-foreground/80">
                        {["110 Kenyan recipes", "Costs in KES", "Works on any phone"].map((t) => (
                          <li key={t} className="flex items-center gap-2">
                            <span className="flex size-5 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
                              <Check className="size-3" />
                            </span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Photo collage */}
                    <div className="relative hidden h-95 sm:block lg:h-105">
                      <div className="absolute right-0 top-0 aspect-4/5 w-[56%] rotate-3 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-4 ring-white/15 transition duration-500 hover:z-20 hover:rotate-0 hover:scale-105">
                        <Photo srcs={LANDING_IMAGES.hero} alt="Nyama choma with kachumbari" className="absolute inset-0 size-full object-cover" />
                      </div>
                      <div className="absolute left-0 top-10 aspect-square w-[46%] -rotate-6 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-4 ring-white/15 transition duration-500 hover:z-20 hover:rotate-0 hover:scale-105">
                        <Photo srcs={LANDING_IMAGES.pilau} alt="Beef pilau, spiced rice with tender beef" className="absolute inset-0 size-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 left-[16%] aspect-4/3 w-[46%] rotate-2 overflow-hidden rounded-3xl bg-white/10 shadow-2xl ring-4 ring-white/15 transition duration-500 hover:z-20 hover:rotate-0 hover:scale-105">
                        <Photo srcs={LANDING_IMAGES.chapatiMeat} alt="Chapati with green gram stew" className="absolute inset-0 size-full object-cover" />
                      </div>
                      <div className="absolute bottom-6 right-0 z-10 rounded-2xl bg-card p-3.5 text-card-foreground shadow-xl">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tonight&apos;s budget</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xl font-extrabold text-primary">
                          KES 200
                          <span className="rounded-full bg-highlight px-2 py-0.5 text-[11px] font-bold text-highlight-foreground">3 meals fit</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-border bg-card">
          <div className={`${WRAP} flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between`}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ChefHat className="size-5" />
              </span>
              <div>
                <span className="text-lg font-extrabold tracking-tight">Chakula</span>
                <p className="text-xs text-muted-foreground">Good food, within reach.</p>
              </div>
            </div>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-primary">
                  {link.label}
                </a>
              ))}
              <Link href="/login" className="transition hover:text-primary">Log in</Link>
              <Link href="/signup" className="transition hover:text-primary">Sign up</Link>
            </nav>
          </div>

          <div
            className={`${WRAP} flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}
          >
            <p>&copy; {new Date().getFullYear()} Chakula. All rights reserved.</p>
            <p className="flex gap-4">
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
            </p>
          </div>
        </footer>
      </MotionProvider>
    </div>
  );
}