// components/views/explore.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bean, Check, Clock3, Flame, Heart, LayoutGrid, Loader2, Pizza, Search,
  SlidersHorizontal, Soup, Sparkles, Sunrise, Utensils, Wheat, X, Zap,
  type LucideIcon,
} from "lucide-react";
import { useAssistant } from "@/components/assistant-provider";

import { type Recipe } from "@/lib/recipes";
import { RecipeImage } from "@/components/recipe-image";
import { pantryHits } from "@/lib/pantry";

interface ExploreProps {
  recipes: Recipe[];
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  favorite: string[];
  toggle: (id: string) => void;
  open: (recipe: Recipe) => void;
  pantry: string[];
  userBudget: number;
  images?: Record<string, string>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalLoaded?: number;
  loading?: boolean;
}

type Sort = "match" | "cheapest" | "quickest";
interface Ranked {
  recipe: Recipe;
  hits: number;
}

const SORTS: Record<Sort, (a: Ranked, b: Ranked) => number> = {
  match: (a, b) => b.hits - a.hits || a.recipe.estimatedCost.max - b.recipe.estimatedCost.max,
  cheapest: (a, b) => a.recipe.estimatedCost.max - b.recipe.estimatedCost.max,
  quickest: (a, b) => a.recipe.totalTime - b.recipe.totalTime,
};

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "cheapest", label: "Cheapest" },
  { value: "quickest", label: "Quickest" },
];

const CATEGORIES = ["All", "Comrade picks", "Breakfast", "Quick Meals", "Ugali", "Rice", "Chapati", "Beans"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  All: LayoutGrid,
  "Comrade picks": Flame,
  Breakfast: Sunrise,
  "Quick Meals": Zap,
  Ugali: Wheat,
  Rice: Soup,
  Chapati: Pizza,
  Beans: Bean,
};

const BUDGETS: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Under 100", value: 100 },
  { label: "Under 200", value: 200 },
  { label: "Under 300", value: 300 },
];

const TIMES: { label: string; value: number | null }[] = [
  { label: "Any", value: null },
  { label: "Under 20 min", value: 20 },
  { label: "Under 45 min", value: 45 },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card" aria-hidden>
      <div className="aspect-[4/3] bg-secondary" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-3/4 rounded bg-secondary" />
        <div className="h-3.5 w-full rounded bg-secondary" />
      </div>
    </div>
  );
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
  pantry,
  userBudget,
  images = {},
  hasMore = false,
  isLoadingMore = false,
  onLoadMore = () => {},
  totalLoaded = 0,
  loading = false,
}: ExploreProps) {
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("match");
  const [usePantry, setUsePantry] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { openAssistant, registerFilters } = useAssistant();
  useEffect(() => {
    registerFilters((f) => {
      const prev = { maxBudget, maxTime, sort, usePantry, category, query };
      setMaxBudget(f.maxBudget ?? null);
      setMaxTime(f.maxTime ?? null);
      setSort(f.sort ?? "match");
      setUsePantry(f.usePantry === true && pantry.length > 0);
      setCategory(f.category ?? "All");
      setQuery(f.query ?? "");
      return () => {
        setMaxBudget(prev.maxBudget);
        setMaxTime(prev.maxTime);
        setSort(prev.sort);
        setUsePantry(prev.usePantry);
        setCategory(prev.category);
        setQuery(prev.query);
      };
    });
    return () => registerFilters(null);
  }, [registerFilters, maxBudget, maxTime, sort, usePantry, category, query, pantry.length, setCategory, setQuery]);

  const pantryOn = usePantry && pantry.length > 0;

  const ranked = useMemo<Ranked[]>(() => {
    const out: Ranked[] = [];
    for (const recipe of list) {
      if (category === "Comrade picks" && !(recipe.isComradeFriendly || recipe.popularity >= 80)) continue;
      if (maxBudget !== null && recipe.estimatedCost.max > maxBudget) continue;
      if (maxTime !== null && recipe.totalTime > maxTime) continue;
      const hits = pantryOn ? pantryHits(recipe, pantry) : 0;
      if (pantryOn && hits === 0) continue;
      out.push({ recipe, hits });
    }
    return out.sort(SORTS[sort]);
  }, [list, category, maxBudget, maxTime, pantryOn, pantry, sort]);

  const hasFilters =
    maxBudget !== null || maxTime !== null || category !== "All" || query !== "" || usePantry || sort !== "match";
  const activeCount = [maxBudget !== null, maxTime !== null, sort !== "match", usePantry].filter(Boolean).length;

  const clearFilters = () => {
    setMaxBudget(null);
    setMaxTime(null);
    setSort("match");
    setUsePantry(false);
    setCategory("All");
    setQuery("");
  };

  // Bottom sheet: Escape closes, page does not scroll behind it, focus moves in.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const chip = (active: boolean) => `filter-pill whitespace-nowrap ${active ? "filter-pill-active" : ""}`;

  const budgetChips = BUDGETS.map((b) => (
    <button key={b.label} type="button" aria-pressed={maxBudget === b.value} className={chip(maxBudget === b.value)} onClick={() => setMaxBudget(b.value)}>
      {b.label}
    </button>
  ));

  const timeChips = TIMES.map((t) => (
    <button key={t.label} type="button" aria-pressed={maxTime === t.value} className={chip(maxTime === t.value)} onClick={() => setMaxTime(t.value)}>
      {t.label}
    </button>
  ));

  const sortSelect = (
    <select
      aria-label="Sort meals"
      value={sort}
      onChange={(e) => {
        const found = SORT_OPTIONS.find((o) => o.value === e.target.value);
        if (found) setSort(found.value);
      }}
      className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const pantryToggle = (
    <button
      type="button"
      role="switch"
      aria-checked={usePantry}
      disabled={pantry.length === 0}
      title={pantry.length === 0 ? "Add items in Pantry first" : undefined}
      onClick={() => setUsePantry((v) => !v)}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        usePantry ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      <Check className="size-4" />
      Use my pantry
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="section-title">Find your next plate.</h1>
        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
          {loading ? "Loading meals…" : `${ranked.length} meal${ranked.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* STICKY FILTER BAR (sits under the 72px topbar) */}
      <div className="sticky top-[72px] z-20 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 md:max-w-sm md:flex-none md:basis-72">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search meals"
              placeholder="Search meals, e.g. mukimo"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold md:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                {activeCount}
              </span>
            )}
          </button>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <span className="mx-1 h-5 w-px bg-border" />
            {budgetChips}
            <span className="mx-1 h-5 w-px bg-border" />
            {timeChips}
            <span className="mx-1 h-5 w-px bg-border" />
            {sortSelect}
            {pantryToggle}
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 px-2 text-sm font-semibold text-accent hover:underline">
                <X className="size-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c] ?? Utensils;
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c)}
                className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] font-semibold transition ${
                  active ? "bg-secondary text-accent ring-1 ring-accent/40" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                <span className="whitespace-nowrap">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Search className="size-8 text-muted-foreground" />
          <p className="font-serif text-xl">No meals match these filters.</p>
          <button type="button" onClick={clearFilters} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
            Clear filters
          </button>
          <button
            type="button"
            onClick={() =>
              openAssistant({
                page: "explore",
                prompt: `No meals match my filters${query ? ` for "${query}"` : ""}. Suggest the closest alternatives.`,
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            <Sparkles className="size-4" />
            Ask Chakula
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {ranked.map(({ recipe, hits }) => {
              const saved = favorite.includes(recipe.id);
              const fits = recipe.estimatedCost.max <= userBudget;
              return (
                <article
                  key={recipe.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => open(recipe)}
                    aria-label={`Open ${recipe.name}`}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary"
                  >
                    <RecipeImage
                      recipe={recipe}
                      images={images}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      placeholderClassName="aspect-auto! h-full"
                    />
                    {fits && (
                      <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                        Fits your budget
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-highlight px-2.5 py-1 text-[11px] font-bold text-highlight-foreground">
                        KES {recipe.estimatedCost.min}–{recipe.estimatedCost.max}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground">
                        <Clock3 className="size-3" />
                        {recipe.totalTime} min
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle(recipe.id)}
                    aria-label={saved ? `Remove ${recipe.name} from saved` : `Save ${recipe.name}`}
                    aria-pressed={saved}
                    className={`absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition hover:scale-110 ${
                      saved ? "text-warm" : "text-muted-foreground hover:text-warm"
                    }`}
                  >
                    <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
                  </button>

                  <button type="button" onClick={() => open(recipe)} className="flex flex-1 flex-col p-3 text-left sm:p-4">
                    <h2 className="font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-accent sm:text-xl">
                      {recipe.name}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{recipe.description}</p>
                    {pantryOn && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-accent">
                        <Check className="size-3.5" />
                        {hits} of {recipe.ingredients.length} in your pantry
                      </p>
                    )}
                  </button>
                </article>
              );
            })}
          </div>

          {hasMore ? (
            <div className="flex justify-center py-4">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {isLoadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLoadingMore ? "Loading…" : "Load more meals"}
              </button>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">That&apos;s all {totalLoaded} meals for now.</p>
          )}
        </>
      )}

      {/* MOBILE FILTER SHEET */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-foreground/50" onClick={() => setSheetOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between">
              <h2 id="filters-title" className="font-serif text-2xl">
                Filters
              </h2>
              <button ref={closeRef} type="button" aria-label="Close filters" onClick={() => setSheetOpen(false)} className="rounded-lg p-2 hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>

            <p className="eyebrow mt-5">Budget</p>
            <div className="mt-2 flex flex-wrap gap-2">{budgetChips}</div>

            <p className="eyebrow mt-5">Time</p>
            <div className="mt-2 flex flex-wrap gap-2">{timeChips}</div>

            <p className="eyebrow mt-5">Sort by</p>
            <div className="mt-2">{sortSelect}</div>

            <div className="mt-5">{pantryToggle}</div>

            <div className="mt-6 flex gap-2">
              <button type="button" onClick={clearFilters} className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold hover:bg-secondary">
                Clear all
              </button>
              <button type="button" onClick={() => setSheetOpen(false)} className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90">
                Show {ranked.length} meal{ranked.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}