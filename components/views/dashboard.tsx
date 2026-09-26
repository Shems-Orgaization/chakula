// components/views/dashboard.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BookOpen, ChevronRight, Heart, Search, ShoppingBag, Sparkles,
  Bell, Clock3, Calendar, ChefHat, Flame, TrendingUp, Plus,
  Utensils, Sunrise, Sun, Moon, Loader2, Zap
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeService } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";
import { MiniCard } from "@/components/mini-card";
import { RecipePlaceholder } from "@/components/recipe-placeholder";

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
}

interface PlanEntry {
  id: string;
  plan_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_id: string;
  recipes?: any;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return { text: "Good morning", icon: Sunrise, period: "breakfast" };
  if (hour < 16) return { text: "Good afternoon", icon: Sun, period: "lunch" };
  if (hour < 19) return { text: "Good evening", icon: Sun, period: "dinner" };
  return { text: "Good night", icon: Moon, period: "dinner" };
};

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
}: DashboardProps) {
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [cookingStats, setCookingStats] = useState({ thisWeek: 0, total: 0, streak: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const greeting = useMemo(() => getGreeting(), []);
  const GreetingIcon = greeting.icon;

  // ---- FETCH UPCOMING PLANS ----
  useEffect(() => {
    (async () => {
      try {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = new Date(today);
        end.setDate(end.getDate() + 6);
        const endStr = end.toISOString().split("T")[0];

        const res = await fetch(`/api/plans?start=${start}&end=${endStr}`);
        const data = await res.json();
        setPlans(data.plans ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    })();
  }, []);

  // ---- FETCH COOKING STATS ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/meals");
        const data = await res.json();
        const log = data.cookingLog ?? [];
        const now = new Date();

        const thisWeek = log.filter((l: any) => {
          const d = new Date(l.cooked_at);
          const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        }).length;

        const cookDays = new Set(log.map((l: any) => l.cooked_at.split("T")[0]));
        let streak = 0;
        const checkDate = new Date();
        while (cookDays.has(checkDate.toISOString().split("T")[0])) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        setCookingStats({ thisWeek, total: log.length, streak });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, []);

  // ---- NEXT PLANNED MEALS ----
  const upcomingPlans = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return plans
      .filter((p) => p.plan_date >= today)
      .sort((a, b) => {
        if (a.plan_date !== b.plan_date) return a.plan_date.localeCompare(b.plan_date);
        const order = { breakfast: 0, lunch: 1, dinner: 2 };
        return order[a.meal_type] - order[b.meal_type];
      })
      .slice(0, 3);
  }, [plans]);

  // ---- RECOMMENDATIONS FOR NOW ----
  const nowRecs = useMemo(() => {
    const hour = new Date().getHours();
    const targetMeal =
      hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : "Dinner";

    const matching = catalog.filter((r) => r.mealType === targetMeal);
    if (matching.length === 0) return catalog.slice(0, 3);

    return matching
      .map((r) => {
        const pantryMatches = r.ingredients.filter((ing) =>
          pantry.some(
            (p) =>
              ing.name.toLowerCase().includes(p.toLowerCase()) ||
              p.toLowerCase().includes(ing.name.toLowerCase())
          )
        ).length;
        const score = pantryMatches * 10 - r.totalTime / 10;
        return { recipe: r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.recipe);
  }, [catalog, pantry]);

  // ---- QUICK STATS ----
  const quickStats = [
    {
      label: "Pantry items",
      value: pantry.length,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      onClick: () => onNavigate("pantry"),
    },
    {
      label: "Favorites",
      value: loved.length,
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
      onClick: () => onNavigate("meals"),
    },
    {
      label: "Cooked this week",
      value: cookingStats.thisWeek,
      icon: ChefHat,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      onClick: () => onNavigate("meals"),
    },
    {
      label: "Cooking streak",
      value: `${cookingStats.streak}d`,
      icon: Flame,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      onClick: () => onNavigate("meals"),
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* ============ HERO — PERSONALIZED + BRANDED ============ */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-12 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
            <GreetingIcon className="size-4" />
            <span>{greeting.text}</span>
          </div>
          <h1 className="mt-4 font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
            {greeting.period === "breakfast" && "What's for breakfast?"}
            {greeting.period === "lunch" && "What's for lunch?"}
            {greeting.period === "dinner" && "What's for dinner?"}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-primary-foreground/75">
            {pantry.length > 0
              ? `You have ${pantry.length} ingredient${pantry.length > 1 ? "s" : ""} in your pantry. Let's find something to cook.`
              : "Don't feel like deciding? Sawa basi. We'll find something familiar, affordable and easy to cook."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="action-button action-button-light"
              onClick={() => onRecommend()}
            >
              <Sparkles className="size-4" />
              Surprise me
            </button>
            <button
              className="action-button action-button-quiet"
              onClick={() => onNavigate("browse")}
            >
              <BookOpen className="size-4" />
              Explore recipes
            </button>
            {pantry.length > 0 && (
              <button
                className="action-button action-button-quiet"
                onClick={() => onNavigate("pantry")}
              >
                <ShoppingBag className="size-4" />
                Use what I have
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============ QUICK STATS ============ */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-serif text-2xl">{stat.value}</p>
              </div>
            </button>
          );
        })}
      </section>

      {/* ============ RECOMMENDED NOW ============ */}
      {nowRecs.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="eyebrow">Recommended for {greeting.period}</p>
              <h2 className="section-title mt-1 text-3xl">Perfect right now</h2>
            </div>
            <button
              className="flex items-center gap-1 text-sm font-semibold text-accent transition hover:underline"
              onClick={() => onNavigate("browse")}
            >
              See all <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nowRecs.map((r) => (
              <MiniCard key={r.id} recipe={r} open={() => open(r)} images={images} />
            ))}
          </div>
        </section>
      )}

      {/* ============ UPCOMING PLANS ============ */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">This week</p>
            <h2 className="section-title mt-1 text-3xl">Upcoming meals</h2>
          </div>
          <button
            className="flex items-center gap-1 text-sm font-semibold text-accent transition hover:underline"
            onClick={() => onNavigate("planner")}
          >
            Open planner <ChevronRight className="size-4" />
          </button>
        </div>

        {loadingPlans ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-12">
            <Loader2 className="size-6 animate-spin text-accent" />
          </div>
        ) : upcomingPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Calendar className="size-10 text-muted-foreground/40" />
            <p className="mt-3 font-serif text-xl">Nothing planned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan your week to save time and money.
            </p>
            <button
              onClick={() => onNavigate("planner")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Plan this week
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcomingPlans.map((plan) => {
              const recipe = catalog.find((r) => r.id === plan.recipe_id);
              if (!recipe) return null;
              const img = recipeImage(recipe, images);
              const planDate = new Date(plan.plan_date + "T00:00:00");
              const isToday = plan.plan_date === new Date().toISOString().split("T")[0];

              const MealIcon =
                plan.meal_type === "breakfast"
                  ? Sunrise
                  : plan.meal_type === "lunch"
                  ? Sun
                  : Moon;

              return (
                <button
                  key={plan.id}
                  onClick={() => open(recipe)}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-accent/50 hover:shadow-md"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl">
                    {img ? (
                      <img
                        src={img}
                        alt={imageAlt(recipe, images)}
                        className="size-full object-cover"
                      />
                    ) : (
                      <RecipePlaceholder
                        name={recipe.name}
                        category={recipe.category}
                        showName={false}
                        className="!aspect-auto h-full"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MealIcon className="size-3" />
                      {plan.meal_type}
                      <span>·</span>
                      <span className={isToday ? "text-accent" : ""}>
                        {isToday
                          ? "Today"
                          : planDate.toLocaleDateString("en-KE", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                      </span>
                    </div>
                    <h3 className="mt-1 truncate font-serif text-lg">
                      {recipe.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {recipe.totalTime} min
                      </span>
                      <span>{formatCost(recipe.estimatedCost)}</span>
                    </div>
                  </div>

                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ RECENTLY LOVED + REMINDERS ============ */}
      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Recently loved</p>
              <h2 className="section-title mt-1 text-2xl">Good food, saved</h2>
            </div>
            <Heart className="size-5 text-accent" />
          </div>
          {loved.length ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {loved.slice(0, 3).map((r) => (
                <MiniCard key={r.id} recipe={r} open={() => open(r)} images={images} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-secondary/40 py-10 text-center">
              <Heart className="size-6 text-accent" />
              <p className="text-sm text-muted-foreground">
                Save a meal and it will show up here.
              </p>
              <button
                onClick={() => onNavigate("browse")}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Explore recipes →
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Meal reminders</p>
              <h2 className="mt-1 font-serif text-2xl">Stay on track</h2>
            </div>
            <Bell className="size-5 text-accent" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Gentle in-app nudges in the morning, at lunch, and in the evening.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {(["morning", "lunch", "evening"] as const).map((p) => (
              <label
                key={p}
                className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-3 text-sm font-semibold capitalize transition hover:bg-secondary"
              >
                <span>{p}</span>
                <input
                  type="checkbox"
                  checked={reminders[p]}
                  onChange={(e) =>
                    setReminders({ ...reminders, [p]: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUICK PICKS ============ */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Shortcuts</p>
            <h2 className="section-title mt-1 text-3xl">Chakula ideas</h2>
          </div>
          <button
            className="flex items-center gap-1 text-sm font-semibold text-accent transition hover:underline"
            onClick={() => onNavigate("browse")}
          >
            See all <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { label: "⚡ Quick (15 min)", action: () => onNavigate("browse") },
            { label: "🍳 Breakfast", action: () => onRecommend("Breakfast") },
            { label: "🥗 Lunch", action: () => onRecommend("Lunch") },
            { label: "🍲 Dinner", action: () => onRecommend("Dinner") },
            { label: "💰 Under KES 200", action: () => onNavigate("browse") },
            { label: "🔥 Comrade-friendly", action: () => onNavigate("browse") },
          ].map((x) => (
            <button
              key={x.label}
              className="whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-accent hover:bg-accent/5"
              onClick={x.action}
            >
              {x.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}