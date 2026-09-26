// components/views/surprise.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Clock3, ShoppingBag, ChefHat, Heart, Filter, Shuffle,
  X, TrendingUp, Zap, Wallet, Salad, PartyPopper, Loader2,
  RefreshCw, History
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { formatCost } from "@/lib/recommendations";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { RecipePlaceholder } from "@/components/recipe-placeholder";

interface Suggestion {
  recipe: Recipe;
  score: number;
  pantryMatches: string[];
  reasons: string[];
  isNew: boolean;
}

interface SurpriseProps {
  catalog: Recipe[];
  onCook: (recipe: Recipe) => void;
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
  onSave?: (id: string) => void;
  favorites?: string[];
}

const MOODS = [
  { key: "quick", label: "Quick", icon: Zap, time: 20, budget: 300 },
  { key: "budget", label: "Budget", icon: Wallet, time: 60, budget: 150 },
  { key: "healthy", label: "Healthy", icon: Salad, time: 45, budget: 300 },
  { key: "party", label: "Party", icon: PartyPopper, time: 90, budget: 600 },
];

export function Surprise({
  onCook,
  open,
  images = {},
  onSave,
  favorites = [],
}: SurpriseProps) {
  const [budget, setBudget] = useState(300);
  const [time, setTime] = useState(45);
  const [mealType, setMealType] = useState<Recipe["mealType"] | undefined>();
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [history, setHistory] = useState<Suggestion[]>([]);

  // ---- LOAD SUGGESTIONS ----
  const generateSurprise = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        budget: String(budget),
        maxTime: String(time),
        count: "6",
      });
      if (mealType) params.set("mealType", mealType);
      if (difficulty) params.set("difficulty", difficulty);

      const res = await fetch(`/api/surprise?${params}`);
      const data = await res.json();

      const newSuggestions: Suggestion[] = data.suggestions ?? [];
      setSuggestions(newSuggestions);

      if (newSuggestions.length > 0) {
        setHistory((prev) => {
          const combined = [...newSuggestions, ...prev];
          const seen = new Set<string>();
          return combined
            .filter((s) => {
              if (seen.has(s.recipe.id)) return false;
              seen.add(s.recipe.id);
              return true;
            })
            .slice(0, 20);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [budget, time, mealType, difficulty]);

  useEffect(() => {
    generateSurprise();
  }, []);

  const applyMood = (moodKey: string) => {
    const mood = MOODS.find((m) => m.key === moodKey);
    if (!mood) return;
    if (activeMood === moodKey) {
      setActiveMood(null);
      setBudget(300);
      setTime(45);
    } else {
      setActiveMood(moodKey);
      setBudget(mood.budget);
      setTime(mood.time);
    }
  };

  useEffect(() => {
    if (initialLoad) return;
    const timer = setTimeout(() => generateSurprise(), 200);
    return () => clearTimeout(timer);
  }, [budget, time, mealType, difficulty]);

  const handleCook = (recipe: Recipe) => {
    void fetch("/api/surprise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipe.id, action: "cooked" }),
    });
    onCook(recipe);
    open(recipe);
  };

  const handleSave = (recipe: Recipe) => {
    void fetch("/api/surprise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: recipe.id, action: "saved" }),
    });
    onSave?.(recipe.id);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-card p-8 md:p-12">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            <Sparkles className="size-4" />
            Smart suggestions
          </div>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">
            Let us pick your next meal
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Personalized picks based on your pantry, budget, and time.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={generateSurprise}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground shadow-lg transition hover:scale-[1.02] hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Finding options...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  Surprise Me
                </>
              )}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              <Filter className="size-4" />
              {showFilters ? "Hide filters" : "Customize"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              const active = activeMood === mood.key;
              return (
                <button
                  key={mood.key}
                  onClick={() => applyMood(mood.key)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  <Icon className="size-4" />
                  {mood.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl">Customize your surprise</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg p-1.5 transition hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="field-label">
              <span className="flex items-center justify-between">
                Budget <span className="font-semibold text-accent">KES {budget}</span>
              </span>
              <input
                type="range"
                min="80"
                max="800"
                step="20"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </label>

            <label className="field-label">
              <span className="flex items-center justify-between">
                Time <span className="font-semibold text-accent">{time} min</span>
              </span>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </label>

            <div>
              <p className="field-label mb-1">Meal period</p>
              <div className="flex flex-wrap gap-1.5">
                {(["Breakfast", "Lunch", "Dinner"] as const).map((x) => (
                  <button
                    key={x}
                    onClick={() => setMealType(mealType === x ? undefined : x)}
                    className={`filter-pill text-xs ${
                      mealType === x ? "filter-pill-active" : ""
                    }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="field-label mb-1">Difficulty</p>
              <div className="flex flex-wrap gap-1.5">
                {(["Easy", "Medium"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(difficulty === d ? undefined : d)}
                    className={`filter-pill text-xs ${
                      difficulty === d ? "filter-pill-active" : ""
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={generateSurprise}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {initialLoad && loading ? (
        <LoadingState />
      ) : suggestions.length === 0 ? (
        <EmptyState onRetry={generateSurprise} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((match) => {
              const r = match.recipe;
              const isFav = favorites.includes(r.id);
              const img = recipeImage(r, images);
              return (
                <div
                  key={r.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[1.6] w-full overflow-hidden">
                    <button
                      onClick={() => open(r)}
                      className="block size-full"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={imageAlt(r, images)}
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <RecipePlaceholder
                          name={r.name}
                          category={r.category}
                          showName={false}
                          className="!aspect-auto h-full"
                        />
                      )}
                    </button>
                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {match.score}% match
                    </div>
                    {match.isNew && (
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        <Sparkles className="size-3" />
                        New
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-xl leading-tight">{r.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {r.description}
                    </p>

                    {match.reasons.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {match.reasons.slice(0, 2).map((reason, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3.5" />
                        {r.totalTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="size-3.5" />
                        {formatCost(r.estimatedCost)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="size-3.5" />
                        {r.difficulty}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleCook(r)}
                        className="flex-1 rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground transition hover:opacity-90"
                      >
                        Cook this
                      </button>
                      <button
                        onClick={() => handleSave(r)}
                        className={`rounded-xl border p-2 transition ${
                          isFav
                            ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-950/30"
                            : "border-border hover:bg-secondary"
                        }`}
                        aria-label="Save"
                      >
                        <Heart className={`size-4 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-accent" />
              <p className="text-sm text-muted-foreground">
                {suggestions.length} personalized picks
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateSurprise}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 font-semibold transition hover:bg-secondary disabled:opacity-60"
              >
                <Shuffle className="size-4" />
                Shuffle again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 6 && (
        <div className="mt-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <p className="eyebrow">Recently shown</p>
            </div>
            <span className="text-xs text-muted-foreground">
              Last {Math.min(history.length, 12)} picks
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.slice(6, 12).map((s) => {
              const img = recipeImage(s.recipe, images);
              return (
                <div
                  key={s.recipe.id}
                  onClick={() => open(s.recipe)}
                  className="min-w-[140px] cursor-pointer rounded-xl border border-border bg-card p-2 transition hover:shadow-md"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={s.recipe.name}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-lg">
                      <RecipePlaceholder
                        name={s.recipe.name}
                        category={s.recipe.category}
                        showName={false}
                        className="aspect-square !aspect-square"
                      />
                    </div>
                  )}
                  <p className="mt-1 truncate text-xs font-semibold">
                    {s.recipe.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ LOADING STATE ============
function LoadingState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card">
      <div className="relative">
        <div className="size-16 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        <Sparkles className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-accent" />
      </div>
      <p className="mt-4 text-muted-foreground">Finding the perfect meals...</p>
    </div>
  );
}

// ============ EMPTY STATE ============
function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card">
      <div className="rounded-full bg-accent/10 p-4">
        <Sparkles className="size-8 text-accent" />
      </div>
      <h2 className="mt-4 font-serif text-2xl">No matches found</h2>
      <p className="mt-2 max-w-md text-center text-muted-foreground">
        Try adjusting your filters — more budget, more time, or different meal type.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground transition hover:opacity-90"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  );
}