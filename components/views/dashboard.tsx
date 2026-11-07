// components/views/dashboard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Bell,
  Calendar,
  ChefHat,
  ChevronRight,
  Clock3,
  Flame,
  Heart,
  Loader2,
  Moon,
  Plus,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunrise,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { type Recipe } from "@/lib/recipes";
import { formatCost } from "@/lib/recommendations";
import { MiniCard } from "@/components/mini-card";
import { RecipeImage } from "@/components/recipe-image";
import { apiClient } from "@/lib/api-client";
import { REMINDERS_ENABLED } from "@/lib/features";
import { localDateStr } from "@/lib/dates";

interface DashboardProps {
  recipes: Recipe[];
  onNavigate: (view: string) => void;
  onRecommend: (type?: string) => void;
  loved: Recipe[];
  open: (recipe: Recipe) => void;
  pantry: string[];
  reminders: { morning: boolean; lunch: boolean; evening: boolean };
  setReminders: (r: any) => void;
  images?: Record<string, string>;
  userBudget: number;
  setUserBudget: (val: number) => void;
}

interface PlanEntry {
  id: string;
  plan_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_id: string;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return { text: "Good morning", icon: Sunrise };
  if (h < 16) return { text: "Good afternoon", icon: Sun };
  if (h < 19) return { text: "Good evening", icon: Sun };
  return { text: "Good night", icon: Moon };
};

const budgetOptions = [100, 200, 300, 500];
const mealIcon = (t: string) => (t === "breakfast" ? Sunrise : t === "lunch" ? Sun : Moon);

function HeroArt() {
  return (
    <svg
      viewBox="0 0 460 320"
      className="h-full w-full overflow-visible"
      fill="none"
      role="img"
      aria-label="A bowl of food with tomato, avocado, chapati and chilli floating around it"
    >
      <defs>
        <linearGradient id="bowl" x1="0" y1="190" x2="0" y2="285">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6DCC4" />
        </linearGradient>
        <linearGradient id="rice" x1="0" y1="110" x2="0" y2="200">
          <stop stopColor="#FFF6DC" />
          <stop offset="1" stopColor="#F4D98F" />
        </linearGradient>
        <radialGradient id="tom" cx=".35" cy=".3" r=".8">
          <stop stopColor="#FF8F72" />
          <stop offset="1" stopColor="#D8402E" />
        </radialGradient>
      </defs>
      <ellipse cx="230" cy="190" rx="190" ry="130" fill="#fff" opacity=".07" />
      <g stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55">
        <path className="animate-steam" d="M200 100C190 85 210 75 200 60" />
        <path className="animate-steam [animation-delay:.8s]" d="M232 96C222 80 242 70 232 52" />
        <path className="animate-steam [animation-delay:1.6s]" d="M264 100C254 85 274 75 264 60" />
      </g>
      <ellipse cx="230" cy="288" rx="105" ry="11" fill="#000" opacity=".2" />
      <path d="M138 202C138 142 188 112 230 112C274 112 322 142 322 202Z" fill="url(#rice)" />
      <ellipse cx="190" cy="142" rx="30" ry="12" transform="rotate(-22 190 142)" fill="#3FA45B" />
      <ellipse cx="218" cy="128" rx="26" ry="10" transform="rotate(8 218 128)" fill="#63C06A" />
      <circle cx="266" cy="150" r="16" fill="url(#tom)" />
      <circle cx="266" cy="150" r="9" fill="#FF9B82" opacity=".6" />
      <circle cx="294" cy="176" r="13" fill="url(#tom)" />
      <circle cx="168" cy="172" r="12" fill="url(#tom)" />
      <g fill="#7BD36A">
        <circle cx="240" cy="168" r="4" /><circle cx="250" cy="178" r="4" /><circle cx="214" cy="170" r="4" />
        <circle cx="198" cy="180" r="4" /><circle cx="278" cy="136" r="4" />
      </g>
      <g fill="#F2C14E">
        <circle cx="226" cy="150" r="3.5" /><circle cx="236" cy="144" r="3.5" /><circle cx="204" cy="156" r="3.5" />
        <circle cx="256" cy="172" r="3.5" /><circle cx="182" cy="160" r="3.5" />
      </g>
      <path d="M138 192C170 214 290 214 322 192C322 250 282 284 230 284C178 284 138 250 138 192Z" fill="url(#bowl)" />
      <path d="M138 192C170 214 290 214 322 192" stroke="#fff" strokeWidth="3" opacity=".8" />
      <path d="M146 232C185 252 275 252 314 232" stroke="#E87952" strokeWidth="7" strokeLinecap="round" />
      <g fill="#F2C14E">
        <circle cx="190" cy="262" r="3" /><circle cx="230" cy="268" r="3" /><circle cx="270" cy="262" r="3" />
      </g>
      <g transform="translate(40 60)">
        <g className="animate-float">
          <circle cx="34" cy="38" r="32" fill="url(#tom)" />
          <path d="M34 8L28 18L16 14L26 24L18 34L32 28L34 40L40 28L52 32L44 22L54 14L42 16Z" fill="#3FA45B" transform="translate(0 -6) scale(.9 .6)" />
          <ellipse cx="22" cy="28" rx="7" ry="4" fill="#fff" opacity=".4" transform="rotate(-30 22 28)" />
        </g>
      </g>
      <g transform="translate(350 20)">
        <g className="animate-float-slow">
          <path d="M44 6C30 6 22 26 14 44C4 68 18 92 44 92C70 92 84 68 74 44C66 26 58 6 44 6Z" fill="#2E7D4A" />
          <path d="M44 14C34 14 28 30 22 46C15 64 26 84 44 84C62 84 73 64 66 46C60 30 54 14 44 14Z" fill="#D5EB8E" />
          <circle cx="44" cy="62" r="15" fill="#9A6238" />
          <ellipse cx="39" cy="57" rx="5" ry="3.5" fill="#fff" opacity=".35" />
        </g>
      </g>
      <g transform="translate(345 205)">
        <g className="animate-float [animation-delay:1s]">
          <ellipse cx="46" cy="22" rx="46" ry="17" fill="#C98A2E" />
          <ellipse cx="46" cy="17" rx="46" ry="17" fill="#F6CF7A" />
          <g fill="#D99A3A"><circle cx="30" cy="14" r="4" /><circle cx="52" cy="20" r="5" /><circle cx="68" cy="12" r="3.5" /><circle cx="42" cy="8" r="3" /></g>
        </g>
      </g>
      <g transform="translate(36 215) rotate(-20)">
        <g className="animate-float-slow [animation-delay:.5s]">
          <path d="M0 14C24 0 56 10 74 40C52 34 24 28 0 24Z" fill="#E8573F" />
          <path d="M0 14C-6 8 -4 0 4 -4" stroke="#3FA45B" strokeWidth="5" strokeLinecap="round" />
          <path d="M10 16C28 12 46 18 58 30" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".35" />
        </g>
      </g>
      <g transform="translate(250 10)">
        <g className="animate-float [animation-delay:1.5s]">
          <ellipse cx="30" cy="16" rx="30" ry="14" stroke="#F4A7C0" strokeWidth="6" />
          <ellipse cx="30" cy="16" rx="16" ry="6" stroke="#F9D2DF" strokeWidth="4" />
        </g>
      </g>
      <g transform="translate(120 20)">
        <g className="animate-float-slow [animation-delay:2s]">
          <path d="M0 30C4 8 20 0 40 0C38 20 24 34 0 30Z" fill="#8FD36A" />
          <path d="M2 28L32 6" stroke="#2F8F55" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
      <g fill="#F2C14E">
        <circle cx="105" cy="140" r="5" /><circle cx="420" cy="150" r="4" /><circle cx="300" cy="40" r="3.5" /><circle cx="90" cy="290" r="4" />
      </g>
    </svg>
  );
}

export function Dashboard({
  recipes: catalog,
  onNavigate,
  onRecommend,
  loved,
  open,
  pantry,
  reminders,
  setReminders,
  images = {},
  userBudget,
  setUserBudget,
}: DashboardProps) {
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [cookingStats, setCookingStats] = useState({ thisWeek: 0, total: 0, streak: 0 });

  const greeting = useMemo(() => getGreeting(), []);
  const GreetingIcon = greeting.icon;
  const todayStr = localDateStr();

  useEffect(() => {
    let active = true;
    (async () => {
      const today = new Date();
      const end = new Date(today);
      end.setDate(end.getDate() + 6);
      const res = await apiClient(`/api/plans?start=${localDateStr(today)}&end=${localDateStr(end)}`);
      if (!active) return;
      if (res.ok) setPlans(res.data.plans ?? []);
      else toast.error(res.error);
      setLoadingPlans(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await apiClient("/api/meals");
      if (!active) return;
      if (res.ok) {
        const log = res.data.cookingLog ?? [];
        const now = new Date();
        const thisWeek = log.filter((i: any) => {
          const d = (now.getTime() - new Date(i.cooked_at).getTime()) / 86400000;
          return d >= 0 && d <= 7;
        }).length;
        const cookDays = new Set(log.map((i: any) => localDateStr(new Date(i.cooked_at))));
        let streak = 0;
        const check = new Date();
        while (cookDays.has(localDateStr(check))) {
          streak += 1;
          check.setDate(check.getDate() - 1);
        }
        setCookingStats({ thisWeek, total: log.length, streak });
      } else toast.error(res.error);
    })();
    return () => {
      active = false;
    };
  }, []);

  const upcomingPlans = useMemo(
    () =>
      plans
        .filter((p) => p.plan_date >= todayStr)
        .sort((a, b) => a.plan_date.localeCompare(b.plan_date))
        .slice(0, 4),
    [plans, todayStr]
  );

  const nowRecs = useMemo(() => {
    const hour = new Date().getHours();
    const target = hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : "Dinner";
    const affordable = catalog.filter((r) => r.estimatedCost.max <= userBudget);
    const matching = affordable.filter((r) => r.mealType === target);
    return (matching.length > 0 ? matching : affordable)
      .map((recipe) => {
        const hits = recipe.ingredients.filter((ing) =>
          pantry.some((p) => ing.name.toLowerCase().includes(p.toLowerCase()))
        ).length;
        return { recipe, score: hits * 10 - recipe.totalTime / 10 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((i) => i.recipe);
  }, [catalog, pantry, userBudget]);

  const stats = [
    { label: "Pantry", value: pantry.length, icon: ShoppingBag, to: "pantry" },
    { label: "Favourites", value: loved.length, icon: Heart, to: "meals" },
    { label: "Cooked this week", value: cookingStats.thisWeek, icon: ChefHat, to: "meals" },
    { label: "Day streak", value: cookingStats.streak, icon: Flame, to: "meals" },
  ];

  return (
    // ✅ FIXED: Removed mx-auto and max-w-[1400px] so it stretches fully.
    <div className="flex w-full flex-col gap-8">
      {/* HERO */}
      <section className="relative isolate flex min-h-[240px] items-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#245C43] via-[#2A7351] to-[#01ae82] px-6 py-8 text-white sm:min-h-[280px] sm:px-10 dark:from-[#0A2A20] dark:via-[#0C3F2F] dark:to-[#0B5C46]">
        <div className="pattern-dots pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,black,transparent_75%)]" />

        <div className="relative z-10 w-[62%] max-w-[560px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
            <GreetingIcon className="size-4" />
            {greeting.text}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            What's cooking
            <span className="block text-[#F2C14E]">today?</span>
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
            {pantry.length > 0
              ? `${pantry.length} ingredients in your pantry. Let's turn them into something good.`
              : "Familiar, affordable and easy to make. Find your next meal."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onRecommend()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#F2C14E] px-5 text-sm font-bold text-[#2A2005] transition hover:brightness-105"
            >
              <Sparkles className="size-4" />
              Surprise me
            </button>
            <button
              type="button"
              onClick={() => onNavigate("browse")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/35 px-5 text-sm font-semibold transition hover:bg-white/10"
            >
              <BookOpen className="size-4" />
              Explore
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-2 flex w-[40%] items-center sm:right-6 sm:w-[40%]">
          <HeroArt />
        </div>
      </section>

      {/* PICKED FOR YOUR BUDGET */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">Meals you can make</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on the time of day, your pantry and your budget.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-1.5">
            <label className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <Wallet className="size-4 text-primary" />
              <span className="font-semibold text-muted-foreground">KES</span>
              <input
                type="number"
                min="0"
                value={userBudget || ""}
                onChange={(e) => setUserBudget(Math.max(0, Number(e.target.value)))}
                aria-label="Daily food budget in Kenyan shillings"
                placeholder="250"
                className="w-16 bg-transparent font-bold text-foreground outline-none"
              />
              <span className="text-xs text-muted-foreground">/day</span>
            </label>
            {budgetOptions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setUserBudget(v)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  userBudget === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {nowRecs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {nowRecs.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => open(recipe)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="pattern-dots-soft relative aspect-[16/10] overflow-hidden bg-secondary">
                  <RecipeImage
                    recipe={recipe}
                    images={images}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    placeholderClassName="aspect-auto! h-full"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                    {recipe.mealType}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-serif text-xl text-foreground">{recipe.name}</h3>
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {recipe.totalTime} min
                    </span>
                    <span className="rounded-full bg-gold/25 px-2.5 py-1 font-semibold text-foreground">
                      {formatCost(recipe.estimatedCost)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <Wallet className="mx-auto size-8 text-primary/70" />
            <h3 className="mt-3 font-serif text-xl">No meals under KES {userBudget}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Raise your budget to see more options.</p>
          </div>
        )}
      </section>

      {/* THIS WEEK + STATS */}
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl">This week</h2>
            <button
              type="button"
              onClick={() => onNavigate("planner")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Open planner <ChevronRight className="size-4" />
            </button>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : upcomingPlans.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl bg-secondary/60 px-5 py-9 text-center">
              <Calendar className="size-7 text-primary" />
              <p className="mt-3 font-serif text-xl">Nothing planned yet</p>
              <button
                type="button"
                onClick={() => onNavigate("planner")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                Plan this week
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingPlans.map((plan) => {
                const recipe = catalog.find((c) => c.id === plan.recipe_id);
                if (!recipe) return null;
                const isToday = plan.plan_date === todayStr;
                const Icon = mealIcon(plan.meal_type);
                return (
                  <li key={plan.id}>
                    <button
                      type="button"
                      onClick={() => open(recipe)}
                      className="group flex w-full items-center gap-4 py-3 text-left"
                    >
                      <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <RecipeImage
                          recipe={recipe}
                          images={images}
                          className="size-full object-cover"
                          placeholderClassName="aspect-auto! h-full"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Icon className="size-3" />
                          {plan.meal_type}
                          <span>·</span>
                          <span className={isToday ? "text-accent" : ""}>
                            {isToday
                              ? "Today"
                              : new Date(plan.plan_date).toLocaleDateString("en-KE", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate font-serif text-lg text-foreground group-hover:text-primary">
                          {recipe.name}
                        </span>
                      </span>
                      <span className="hidden text-sm text-muted-foreground sm:block">
                        {formatCost(recipe.estimatedCost)}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onNavigate(s.to)}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="size-5" />
              </span>
              <span className="mt-5 block">
                <span className="block font-serif text-3xl leading-none text-foreground">{s.value}</span>
                <span className="mt-1.5 block text-xs font-semibold text-muted-foreground">{s.label}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* FAVOURITES + REMINDERS */}
      <section className={`grid gap-5 ${REMINDERS_ENABLED ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl">Saved meals</h2>
            <Heart className="size-5 text-coral" />
          </div>

          {loved.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {loved.slice(0, 3).map((recipe) => (
                <MiniCard key={recipe.id} recipe={recipe} open={() => open(recipe)} images={images} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-secondary/60 px-5 py-9 text-center">
              <Heart className="size-7 text-coral" />
              <p className="mt-3 font-serif text-xl">Your favourites live here</p>
              <button
                type="button"
                onClick={() => onNavigate("browse")}
                className="mt-3 text-sm font-semibold text-accent hover:underline"
              >
                Explore recipes →
              </button>
            </div>
          )}
        </div>

        {REMINDERS_ENABLED && (
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl sm:text-3xl">Meal reminders</h2>
              <Bell className="size-5 text-primary" />
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {(["morning", "lunch", "evening"] as const).map((period) => (
                <label
                  key={period}
                  className="flex cursor-pointer items-center justify-between rounded-xl bg-secondary/70 px-3.5 py-3 text-sm font-semibold capitalize transition hover:bg-secondary"
                >
                  <span>{period}</span>
                  <input
                    type="checkbox"
                    checked={reminders[period]}
                    onChange={(e) => setReminders({ ...reminders, [period]: e.target.checked })}
                    className="size-4 rounded border-border accent-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}