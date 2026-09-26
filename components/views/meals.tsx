// components/views/meals.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Heart, ChefHat, PenSquare, Library, Search, Star, Flame,
  Clock3, Plus, Loader2, TrendingUp, Edit3, Trash2, X, Check
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";
import { MiniCard } from "@/components/mini-card";
import { RecipePlaceholder } from "@/components/recipe-placeholder";
import { Collections } from "./collections";
import { UserRecipeForm } from "@/components/user-recipe-form";

interface MealsProps {
  catalog: Recipe[];
  loved: Recipe[];
  history: string[];
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
}

interface CookingLogEntry {
  id: string;
  recipe_id: string | null;
  user_recipe_id: string | null;
  recipe_name: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  photo_url: string | null;
}

interface CookStats {
  [key: string]: {
    count: number;
    lastCooked: string;
    avgRating: number | null;
  };
}

interface UserRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  meal_type: string;
  difficulty: string;
  total_time_minutes: number;
  servings: number;
  cost_min_kes: number;
  cost_max_kes: number;
  ingredients: { name: string; amount: string }[];
  instructions: string[];
  image_url: string | null;
  tags: string[];
  dietary_tags: string[];
}

type Tab = "favorites" | "cooked" | "mine" | "collections";

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export function Meals({ catalog, loved, history, open, images = {} }: MealsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "most-cooked" | "top-rated" | "name">("recent");
  const [cookingLog, setCookingLog] = useState<CookingLogEntry[]>([]);
  const [cookStats, setCookStats] = useState<CookStats>({});
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collectionsCount, setCollectionsCount] = useState(0);

  // ✅ FORM STATE
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<UserRecipe | null>(null);

  // ✅ LOG COOK MODAL
  const [showLogCookModal, setShowLogCookModal] = useState(false);
  const [logSearch, setLogSearch] = useState("");

  // ✅ DELETE STATE
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build catalog map
  const catalogMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    for (const r of catalog) {
      map.set(r.id, r);
      if (r.slug) map.set(r.slug, r);
    }
    return map;
  }, [catalog]);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [mealsRes, collectionsRes] = await Promise.all([
        fetch("/api/meals"),
        fetch("/api/collections"),
      ]);
      const data = await mealsRes.json();
      const collectionsData = await collectionsRes.json();
      setCookingLog(data.cookingLog ?? []);
      setCookStats(data.cookStats ?? {});
      setUserRecipes(data.userRecipes ?? []);
      setFavorites(data.favorites ?? []);
      setCollectionsCount((collectionsData.collections ?? []).length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (catalog.length > 0) setLoading(false);
  }, [catalog.length]);

  // ---- STATS ----
  const stats = useMemo(() => {
    const totalCooks = cookingLog.length;
    const now = new Date();
    const thisMonth = cookingLog.filter((l) => {
      const d = new Date(l.cooked_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const cookDays = new Set(cookingLog.map((l) => l.cooked_at.split("T")[0]));
    let streak = 0;
    const checkDate = new Date();
    while (cookDays.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      favoritesCount: favorites.length,
      cookedCount: totalCooks,
      myRecipesCount: userRecipes.length,
      collectionsCount,
      thisMonth,
      streak,
    };
  }, [favorites, cookingLog, userRecipes, collectionsCount]);

  // ---- FAVORITES ----
  const favoriteRecipes = useMemo(() => {
    const map = new Map<string, Recipe>();
    for (const r of loved) map.set(r.id, r);
    for (const id of favorites) {
      const r = catalogMap.get(id);
      if (r) map.set(r.id, r);
    }
    return Array.from(map.values());
  }, [loved, favorites, catalogMap]);

  // ---- COOKED ----
  const cookedRecipes = useMemo(() => {
    const unique = new Map<string, { recipe: Recipe; count: number; lastCooked: string; avgRating: number | null }>();
    for (const entry of cookingLog) {
      const key = entry.recipe_id || entry.user_recipe_id;
      if (!key || unique.has(key)) continue;
      if (entry.recipe_id) {
        const r = catalogMap.get(entry.recipe_id);
        if (r) {
          const stat = cookStats[key] || { count: 1, lastCooked: entry.cooked_at, avgRating: null };
          unique.set(key, { recipe: r, ...stat });
        }
      }
    }
    return Array.from(unique.values());
  }, [cookingLog, cookStats, catalogMap]);

  // ---- FILTERS ----
  const filteredFavorites = useMemo(() => {
    let list = [...favoriteRecipes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "most-cooked")
      list.sort((a, b) => (cookStats[b.id]?.count ?? 0) - (cookStats[a.id]?.count ?? 0));
    else if (sortBy === "top-rated")
      list.sort((a, b) => (cookStats[b.id]?.avgRating ?? 0) - (cookStats[a.id]?.avgRating ?? 0));
    return list;
  }, [favoriteRecipes, search, sortBy, cookStats]);

  const filteredCooked = useMemo(() => {
    let list = [...cookedRecipes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.recipe.name.toLowerCase().includes(q));
    }
    if (sortBy === "most-cooked") list.sort((a, b) => b.count - a.count);
    else if (sortBy === "top-rated") list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    else if (sortBy === "name") list.sort((a, b) => a.recipe.name.localeCompare(b.recipe.name));
    else list.sort((a, b) => new Date(b.lastCooked).getTime() - new Date(a.lastCooked).getTime());
    return list;
  }, [cookedRecipes, search, sortBy]);

  const filteredUserRecipes = useMemo(() => {
    let list = [...userRecipes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [userRecipes, search, sortBy]);

  // ✅ Quick recipes for logging cook
  const loggableRecipes = useMemo(() => {
    if (!logSearch) return catalog.slice(0, 20);
    const q = logSearch.toLowerCase();
    return catalog.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 20);
  }, [catalog, logSearch]);

  // ✅ LOG A COOK
  const logCook = async (recipe: Recipe) => {
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_id: recipe.id,
          recipe_name: recipe.name,
        }),
      });
      setShowLogCookModal(false);
      setLogSearch("");
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE USER RECIPE
  const deleteUserRecipe = async (id: string) => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/user-recipes?id=${id}`, { method: "DELETE" });
      setUserRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && catalog.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your collection</p>
          <h1 className="section-title mt-3">My meals.</h1>
          <p className="mt-3 text-muted-foreground">
            Your personal cooking journey — favorites, history, and creations.
          </p>
        </div>

        {/* ✅ CONTEXT-AWARE ACTION BUTTON */}
        <div className="flex gap-2">
          {activeTab === "mine" && (
            <button
              onClick={() => {
                setEditingRecipe(null);
                setShowRecipeForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Add Recipe
            </button>
          )}
          {activeTab === "cooked" && (
            <button
              onClick={() => setShowLogCookModal(true)}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Log a Cook
            </button>
          )}
          {activeTab === "favorites" && (
            <button
              onClick={() => open(catalog[0])}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
            >
              <Heart className="size-4" />
              Find favorites
            </button>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => setActiveTab("favorites")}
          className="rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-red-500">
            <Heart className="size-4" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Favorites</p>
          </div>
          <p className="mt-2 font-serif text-3xl">{stats.favoritesCount}</p>
        </button>
        <button
          onClick={() => setActiveTab("cooked")}
          className="rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-orange-500">
            <ChefHat className="size-4" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cooked</p>
          </div>
          <p className="mt-2 font-serif text-3xl">{stats.cookedCount}</p>
          {stats.thisMonth > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              <TrendingUp className="inline size-3" /> {stats.thisMonth} this month
            </p>
          )}
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className="rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-accent">
            <PenSquare className="size-4" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">My Recipes</p>
          </div>
          <p className="mt-2 font-serif text-3xl">{stats.myRecipesCount}</p>
        </button>
        <button
          onClick={() => setActiveTab("collections")}
          className="rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-2 text-purple-500">
            <Library className="size-4" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Collections</p>
          </div>
          <p className="mt-2 font-serif text-3xl">{stats.collectionsCount}</p>
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5">
        {[
          { key: "favorites" as Tab, label: "Favorites", icon: Heart, count: stats.favoritesCount },
          { key: "cooked" as Tab, label: "Cooked", icon: ChefHat, count: stats.cookedCount },
          { key: "mine" as Tab, label: "My Recipes", icon: PenSquare, count: stats.myRecipesCount },
          { key: "collections" as Tab, label: "Collections", icon: Library, count: stats.collectionsCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
              <span className={`rounded-full px-1.5 text-xs ${isActive ? "bg-accent-foreground/20" : "bg-secondary"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH + SORT */}
      {activeTab !== "collections" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:max-w-md">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your meals..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none"
          >
            <option value="recent">Recent</option>
            <option value="most-cooked">Most Cooked</option>
            <option value="top-rated">Top Rated</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      )}

      {/* ============ FAVORITES ============ */}
      {activeTab === "favorites" && (
        filteredFavorites.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((r) => {
              const stat = cookStats[r.id];
              return (
                <div key={r.id} className="group relative">
                  <MiniCard recipe={r} open={() => open(r)} images={images} />
                  {(stat?.count || stat?.avgRating) && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {stat.avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-500 text-yellow-500" />
                          {stat.avgRating}
                        </span>
                      )}
                      {stat.count > 1 && (
                        <span className="flex items-center gap-1">
                          <ChefHat className="size-3" />
                          Made {stat.count}×
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            text="Tap the heart ❤️ on any recipe in Explore and it'll show up here."
          />
        )
      )}

      {/* ============ COOKED ============ */}
      {activeTab === "cooked" && (
        filteredCooked.length ? (
          <div className="flex flex-col gap-3">
            {filteredCooked.map(({ recipe, count, lastCooked, avgRating }) => {
              const img = recipeImage(recipe, images);
              return (
                <button
                  key={recipe.id}
                  onClick={() => open(recipe)}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-accent/50 hover:shadow-md"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl">
                    {img ? (
                      <img src={img} alt={imageAlt(recipe, images)} className="size-full object-cover" />
                    ) : (
                      <RecipePlaceholder name={recipe.name} category={recipe.category} showName={false} className="!aspect-auto h-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg truncate">{recipe.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {timeAgo(lastCooked)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ChefHat className="size-3" />
                        Made {count}×
                      </span>
                      {avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-500 text-yellow-500" />
                          {avgRating}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                    Cook again
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={ChefHat}
            title="Nothing cooked yet"
            text="Open any recipe and tap 'Let's cook' — or use 'Log a Cook' above to add a past meal."
            action={
              <button
                onClick={() => setShowLogCookModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                Log your first cook
              </button>
            }
          />
        )
      )}

      {/* ============ MY RECIPES ============ */}
      {activeTab === "mine" && (
        filteredUserRecipes.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUserRecipes.map((r) => (
              <div
                key={r.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
              >
                <div className="relative aspect-[1.2] flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="size-full object-cover" />
                  ) : (
                    <PenSquare className="size-12 text-accent/40" />
                  )}
                  {/* Hover actions */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRecipe(r);
                        setShowRecipeForm(true);
                      }}
                      className="rounded-lg bg-background/90 p-1.5 backdrop-blur transition hover:bg-background"
                      aria-label="Edit"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUserRecipe(r.id);
                      }}
                      disabled={deletingId === r.id}
                      className="rounded-lg bg-background/90 p-1.5 backdrop-blur transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="eyebrow text-accent">{r.category} · {r.meal_type}</p>
                  <h3 className="mt-1 font-serif text-xl">{r.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-3 flex gap-3 text-xs font-semibold text-muted-foreground">
                    <span>{r.total_time_minutes} min</span>
                    <span>KES {r.cost_min_kes}-{r.cost_max_kes}</span>
                    <span>{r.difficulty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PenSquare}
            title="No recipes yet"
            text="Create your own recipes and keep them forever."
            action={
              <button
                onClick={() => {
                  setEditingRecipe(null);
                  setShowRecipeForm(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                Create your first recipe
              </button>
            }
          />
        )
      )}

      {/* ============ COLLECTIONS ============ */}
      {activeTab === "collections" && <Collections open={open} images={images} />}

      {/* ============ RECIPE FORM MODAL ============ */}
      {showRecipeForm && (
        <UserRecipeForm
          recipe={editingRecipe}
          onClose={() => {
            setShowRecipeForm(false);
            setEditingRecipe(null);
          }}
          onSaved={async () => {
            setShowRecipeForm(false);
            setEditingRecipe(null);
            await loadData();
          }}
        />
      )}

      {/* ============ LOG COOK MODAL ============ */}
      {showLogCookModal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl border border-border bg-card sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Add to history</p>
                <h3 className="mt-1 font-serif text-2xl">Log a cook</h3>
              </div>
              <button
                onClick={() => setShowLogCookModal(false)}
                className="rounded-lg p-2 transition hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <Search className="size-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search recipes you cooked..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {loggableRecipes.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No recipes found
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {loggableRecipes.map((r) => {
                    const img = recipeImage(r, images);
                    return (
                      <button
                        key={r.id}
                        onClick={() => logCook(r)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5 text-left transition hover:border-accent hover:bg-accent/5"
                      >
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg">
                          {img ? (
                            <img src={img} alt={imageAlt(r, images)} className="size-full object-cover" />
                          ) : (
                            <RecipePlaceholder name={r.name} category={r.category} showName={false} className="!aspect-auto h-full" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{r.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {r.totalTime} min · {formatCost(r.estimatedCost)}
                          </p>
                        </div>
                        <Check className="size-4 shrink-0 text-accent" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ EMPTY STATE ============
function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: any;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 text-center">
      <Icon className="size-12 text-muted-foreground/40" />
      <p className="mt-4 font-serif text-2xl">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}