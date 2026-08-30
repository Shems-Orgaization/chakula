// components/food-app.tsx
"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";

import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { recipeService, type Recipe } from "@/lib/recipes";
import { rankRecipes, type Match } from "@/lib/recommendations";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { imageOverrideStorageKey } from "@/lib/image-overrides";
import { read } from "@/lib/storage";
import { View, MealType } from "@/lib/types";

import { Dashboard } from "@/components/views/dashboard";
import { Explore } from "@/components/views/explore";
import { Pantry } from "@/components/views/pantry";
import { Surprise } from "@/components/views/surprise";
import { Detail } from "@/components/views/detail";
import { Planner } from "@/components/views/planner";
import { Meals } from "@/components/views/meals";
import { Shopping } from "@/components/views/shopping";
import { ProfileComponent } from "@/components/views/profile";
import { SettingsComponent } from "@/components/views/settings";

const store = {
  favorites: "food-favorites",
  history: "food-history",
  pantry: "food-pantry",
  shopping: "food-shopping",
  theme: "food-theme",
  reminders: "food-reminders",
};

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Unable to load recipes");
    return response.json();
  });

export function FoodApp({
  initialView = "home",
  selectedId,
}: {
  initialView?: View;
  selectedId?: string;
}) {
  const router = useRouter();

  // ----- DATA -----
  const { data: catalogResponse } = useSWR<{ recipes: Recipe[] }>(
    "/api/recipes?limit=100",
    fetcher
  );
  const catalog = catalogResponse?.recipes ?? [];

  // ----- USER -----
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // ----- APP STATE -----
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [pantry, setPantry] = useState<string[]>([]);
  const [shopping, setShopping] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [result, setResult] = useState<Match | null>(null);
  const [reminders, setReminders] = useState({
    morning: true,
    lunch: true,
    evening: true,
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [budget, setBudget] = useState(250);
  const [time, setTime] = useState(45);
  const [mealType, setMealType] = useState<MealType>();
  const [mounted, setMounted] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  // ----- SIDEBAR STATE -----
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ----- LOAD SIDEBAR STATE -----
  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  // ----- LOAD USER DATA -----
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      if (!active) return;

      setUserId(data.user.id);
      setUserEmail(data.user.email || "");
      setUserName(data.user.user_metadata?.display_name || "User");

      const response = await fetch("/api/preferences");
      const payload = response.ok ? await response.json() : {};
      const prefs = payload.preferences;

      setFavorites(prefs?.favorites ?? read(store.favorites, []));
      setHistory(prefs?.history ?? read(store.history, []));
      setPantry(prefs?.pantry ?? read(store.pantry, []));

      const shoppingResponse = await fetch("/api/shopping");
      const shoppingPayload = shoppingResponse.ok ? await shoppingResponse.json() : null;
      setShopping(
        shoppingPayload?.items?.map((item: { ingredient_name: string }) => item.ingredient_name) ??
          prefs?.shopping ??
          read(store.shopping, [])
      );

      setDark(read<string>(store.theme, "light") === "dark");
      setReminders(
        prefs?.reminders ?? read(store.reminders, { morning: true, lunch: true, evening: true })
      );
      setImageOverrides(prefs?.image_overrides ?? read(imageOverrideStorageKey, {}));

      setMounted(true);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  // ----- SYNC PREFERENCES -----
  useEffect(() => {
    if (!mounted || !userId) return;
    document.documentElement.classList.toggle("dark", dark);
    void fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favorites,
        history,
        pantry,
        shopping,
        reminders,
        image_overrides: imageOverrides,
      }),
    });
  }, [favorites, history, pantry, shopping, dark, reminders, imageOverrides, mounted, userId]);

  // ----- REMINDERS -----
  useEffect(() => {
    const hour = new Date().getHours();
    const period = hour < 11 ? "morning" : hour < 16 ? "lunch" : "evening";
    if (!reminders[period as keyof typeof reminders] || !mounted) return;
    setNotice(`${period[0].toUpperCase() + period.slice(1)} food o'clock — try something chap chap?`);
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [mounted, reminders]);

  // ----- LOAD SELECTED RECIPE (for direct detail page) -----
  useEffect(() => {
    if (initialView === "detail" && selectedId && catalog.length > 0) {
      const found = catalog.find((r) => r.id === selectedId);
      if (found) {
        setSelected(found);
        setView("detail");
      } else {
        // If not found in catalog, redirect to browse
        setView("browse");
        router.push("/explore");
      }
    }
  }, [initialView, selectedId, catalog, router]);

  // ----- ACTIONS -----
  const open = (recipe: Recipe) => {
    setSelected(recipe);
    setView("detail");
    router.push(`/recipe/${recipe.id}`);
  };

  const toggle = (id: string) =>
    setFavorites((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );

  const cook = (recipe: Recipe) => {
    setHistory((current) =>
      [recipe.id, ...current.filter((v) => v !== recipe.id)].slice(0, 20)
    );
    setShopping((current) => [
      ...new Set([
        ...current,
        ...recipe.ingredients.map((ingredient: { name: string }) => ingredient.name),
      ]),
    ]);
  };

  // ----- EXPLORE -----
  const browse = useMemo(
    () =>
      catalog.filter(
        (recipe) =>
          (category === "All" ||
            recipe.category === category ||
            (category === "Breakfast" && recipe.mealType === "Breakfast")) &&
          recipe.name.toLowerCase().includes(query.toLowerCase())
      ),
    [category, query, catalog]
  );

  // ----- FAVORITES -----
  const loved = favorites.map((id) => recipeService.get(id)).filter(Boolean) as Recipe[];

  // ----- RECOMMENDATION -----
  const recommend = (type?: MealType) => {
    const ranked = rankRecipes(
      catalog,
      { budget, maxTime: time, pantry, bachelor: false, mealType: type },
      {}
    );
    setResult(ranked[0] ?? null);
    setView("surprise");
    router.push("/?view=surprise");
  };

  // ----- NAVIGATION -----
  const nav = (next: View | string) => {
    const target = next as View;
    setView(target);
    setMobileOpen(false);

    // Only push routes for views that have dedicated pages.
    // Detail is handled by open(), profile and settings stay in-app.
    const paths: Partial<Record<View, string>> = {
      home: "/",
      browse: "/explore",
      pantry: "/pantry",
      planner: "/planner",
      meals: "/meals",
      shopping: "/shopping",
      surprise: "/?view=surprise",
      // detail, profile, settings are NOT pushed
    };

    if (paths[target]) {
      router.push(paths[target] as string);
    }
  };

  // ----- LAYOUT WIDTH -----
  const contentOffset = sidebarCollapsed ? "md:pl-[72px]" : "md:pl-[280px]";

  // ----- RENDER -----
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        active={view}
        onNavigate={nav}
        dark={dark}
        onToggleTheme={() => setDark(!dark)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />

      <div className={`${contentOffset} transition-[padding] duration-300`}>
        <Topbar
          view={view}
          shoppingCount={shopping.length}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onShowNotice={setNotice}
          onNavigate={nav}
        />

        <main className="w-full px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          {view === "home" && (
            <Dashboard
              recipes={catalog}
              onNavigate={nav}
              onRecommend={(type?: string) => recommend(type as MealType)}
              loved={loved}
              open={open}
              pantry={pantry}
              reminders={reminders}
              setReminders={setReminders}
              images={imageOverrides}
            />
          )}

          {view === "browse" && (
            <Explore
              recipes={browse}
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              favorite={favorites}
              toggle={toggle}
              open={open}
              images={imageOverrides}
            />
          )}

          {view === "pantry" && (
            <Pantry
              recipes={catalog}
              pantry={pantry}
              setPantry={setPantry}
              open={open}
              shopping={shopping}
              setShopping={setShopping}
            />
          )}

          {view === "surprise" && (
            <Surprise
              catalog={catalog}
              onCook={cook}
              open={open}
              images={imageOverrides}
              onSave={toggle}
              favorites={favorites}
            />
          )}

          {view === "detail" && selected && (
            <Detail
              recipe={selected}
              favorite={favorites.includes(selected.id)}
              toggle={() => toggle(selected.id)}
              cook={() => cook(selected)}
              onBack={() => nav("browse")}
              images={imageOverrides}
              onImageChange={setImageOverrides}
            />
          )}

          {view === "planner" && (
            <Planner
              recipes={catalog}
              history={history}
              open={open}
              shopping={shopping}
              images={imageOverrides}
            />
          )}

          {view === "meals" && (
            <Meals
              loved={loved}
              history={history}
              open={open}
              images={imageOverrides}
            />
          )}

          {view === "shopping" && <Shopping items={shopping} setItems={setShopping} />}

          {view === "profile" && <ProfileComponent />}
          {view === "settings" && <SettingsComponent />}
        </main>
      </div>

      {/* Notification toast */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <Bell className="size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium">{notice}</p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="ml-auto rounded-lg p-1 transition-colors hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}