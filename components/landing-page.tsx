// components/landing-page.tsx
import Link from "next/link";
import {
  ArrowRight, Bell, Calendar, Check, ChefHat, Clock3, Flame, Heart,
  Plus, Search, ShoppingBag, Utensils, Wallet, Zap,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { Photo } from "@/components/landing-photo";
import { LANDING_IMAGES } from "@/lib/landing-images";

const wrap = "mx-auto max-w-7xl px-5 sm:px-8";
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
const eyebrow = "text-sm font-semibold uppercase tracking-wider text-accent";
const h2 = "mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl";

const STATS = [
  { icon: Utensils, value: "110", label: "Kenyan recipes" },
  { icon: Wallet, value: "KES 100–500", label: "Budget tiers" },
  { icon: Calendar, value: "7 days", label: "Meal planner" },
  { icon: ChefHat, value: "Step by step", label: "Cook mode" },
];

const FEATURES = [
  { icon: Wallet, title: "Budget-first discovery", text: "Filter every meal by what you can spend and how long you have. Start from under KES 100, 200 or 300." },
  { icon: Search, title: "Pantry match", text: "Add what is already in your kitchen. Chakula scores each recipe by what you have and lists what is missing." },
  { icon: Calendar, title: "Weekly planner", text: "Plan breakfast, lunch and dinner across seven days and see the estimated cost of your week." },
  { icon: ShoppingBag, title: "Shopping lists with budgets", text: "Send missing ingredients to a list, add prices, and watch the budget bar so you do not overspend." },
  { icon: ChefHat, title: "Step-by-step cook mode", text: "One instruction at a time, full screen, so you can follow along while your hands are busy." },
  { icon: Bell, title: "Meal reminders", text: "Gentle in-app nudges at breakfast, lunch and dinner. Choose your own times and quiet hours." },
];

const STEPS = [
  { title: "Set your budget", text: "Pick what you can spend and how much time you have." },
  { title: "Choose a meal", text: "Browse real Kenyan meals with cost estimates, or match recipes to your pantry." },
  { title: "Plan, shop and cook", text: "Add it to your week, send ingredients to a shopping list, then cook step by step." },
];

const MEALS = [
  { name: "Ugali & Fried Cabbage", cost: "KES 70–120", time: "28 min", img: LANDING_IMAGES.cabbage, alt: "Ugali served with fried cabbage" },
  { name: "Ugali & Omena", cost: "KES 130–200", time: "35 min", img: LANDING_IMAGES.omena, alt: "Ugali served with omena in tomato sauce" },
  { name: "Ugali & Fried Fish", cost: "KES 230–320", time: "45 min", img: LANDING_IMAGES.fish, alt: "Ugali served with fried tilapia" },
  { name: "Ugali & Liver", cost: "KES 160–230", time: "35 min", img: LANDING_IMAGES.liver, alt: "Ugali served with liver and greens" },
];

const AUDIENCES = [
  { icon: Zap, title: "Students and first-time cooks", text: "One-pot meals, quick cooks and recipes that stretch a small budget." },
  { icon: Heart, title: "Families", text: "Batch-cook stews and leftover-friendly dishes that feed the whole house." },
  { icon: Flame, title: "Home-style and street favourites", text: "Githeri, mukimo, matoke, viazi karai, mandazi and more." },
];

const FAQ = [
  { q: "Do I need an account?", a: "Yes. An account keeps your favourites, pantry, plans and shopping lists saved. Sign-up takes a minute and you confirm your email." },
  { q: "How accurate are the costs?", a: "Costs are estimates for the whole recipe at Nairobi prices and will vary by market and season. Use them to compare meals and plan a budget, not as a receipt." },
  { q: "Can I add my own recipes?", a: "Yes. Create personal recipes, group them into collections and log every time you cook." },
  { q: "How do reminders work?", a: "Reminders appear inside Chakula at the times you choose, while the app is open." },
  { q: "Does it work on my phone?", a: "Yes. Chakula is built to work on phones, tablets and desktops." },
];

const PREVIEW = [
  { name: "Ugali & Sukuma Wiki", cost: "KES 65–110", time: "28 min" },
  { name: "Rice & Beans", cost: "KES 90–140", time: "80 min" },
  { name: "Ugali & Omena", cost: "KES 130–200", time: "35 min" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-black text-white">
          <Photo
            srcs={LANDING_IMAGES.hero}
            alt="Ugali served with sukuma wiki"
            priority
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/60" />
          <div className={`${wrap} grid min-h-[88svh] gap-12 pb-20 pt-32 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:pb-28 lg:pt-40`}>
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Wallet className="size-3.5" />
                Budget-first Kenyan cooking
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Know what to cook with the money you have.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
                Chakula is a Kenyan meal planner built around your budget. Pick a spend, see real meals you can afford, then plan, shop and cook.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-sm font-semibold text-accent-foreground transition hover:opacity-90 ${focus}`}
                >
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className={`inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-7 text-sm font-semibold text-white transition hover:bg-white/10 ${focus}`}
                >
                  See how it works
                </a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                {["110 Kenyan recipes", "Budget tiers from KES 100", "Planner and shopping lists"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-white" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-card p-5 text-foreground shadow-2xl lg:block">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="size-4 text-accent" />
                  Under KES 200
                </p>
                <span className="text-xs text-muted-foreground">Example</span>
              </div>
              <ul className="mt-4 grid gap-2.5">
                {PREVIEW.map((m) => (
                  <li key={m.name} className="rounded-xl bg-secondary/60 p-3.5">
                    <p className="font-serif text-lg leading-tight">{m.name}</p>
                    <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.cost}</span>
                      <span className="flex items-center gap-1"><Clock3 className="size-3" />{m.time}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section aria-label="Chakula at a glance" className="border-b border-border bg-card">
          <div className={`${wrap} grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4`}>
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3.5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-serif text-2xl leading-none">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="scroll-mt-20 py-20 sm:py-28">
          <div className={wrap}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Features</p>
              <h2 className={h2}>Everything between &ldquo;what&rsquo;s for dinner&rdquo; and a clean plate.</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                One app for choosing, planning, shopping and cooking, built around Kenyan food and Kenyan budgets.
              </p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent/40 hover:shadow-md">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="scroll-mt-20 bg-secondary/50 py-20 sm:py-28">
          <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
              <Utensils aria-hidden className="absolute inset-0 m-auto size-12 text-muted-foreground/40" />
              <Photo srcs={LANDING_IMAGES.how} alt="A plate of ugali" className="absolute inset-0 size-full object-cover" />
            </div>
            <div>
              <p className={eyebrow}>How it works</p>
              <h2 className={h2}>From budget to dinner in three steps.</h2>
              <ol className="mt-10 grid gap-7">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl">{s.title}</h3>
                      <p className="mt-1 text-muted-foreground">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* MEALS */}
        <section id="meals" className="scroll-mt-20 py-20 sm:py-28">
          <div className={wrap}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className={eyebrow}>The menu</p>
                <h2 className={h2}>Real meals, real prices.</h2>
              </div>
              <Link href="/signup" className={`inline-flex items-center gap-1.5 rounded-lg text-sm font-semibold text-accent hover:underline ${focus}`}>
                Create an account to browse all 110
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {MEALS.map((m) => (
                <article key={m.name}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
                    <Utensils aria-hidden className="absolute inset-0 m-auto size-10 text-muted-foreground/40" />
                    <Photo srcs={m.img} alt={m.alt} className="absolute inset-0 size-full object-cover" />
                  </div>
                  <h3 className="mt-4 font-serif text-xl leading-tight">{m.name}</h3>
                  <p className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{m.cost}</span>
                    <span className="flex items-center gap-1"><Clock3 className="size-3.5" />{m.time}</span>
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Costs are estimates for the whole recipe at Nairobi prices.
            </p>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="border-y border-border bg-card py-20 sm:py-24">
          <div className={wrap}>
            <div className="max-w-2xl">
              <p className={eyebrow}>Made for how Kenya eats</p>
              <h2 className={h2}>Whether you cook for one or for ten.</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-accent">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-xl">{title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[.8fr_1.2fr]`}>
            <div>
              <p className={eyebrow}>FAQ</p>
              <h2 className={h2}>Good to know.</h2>
            </div>
            <div className="grid gap-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus className="size-5 shrink-0 text-accent transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 leading-7 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-7xl rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12">
            <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              What&rsquo;s for dinner tonight?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 opacity-80">
              Create your account and find a meal that fits your budget in a minute.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-7 text-sm font-semibold text-foreground transition hover:opacity-90 ${focus}`}
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={`inline-flex h-12 items-center justify-center rounded-xl border border-primary-foreground/30 px-7 text-sm font-semibold transition hover:bg-primary-foreground/10 ${focus}`}
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className={`${wrap} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ChefHat className="size-4" />
            </span>
            <span className="font-serif text-xl">Chakula</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
            <Link href="/signup" className="hover:text-foreground">Sign up</Link>
          </nav>
        </div>
        <div className={`${wrap} border-t border-border py-5 text-xs text-muted-foreground`}>
          <p>&copy; {new Date().getFullYear()} Chakula. Some photographs courtesy of Wikimedia Commons contributors.</p>
        </div>
      </footer>
    </div>
  );
}