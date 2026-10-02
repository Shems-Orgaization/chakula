// components/views/explore.tsx
"use client";

import { Search, Heart, Flame, Globe, Loader2 } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";
import { RecipePlaceholder } from "@/components/recipe-placeholder";

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
  showAll = false,
  setShowAll = () => {},
  hasMore = false,
  isLoadingMore = false,
  onLoadMore = () => {},
  totalLoaded = 0,
  loading = false,
}: ExploreProps) {
  const cats = [
    "All",
    "Comrade Favorites",
    "Breakfast",
    "Street",
    "Quick Meals",
    "Rice",
    "Ugali",
    "Beans",
    "Ndengu",
    "Vegetables",
  ];

  const displayList =
    category === "Comrade Favorites"
      ? list.filter((r: any) => r.isComradeFriendly || r.popularity >= 80)
      : list;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Explore the menu</p>
        <h1 className="section-title mt-3">Find your next plate.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          From ndengu to smocha, find food that feels like home.
        </p>
      </div>

      <div className="panel flex flex-col gap-5">
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

        <div className="category-scroll flex gap-2 overflow-x-auto pb-2">
          {cats.map((c) => (
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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            {showAll ? (
              <>
                <Globe className="size-4 text-accent" />
                <span>All recipes</span>
              </>
            ) : (
              <>
                <Flame className="size-4 text-orange-500" />
                <span>Comrade-friendly meals only</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
          >
            {showAll ? "Show Comrade Only" : "Show All Recipes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <Loader2 className="size-6 animate-spin text-accent mb-3" />
          <p className="text-muted-foreground">Loading recipes…</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No recipes found. Try a different search.
          </p>
        </div>
      ) : (
        <>
          <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayList.map((r: any) => {
              const img = recipeImage(r, images);
              return (
                <article
                  className="recipe-card relative overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
                  key={r.id}
                >
                  <button className="block w-full" onClick={() => open(r)}>
                    {img ? (
                      <img
                        src={img}
                        alt={imageAlt(r, images)}
                        className="aspect-[1.2] w-full object-cover"
                      />
                    ) : (
                      <RecipePlaceholder
                        name={r.name}
                        category={r.category}
                        showName={false}
                      />
                    )}
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
                    <h2 className="mt-1 font-serif text-2xl group-hover:text-accent transition-colors">
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
            <div className="flex flex-col items-center gap-3 py-8">
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
                  <>Load More Recipes</>
                )}
              </button>
            </div>
          )}

          {!hasMore && displayList.length > 0 && (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-sm text-muted-foreground">
                🎉 You've seen all {totalLoaded} recipes!
              </p>
              {!showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm text-accent underline hover:no-underline"
                >
                  Show all recipes (including international)
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}