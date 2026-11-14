// components/views/dashboard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
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
import { useAssistant } from "@/components/assistant-provider";

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

const SLOTS = [
  { type: "breakfast", label: "Breakfast", icon: Sunrise },
  { type: "lunch", label: "Lunch", icon: Sun },
  { type: "dinner", label: "Dinner", icon: Moon },
] as const;

type Slot = (typeof SLOTS)[number];

const BUDGET_OPTIONS = [100, 200, 300, 500];
const DAYS_AHEAD = 7;

const kes = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;
const averageCost = (r: Recipe) => Math.round((r.estimatedCost.min + r.estimatedCost.max) / 2);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return { text: "Good morning", icon: Sunrise };
  if (h < 16) return { text: "Good afternoon", icon: Sun };
  if (h < 19) return { text: "Good evening", icon: Sun };
  return { text: "Good night", icon: Moon };
};

/* ------------------------------------------------------------------ */
/* One slot of the day: a planned meal card, or an invitation to add one */
/* ------------------------------------------------------------------ */

interface MealSlotProps {
  slot: Slot;
  recipe?: Recipe;
  images: Record<string, string>;
  onOpen: (recipe: Recipe) => void;
  onAdd: () => void;
}

function MealSlot({ slot, recipe, images, onOpen, onAdd }: MealSlotProps) {
  const Icon = slot.icon;

  if (!recipe) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-[230px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center transition hover:border-primary/50 hover:bg-card"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-bold">{slot.label}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">Nothing planned yet</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
          <Plus className="size-3.5" />
          Add a meal
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(recipe)}
      className="group overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <RecipeImage
          recipe={recipe}
          images={images}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
          placeholderClassName="aspect-auto! h-full"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
          <Icon className="size-3 text-primary" />
          {slot.label}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-serif text-xl">{recipe.name}</h3>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="size-3.5" />
            {recipe.totalTime} min
          </span>
          <span className="rounded-full bg-highlight px-2.5 py-1 font-bold text-highlight-foreground">
            {formatCost(recipe.estimatedCost)}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

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
  const { openAssistant } = useAssistant();
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [cookingStats, setCookingStats] = useState({ thisWeek: 0, total: 0, streak: 0 });

  const greeting = useMemo(() => getGreeting(), []);
  const GreetingIcon = greeting.icon;

  // Today plus the next 6 days
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          key: localDateStr(d),
          weekday: d.toLocaleDateString("en-KE", { weekday: "short" }),
          day: d.getDate(),
        };
      }),
    []
  );
  const todayStr = days[0].key;
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await apiClient(`/api/plans?start=${days[0].key}&end=${days[DAYS_AHEAD - 1].key}`);
      if (!active) return;
      if (res.ok) setPlans(res.data.plans ?? []);
      else toast.error(res.error);
      setLoadingPlans(false);
    })();
    return () => {
      active = false;
    };
  }, [days]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await apiClient("/api/meals");
      if (!active) return;
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const log = res.data.cookingLog ?? [];
      const now = Date.now();
      const thisWeek = log.filter((i: any) => {
        const ageInDays = (now - new Date(i.cooked_at).getTime()) / 86400000;
        return ageInDays >= 0 && ageInDays <= 7;
      }).length;

      const cookDays = new Set(log.map((i: any) => localDateStr(new Date(i.cooked_at))));
      let streak = 0;
      const cursor = new Date();
      while (cookDays.has(localDateStr(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      setCookingStats({ thisWeek, total: log.length, streak });
    })();
    return () => {
      active = false;
    };
  }, []);

  const recipeById = useMemo(() => new Map(catalog.map((r) => [r.id, r])), [catalog]);

  const countByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const plan of plans) counts[plan.plan_date] = (counts[plan.plan_date] ?? 0) + 1;
    return counts;
  }, [plans]);

  const selectedPlans = useMemo(() => plans.filter((p) => p.plan_date === selectedDate), [plans, selectedDate]);

  const plannedCost = useMemo(
    () =>
      selectedPlans.reduce((sum, plan) => {
        const recipe = recipeById.get(plan.recipe_id);
        return recipe ? sum + averageCost(recipe) : sum;
      }, 0),
    [selectedPlans, recipeById]
  );

  const hasBudget = userBudget > 0;
  const overBudget = hasBudget && plannedCost > userBudget;
  const budgetPercent = hasBudget ? Math.min(100, Math.round((plannedCost / userBudget) * 100)) : 0;

  const selectedLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const suggestions = useMemo(() => {
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
      .map((item) => item.recipe);
  }, [catalog, pantry, userBudget]);

  const stats = [
    { label: "In pantry", value: pantry.length, icon: ShoppingBag, to: "pantry" },
    { label: "Saved", value: loved.length, icon: Heart, to: "meals" },
    { label: "Cooked this week", value: cookingStats.thisWeek, icon: ChefHat, to: "meals" },
    { label: "Day streak", value: cookingStats.streak, icon: Flame, to: "meals" },
  ];

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* ---------------- MAIN COLUMN ---------------- */}
      <div className="flex min-w-0 flex-col gap-8">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <GreetingIcon className="size-4 text-primary" />
              {greeting.text}
            </p>
            <h1 className="mt-1 font-serif text-4xl tracking-tight sm:text-5xl">Your week, planned.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {pantry.length > 0
                ? `${pantry.length} ingredients in your pantry. Let's turn them into something good.`
                : "Plan your meals, then shop once."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAssistant({ page: "dashboard", prompt: `Plan my day for ${selectedDate}: breakfast, lunch and dinner within my budget.` })}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition hover:bg-secondary"
            >
              <Sparkles className="size-4" />
              Plan my day
            </button>
            <button
              type="button"
              onClick={() => openAssistant({ page: "dashboard", prompt: `Plan my week from ${days[0].key} to ${days[DAYS_AHEAD - 1].key}: 3 meals a day, each day within my budget.` })}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold transition hover:bg-secondary"
            >
              <Sparkles className="size-4" />
              Plan my week
            </button>
            <button
              type="button"
              onClick={() => onRecommend()}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-highlight px-5 text-sm font-bold text-highlight-foreground transition hover:opacity-90"
            >
              <Sparkles className="size-4" />
              Surprise me
            </button>
            <button
              type="button"
              onClick={() => onNavigate("planner")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Calendar className="size-4" />
              Open planner
            </button>
          </div>
        </header>

        {/* Week strip */}
        <div role="group" aria-label="Pick a day" className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, index) => {
            const selected = d.key === selectedDate;
            const count = countByDate[d.key] ?? 0;
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedDate(d.key)}
                className={`flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-2xl border px-3 py-3 transition ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                  {index === 0 ? "Today" : d.weekday}
                </span>
                <span className="font-serif text-2xl leading-none">{d.day}</span>
                <span className="flex h-1.5 gap-1">
                  {Array.from({ length: Math.min(count, 3) }, (_, n) => (
                    <span
                      key={n}
                      className={`size-1.5 rounded-full ${selected ? "bg-highlight" : "bg-primary/60"}`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* Daily menu */}
        <section aria-labelledby="menu-title">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="menu-title" className="font-serif text-2xl sm:text-3xl">
                {selectedLabel}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{selectedPlans.length} of 3 meals planned</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("planner")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Edit plan <ChevronRight className="size-4" />
            </button>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center rounded-2xl border border-border bg-card py-16">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {SLOTS.map((slot) => {
                const plan = selectedPlans.find((p) => p.meal_type === slot.type);
                return (
                  <MealSlot
                    key={slot.type}
                    slot={slot}
                    recipe={plan ? recipeById.get(plan.recipe_id) : undefined}
                    images={images}
                    onOpen={open}
                    onAdd={() => onNavigate("planner")}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Suggestions */}
        <section aria-labelledby="fit-title">
          <div className="mb-4">
            <h2 id="fit-title" className="font-serif text-2xl sm:text-3xl">
              Meals that fit {kes(userBudget)}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Based on the time of day, your pantry and your budget.
            </p>
          </div>

          {suggestions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {suggestions.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => open(recipe)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    <RecipeImage
                      recipe={recipe}
                      images={images}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      placeholderClassName="aspect-auto! h-full"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-bold text-highlight-foreground">
                      {formatCost(recipe.estimatedCost)}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-serif text-lg">{recipe.name}</h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {recipe.totalTime} min · {recipe.mealType}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <Wallet className="mx-auto size-8 text-primary/70" />
              <h3 className="mt-3 font-serif text-xl">No meals under {kes(userBudget)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Raise your budget to see more options.</p>
            </div>
          )}
        </section>

        {/* Saved meals */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl">Saved meals</h2>
            <Heart className="size-5 text-warm" />
          </div>

          {loved.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {loved.slice(0, 3).map((recipe) => (
                <MiniCard key={recipe.id} recipe={recipe} open={() => open(recipe)} images={images} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-xl bg-secondary/60 px-5 py-9 text-center">
              <Heart className="size-7 text-warm" />
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
        </section>
      </div>

      {/* ---------------- SIDE COLUMN ---------------- */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        {/* Budget balance */}
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="eyebrow">Day balance</p>
          <p className="mt-3 font-serif text-4xl leading-none">{kes(plannedCost)}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            planned for {selectedDate === todayStr ? "today" : selectedLabel.split(",")[0]}
          </p>

          <div
            role="progressbar"
            aria-label="Share of your daily budget that is planned"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={budgetPercent}
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={`h-full rounded-full transition-all ${overBudget ? "bg-warm" : "bg-highlight"}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold">
            {!hasBudget
              ? "Set a daily budget below"
              : overBudget
                ? `${kes(plannedCost - userBudget)} over your budget`
                : `${kes(userBudget - plannedCost)} left of ${kes(userBudget)}`}
          </p>

          <div className="mt-5 border-t border-border pt-4">
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
                className="w-full bg-transparent font-bold text-foreground outline-none"
              />
              <span className="text-xs text-muted-foreground">/day</span>
            </label>
            <div className="mt-2 flex gap-1.5">
              {BUDGET_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUserBudget(value)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                    userBudget === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onNavigate(s.to)}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="size-4" />
              </span>
              <span className="mt-4 block">
                <span className="block font-serif text-3xl leading-none">{s.value}</span>
                <span className="mt-1 block text-xs font-semibold text-muted-foreground">{s.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Shopping */}
        <section className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <span className="flex size-10 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
            <ShoppingBag className="size-5" />
          </span>
          <h2 className="mt-4 font-serif text-2xl">One grocery trip</h2>
          <p className="mt-1.5 text-sm leading-6 text-primary-foreground/80">
            Your planned meals feed a single shopping list, with prices and a budget bar.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("shopping")}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-background px-4 text-sm font-semibold text-foreground transition hover:opacity-90"
          >
            Open shopping list
            <ArrowRight className="size-4" />
          </button>
        </section>

        {/* Reminders (hidden until push notifications exist) */}
        {REMINDERS_ENABLED && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Meal reminders</h2>
              <Bell className="size-5 text-primary" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
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
          </section>
        )}
      </aside>
    </div>
  );
}