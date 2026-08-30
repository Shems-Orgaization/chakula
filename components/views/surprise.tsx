// components/views/surprise.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  Clock3,
  ShoppingBag,
  ChefHat,
  Heart,
  Filter,
  Shuffle,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { formatCost, rankRecipes, type Match } from "@/lib/recommendations";
import { recipeImage, imageAlt } from "@/lib/image-overrides";

interface SurpriseProps {
  catalog: Recipe[]; // ← Live data from backend
  onCook: (recipe: Recipe) => void;
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
  onSave?: (id: string) => void;
  favorites?: string[];
}

export function Surprise({
  catalog,
  onCook,
  open,
  images = {},
  onSave,
  favorites = [],
}: SurpriseProps) {
  const [budget, setBudget] = useState(250);
  const [time, setTime] = useState(45);
  const [mealType, setMealType] = useState<Recipe["mealType"] | undefined>();
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Recipe[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(catalog.map((r) => r.category));
    return ["All", ...Array.from(cats)];
  }, [catalog]);

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateSurprise = () => {
    setLoading(true);

    // Simulate small delay for UX (but data is real from catalog)
    setTimeout(() => {
      // 1. Get ranked matches based on filters – uses live catalog
      const ranked = rankRecipes(
        catalog,
        { budget, maxTime: time, pantry: [], bachelor: false, mealType },
        {}
      );

      // 2. Apply additional filters
      let filtered = ranked;
      if (difficulty) {
        filtered = filtered.filter((m) => m.recipe.difficulty === difficulty);
      }
      if (category && category !== "All") {
        filtered = filtered.filter((m) => m.recipe.category === category);
      }

      // 3. Take the top 20 matches and shuffle them
      const topMatches = filtered.slice(0, 20);
      const shuffledMatches = shuffleArray(topMatches);

      // 4. Pick the first 6 as the final results
      const selected = shuffledMatches.slice(0, 6);
      setResults(selected);

      // 5. Add the first result to history (if any)
      if (selected.length > 0) {
        setHistory((prev) =>
          [selected[0].recipe, ...prev.filter((r) => r.id !== selected[0].recipe.id)].slice(
            0, 10
          )
        );
      }

      setLoading(false);
    }, 600);
  };

  // Auto-generate on first load
  useEffect(() => {
    if (catalog.length > 0 && results.length === 0) {
      generateSurprise();
    }
  }, [catalog]);

  const handleCook = (recipe: Recipe) => {
    onCook(recipe);
    open(recipe);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-accent/5 to-background border border-accent/20 p-8 md:p-12">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            <Sparkles className="size-4" />
            Let us decide
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight">
            What's for
            <br />
            <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
              dinner today?
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            We'll pick a few great options from our collection – you choose the one that calls to you.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={generateSurprise}
              disabled={loading}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:scale-105 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Sparkles className="size-5 animate-spin" />
                  Finding options...
                </>
              ) : (
                <>
                  <Sparkles className="size-5 transition-transform group-hover:rotate-12" />
                  Surprise Me!
                </>
              )}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-secondary"
            >
              <Filter className="size-4" />
              {showFilters ? "Hide filters" : "Customize"}
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      {/* Floating Filters Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showFilters ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl">Customize your surprise</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-lg p-1.5 hover:bg-secondary transition"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <label className="field-label">
              <span className="flex items-center justify-between">
                Budget <span className="text-accent font-semibold">KES {budget}</span>
              </span>
              <input
                type="range"
                min="80"
                max="600"
                step="10"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-accent mt-1"
              />
            </label>

            <label className="field-label">
              <span className="flex items-center justify-between">
                Time <span className="text-accent font-semibold">{time} min</span>
              </span>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full accent-accent mt-1"
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
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
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

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="field-label mb-1">Category</p>
              <select
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                value={category || "All"}
                onChange={(e) =>
                  setCategory(e.target.value === "All" ? undefined : e.target.value)
                }
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateSurprise}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              <Sparkles className="size-4" />
              Apply & Surprise
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card">
          <div className="relative">
            <div className="size-16 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
            <Sparkles className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-accent" />
          </div>
          <p className="mt-4 text-muted-foreground">Finding the perfect meals...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          {/* Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((match) => (
              <div
                key={match.recipe.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-[1.6] w-full overflow-hidden">
                  <img
                    src={recipeImage(match.recipe, images)}
                    alt={imageAlt(match.recipe, images)}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {/* Match badge */}
                  <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {match.score}% match
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-serif text-xl leading-tight">{match.recipe.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {match.recipe.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {match.recipe.totalTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="size-3.5" />
                      {formatCost(match.recipe.estimatedCost)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="size-3.5" />
                      {match.recipe.difficulty}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleCook(match.recipe)}
                      className="flex-1 rounded-xl bg-accent px-4 py-2 text-center text-sm font-semibold text-accent-foreground transition hover:opacity-90"
                    >
                      Cook this
                    </button>
                    {onSave && (
                      <button
                        onClick={() => onSave(match.recipe.id)}
                        className={`rounded-xl border p-2 transition ${
                          favorites.includes(match.recipe.id)
                            ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-950/30"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        <Heart
                          className={`size-4 ${
                            favorites.includes(match.recipe.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Found {results.length} great options
              </p>
              <span className="text-xs text-accent">✨ Surprise level: fresh</span>
            </div>
            <button
              onClick={generateSurprise}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 font-semibold transition hover:bg-secondary"
            >
              <Shuffle className="size-4" />
              Shuffle again
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card">
          <div className="rounded-full bg-accent/10 p-4">
            <Sparkles className="size-8 text-accent" />
          </div>
          <h2 className="mt-4 font-serif text-2xl">Ready when you are</h2>
          <p className="mt-2 text-center text-muted-foreground">
            Click "Surprise Me!" and we'll show you a delicious selection.
          </p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && results.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">Recently surprised</p>
            <span className="text-xs text-muted-foreground">Your last {history.length} picks</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.slice(0, 5).map((recipe) => (
              <div
                key={recipe.id}
                className="min-w-[120px] cursor-pointer rounded-xl border border-border p-2 transition hover:shadow-md"
                onClick={() => open(recipe)}
              >
                <img
                  src={recipeImage(recipe, images)}
                  alt={recipe.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <p className="mt-1 text-xs font-semibold truncate">{recipe.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}