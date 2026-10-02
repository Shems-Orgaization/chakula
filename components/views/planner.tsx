// components/views/planner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, ShoppingBag,
  Coffee, Sun, Moon, Trash2, Loader2, Search, Sparkles
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";

interface Plan {
  id: string;
  plan_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_id: string;
  servings: number;
}

interface PlannerProps {
  recipes: Recipe[];
  open: (recipe: Recipe) => void;
  shopping: string[];
  setShopping: (items: string[]) => void;
  images?: Record<string, string>;
}

// ----- Date helpers -----
const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (a: Date, b: Date) => formatDate(a) === formatDate(b);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_SLOTS: { key: "breakfast" | "lunch" | "dinner"; label: string; icon: any }[] = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sun },
  { key: "dinner", label: "Dinner", icon: Moon },
];

export function Planner({
  recipes: catalog,
  open,
  shopping,
  setShopping,
  images = {},
}: PlannerProps) {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<{ date: string; slot: string } | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const startDateStr = formatDate(weekDates[0]);
  const endDateStr = formatDate(weekDates[6]);
  const today = new Date();

  // ----- LOAD PLANS -----
  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/plans?start=${startDateStr}&end=${endDateStr}`);
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [startDateStr, endDateStr]);

  // ----- NAVIGATION -----
  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  // ----- ADD MEAL -----
  const addMeal = async (recipeId: string) => {
    if (!pickerOpen) return;
    setSaving(true);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_date: pickerOpen.date,
          meal_type: pickerOpen.slot,
          recipe_id: recipeId,
          servings: 2,
        }),
      });

      if (!res.ok) throw new Error("Failed to add meal");

      await loadPlans();
      setPickerOpen(null);
      setPickerSearch("");
      setNotice("✅ Meal added to plan");
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error(err);
      setNotice("❌ Failed to add meal");
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // ----- REMOVE MEAL -----
  const removeMeal = async (planId: string) => {
    try {
      const res = await fetch(`/api/plans?id=${planId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");

      setPlans((prev) => prev.filter((p) => p.id !== planId));
      setNotice("🗑️ Meal removed");
      setTimeout(() => setNotice(null), 2000);
    } catch (err) {
      console.error(err);
      setNotice("❌ Failed to remove");
      setTimeout(() => setNotice(null), 2000);
    }
  };

  // ----- GENERATE SHOPPING LIST (adds to active list) -----
  const generateShoppingList = async () => {
    const allIngredients = new Set<string>();

    plans.forEach((plan) => {
      const recipe = catalog.find((r) => r.id === plan.recipe_id);
      if (recipe?.ingredients) {
        recipe.ingredients.forEach((ing) => allIngredients.add(ing.name));
      }
    });

    if (allIngredients.size === 0) {
      setNotice("⚠️ No meals planned this week");
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    try {
      // 1. Find or create an active shopping list
      const listsRes = await fetch("/api/shopping-lists");
      const listsData = await listsRes.json();
      const lists: any[] = listsData.lists ?? [];

      const todayStr = new Date().toISOString().split("T")[0];
      const isActive = (l: any) =>
        l.end_date
          ? l.start_date <= todayStr && todayStr <= l.end_date
          : l.start_date === todayStr;

      let listId = lists.find(isActive)?.id ?? lists[0]?.id;

      if (!listId) {
        // Create a default weekly list
        const createRes = await fetch("/api/shopping-lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Weekly Groceries",
            period_type: "week",
            start_date: todayStr,
            budget: 0,
          }),
        });
        const createData = await createRes.json();
        listId = createData.list?.id;
      }

      if (!listId) throw new Error("Could not resolve a shopping list");

      // 2. Add the ingredients to that list
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Array.from(allIngredients),
          list_id: listId,
          source: "recipe",
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      // 3. Update the parent shopping state so the badge updates
      const merged = [...new Set([...shopping, ...allIngredients])];
      setShopping(merged);

      setNotice(`🛒 Added ${allIngredients.size} items to your list`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error(err);
      setNotice("❌ Failed to add items");
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // ----- CLEAR WEEK -----
  const clearWeek = async () => {
    if (!confirm("Clear all meals for this week?")) return;

    try {
      await fetch(
        `/api/plans?date=${startDateStr}&end=${endDateStr}&clear=true`,
        { method: "DELETE" }
      );
      setPlans([]);
      setNotice("✅ Week cleared");
      setTimeout(() => setNotice(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // ----- HELPERS -----
  const getPlanForSlot = (date: Date, slot: string) => {
    const dateStr = formatDate(date);
    return plans.find((p) => p.plan_date === dateStr && p.meal_type === slot);
  };

  const getRecipeForPlan = (plan: Plan) => {
    return catalog.find((r) => r.id === plan.recipe_id);
  };

  const totalMeals = plans.length;
  const totalCost = plans.reduce((sum, p) => {
    const recipe = catalog.find((r) => r.id === p.recipe_id);
    return sum + (recipe?.estimatedCost?.max ?? 0);
  }, 0);

  const pickerRecipes = useMemo(() => {
    if (!pickerSearch) return catalog.slice(0, 30);
    const q = pickerSearch.toLowerCase();
    return catalog
      .filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      .slice(0, 30);
  }, [pickerSearch, catalog]);

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Plan ahead</p>
          <h1 className="section-title mt-3">Weekly meal planner.</h1>
          <p className="mt-3 text-muted-foreground">
            Plan your week, save money, and cook smarter.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goToday}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
          >
            Today
          </button>
          <button
            onClick={clearWeek}
            disabled={totalMeals === 0}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          >
            <Trash2 className="size-4" />
            Clear Week
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Meals Planned</p>
          <p className="mt-2 font-serif text-4xl">
            {totalMeals}<span className="text-lg text-muted-foreground">/21</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated Cost</p>
          <p className="mt-2 font-serif text-4xl">KES {totalCost.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Shopping Items</p>
          <p className="mt-2 font-serif text-4xl">{shopping.length}</p>
        </div>
      </div>

      {/* WEEK NAVIGATION */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <button
          onClick={prevWeek}
          className="rounded-lg p-2 transition hover:bg-secondary"
          aria-label="Previous week"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {isSameDay(weekStart, getMonday(new Date())) ? "This Week" : "Week of"}
          </p>
          <p className="font-serif text-lg">
            {weekDates[0].toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
            {" — "}
            {weekDates[6].toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={nextWeek}
          className="rounded-lg p-2 transition hover:bg-secondary"
          aria-label="Next week"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* WEEK GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid gap-4">
          {weekDates.map((date, i) => {
            const isToday = isSameDay(date, today);
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border bg-card transition ${
                  isToday ? "border-accent shadow-md" : "border-border"
                }`}
              >
                {/* Day Header */}
                <div className={`flex items-center justify-between px-5 py-3 ${isToday ? "bg-accent/10" : "bg-secondary/40"}`}>
                  <div className="flex items-center gap-3">
                    <Calendar className={`size-4 ${isToday ? "text-accent" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-serif text-lg">
                        {DAYS[i]}
                        {isToday && (
                          <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                            Today
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("en-KE", { month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meal Slots */}
                <div className="grid gap-3 p-4 md:grid-cols-3">
                  {MEAL_SLOTS.map((slot) => {
                    const plan = getPlanForSlot(date, slot.key);
                    const recipe = plan ? getRecipeForPlan(plan) : null;
                    const SlotIcon = slot.icon;

                    return (
                      <div key={slot.key} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <SlotIcon className="size-3" />
                          {slot.label}
                        </div>

                        {plan && recipe ? (
                          <div className="group relative rounded-xl border border-border bg-background p-3 transition hover:border-accent/50">
                            <button
                              onClick={() => open(recipe)}
                              className="flex w-full items-start gap-3 text-left"
                            >
                              <img
                                src={recipeImage(recipe, images) ?? undefined}
                                alt={imageAlt(recipe, images) ?? recipe.name}
                                className="size-14 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{recipe.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {recipe.totalTime} min · {formatCost(recipe.estimatedCost)}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => removeMeal(plan.id)}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition group-hover:opacity-100"
                              aria-label="Remove meal"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPickerOpen({ date: formatDate(date), slot: slot.key })}
                            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/50 p-4 text-xs text-muted-foreground transition hover:border-accent hover:text-accent"
                          >
                            <Plus className="size-4" />
                            Add meal
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHOPPING LIST ACTION */}
      {totalMeals > 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
          <Sparkles className="size-6 text-accent" />
          <div>
            <p className="font-serif text-2xl">Ready to shop?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate a shopping list from your {totalMeals} planned meals
            </p>
          </div>
          <button
            onClick={generateShoppingList}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
          >
            <ShoppingBag className="size-4" />
            Generate Shopping List
          </button>
        </div>
      )}

      {/* RECIPE PICKER MODAL */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="flex h-[90vh] w-full max-w-2xl flex-col rounded-t-3xl border border-border bg-card sm:h-auto sm:max-h-[85vh] sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground">
                  Add to {pickerOpen.slot}
                </p>
                <h2 className="mt-1 font-serif text-2xl">
                  {new Date(pickerOpen.date).toLocaleDateString("en-KE", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h2>
              </div>
              <button
                onClick={() => {
                  setPickerOpen(null);
                  setPickerSearch("");
                }}
                className="rounded-lg p-2 transition hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Search className="size-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto p-4">
              {pickerRecipes.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No recipes found
                </p>
              ) : (
                <div className="grid gap-2">
                  {pickerRecipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => addMeal(r.id)}
                      disabled={saving}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition hover:border-accent hover:bg-accent/5 disabled:opacity-50"
                    >
                      <img
                        src={recipeImage(r, images) ?? undefined}
                        alt={imageAlt(r, images)}
                        className="size-14 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {r.totalTime} min · {formatCost(r.estimatedCost)} · {r.difficulty}
                        </p>
                      </div>
                      {saving && <Loader2 className="size-4 animate-spin text-accent" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTICE TOAST */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[90] flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
          <p className="text-sm font-medium">{notice}</p>
        </div>
      )}
    </div>
  );
}