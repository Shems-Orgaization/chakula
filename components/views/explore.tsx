// components/views/explore.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, Heart, Flame, Loader2, X } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { formatCost } from "@/lib/recommendations";
import { RecipeImage } from "@/components/recipe-image";

interface ExploreProps {
  recipes: Recipe[];
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  favorite: string[];
  toggle: (id: string) => void;
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
  showAll?: boolean;
  setShowAll?: (v: boolean) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalLoaded?: number;
  loading?: boolean;
}

const CATEGORIES = [
  "All",
  "Comrade Favorites",
  "Breakfast",
  "Quick Meals",
  "Ugali",
  "Rice",
  "Chapati",
  "Beans",
  "Ndengu",
  "Potatoes",
  "Eggs",
];

const BUDGETS: { label: string; value: number | null }[] = [
  { label: "Any budget", value: null },
  { label: "Under KES 100", value: 100 },
  { label: "Under KES 200", value: 200 },
  { label: "Under KES 300", value: 300 },
];

const TIMES: { label: string; value: number | null }[] = [
  { label: "Any time", value: null },
  { label: "Under 20 min", value: 20 },
  { label: "Under 45 min", value: 45 },
];

export function Explore({
  recipes: list,
  query,
  setQuery,
  category,
  setCategory,
  favorite,
  toggle,
  open,
  images = {},
  hasMore = false,
  isLoadingMore = false,
  onLoadMore = () => {},
  totalLoaded = 0,
  loading = false,
}: ExploreProps) {
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);

  const displayList = useMemo(
    () =>
      list.filter((r) => {
        if (
          category === "Comrade Favorites" &&
          !(r.isComradeFriendly || r.popularity >= 80)
        ) {
          return false;
        }
        if (maxBudget !== null && r.estimatedCost.max > maxBudget) return false;
        if (maxTime !== null && r.totalTime > maxTime) return false;
        return true;
      }),
    [list, category, maxBudget, maxTime],
  );

  const hasFilters =
    maxBudget !== null || maxTime !== null || category !== "All" || query !== "";

  const clearFilters = () => {
    setMaxBudget(null);
    setMaxTime(null);
    setCategory("All");
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Explore the menu</p>
        <h1 className="section-title mt-3">Find your next plate.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          Simple Kenyan meals, from ndengu to mukimo. Filter by what you can
          spend and how long you have.
        </p>
      </div>

      <div className="panel flex flex-col gap-4">
        <div className="search-box w-full sm:max-w-xl">
          <Search className="size-4 text-muted-foreground" />
          <input
            aria-label="Search meals"
            placeholder="Search meals, e.g. mukimo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="category-scroll flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-pill whitespace-nowrap ${
                category === c ? "filter-pill-active" : ""
              }`}
              onClick={() => setCategory(c)}
            >
              {c === "Comrade Favorites" && "🔥 "}
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.label}
              className={`filter-pill whitespace-nowrap ${
                maxBudget === b.value ? "filter-pill-active" : ""
              }`}
              onClick={() => setMaxBudget(b.value)}
            >
              {b.label}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          {TIMES.map((t) => (
            <button
              key={t.label}
              className={`filter-pill whitespace-nowrap ${
                maxTime === t.value ? "filter-pill-active" : ""
              }`}
              onClick={() => setMaxTime(t.value)}
            >
              {t.label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              <X className="size-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <Loader2 className="mb-3 size-6 animate-spin text-accent" />
          <p className="text-muted-foreground">Loading recipes…</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No meals match these filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-accent underline hover:no-underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {displayList.length} meal{displayList.length === 1 ? "" : "s"}
          </p>

          <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayList.map((r) => {
              return (
                <article
                  className="recipe-card relative overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
                  key={r.id}
                >
                  <button className="block w-full" onClick={() => open(r)}>
                    <RecipeImage
                      recipe={r}
                      images={images}
                      className="aspect-[1.2] w-full object-cover"
                    />
                  </button>

                  <button
                    className={`absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition hover:scale-110 ${
                      favorite.includes(r.id)
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                    }`}
                    onClick={() => toggle(r.id)}
                    aria-label="Save meal"
                  >
                    <Heart
                      className={`size-4 ${
                        favorite.includes(r.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {r.isComradeFriendly && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                      <Flame className="size-3" />
                      Comrade
                    </div>
                  )}

                  <button
                    className="block w-full p-4 text-left"
                    onClick={() => open(r)}
                  >
                    <p className="eyebrow text-accent">
                      {r.category} · {r.mealType}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl transition-colors">
                      {r.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                      {r.description}
                    </p>
                    <div className="mt-4 flex gap-3 text-xs font-semibold text-muted-foreground">
                      <span>{r.totalTime} min</span>
                      <span>{formatCost(r.estimatedCost)}</span>
                      <span>{r.difficulty}</span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center gap-3 py-6">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Load more meals</>
                )}
              </button>
            </div>
          )}

          {!hasMore && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              That&apos;s all {totalLoaded} meals for now.
            </p>
          )}
        </>
      )}
    </div>
  );
}