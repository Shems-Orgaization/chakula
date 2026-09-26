// components/food-app.tsx
"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
}

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

  // ----- PAGINATION STATE -----
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ----- DATA -----
  const { data: catalogResponse } = useSWR<RecipesResponse>(
    `/api/recipes?page=${page}&limit=50${showAll ? "&includeAll=true" : ""}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (catalogResponse?.recipes) {
      if (page === 1) {
        setAllRecipes(catalogResponse.recipes);
      } else {
        setAllRecipes((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newRecipes = catalogResponse.recipes.filter(
            (r) => !existingIds.has(r.id)
          );
          return [...prev, ...newRecipes];
        });
      }
      setHasMore(catalogResponse.hasMore);
    }
  }, [catalogResponse, page]);

  useEffect(() => {
    setPage(1);
    setAllRecipes([]);
    setHasMore(true);
    setCategory("All");
  }, [showAll]);

  const catalog = allRecipes;

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

  // ----- REMINDER FIRING (session dedup) -----
  const firedReminders = useRef<Set<string>>(new Set());

  // ----- LOAD MORE -----
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setPage((p) => p + 1);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    if (catalogResponse) {
      setIsLoadingMore(false);
    }
  }, [catalogResponse]);

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
      const shoppingPayload = shoppingResponse.ok
        ? await shoppingResponse.json()
        : null;
      setShopping(
        shoppingPayload?.items?.map(
          (item: { ingredient_name: string }) => item.ingredient_name
        ) ??
          prefs?.shopping ??
          read(store.shopping, [])
      );

      setDark(read<string>(store.theme, "light") === "dark");
      setReminders(
        prefs?.reminders ??
          read(store.reminders, { morning: true, lunch: true, evening: true })
      );
      setImageOverrides(
        prefs?.image_overrides ?? read(imageOverrideStorageKey, {})
      );

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
  }, [
    favorites,
    history,
    pantry,
    shopping,
    dark,
    reminders,
    imageOverrides,
    mounted,
    userId,
  ]);

  // ============================================================
  // ✅ REMINDER FIRING HOOK
  // ============================================================
  useEffect(() => {
    if (!mounted || !userId) return;

    let cancelled = false;

    const checkReminders = async () => {
      try {
        const res = await fetch("/api/reminders");
        if (!res.ok) return;
        const data = await res.json();
        const settings = data.settings ?? [];
        const history = data.history ?? [];

        if (cancelled) return;

        const now = new Date();
        const today = now.getDay() === 0 ? 7 : now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayStr = now.toISOString().split("T")[0];

        for (const setting of settings) {
          if (!setting.enabled) continue;
          if (!setting.days_of_week?.includes(today)) continue;

          const quietStart = setting.quiet_hours_start || "22:00";
          const quietEnd = setting.quiet_hours_end || "06:00";
          const [qsh, qsm] = quietStart.split(":").map(Number);
          const [qeh, qem] = quietEnd.split(":").map(Number);
          const quietStartMin = qsh * 60 + qsm;
          const quietEndMin = qeh * 60 + qem;

          const inQuietHours =
            quietStartMin > quietEndMin
              ? currentMinutes >= quietStartMin || currentMinutes < quietEndMin
              : currentMinutes >= quietStartMin && currentMinutes < quietEndMin;

          if (inQuietHours) continue;

          const fireKey = `${setting.meal_type}-${todayStr}`;
          if (firedReminders.current.has(fireKey)) continue;

          const alreadyFiredDB = history.some(
            (h: any) =>
              h.meal_type === setting.meal_type &&
              new Date(h.fired_at).toDateString() === now.toDateString()
          );
          if (alreadyFiredDB) {
            firedReminders.current.add(fireKey);
            continue;
          }

          const [rh, rm] = (setting.reminder_time || "08:00")
            .split(":")
            .map(Number);
          const reminderMinutes = rh * 60 + rm;
          const isTimeForReminder =
            currentMinutes >= reminderMinutes &&
            currentMinutes < reminderMinutes + 2;

          if (!isTimeForReminder) continue;

          const title =
            setting.meal_type === "morning"
              ? "Good morning!"
              : setting.meal_type === "lunch"
              ? "Lunch time"
              : "Dinner time";

          const message =
            setting.meal_type === "morning"
              ? "What's for breakfast today?"
              : setting.meal_type === "lunch"
              ? "What's for lunch today?"
              : "Plan your dinner tonight";

          setNotice(`🔔 ${title} — ${message}`);

          if (typeof window !== "undefined") {
            const soundEnabled =
              localStorage.getItem("reminder-sound") !== "off";
            if (soundEnabled) {
              try {
                const audio = new Audio(
                  "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
                );
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch {}
            }
          }

          firedReminders.current.add(fireKey);

          try {
            await fetch("/api/reminder-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                meal_type: setting.meal_type,
                title,
                message,
              }),
            });
          } catch {}

          setTimeout(() => setNotice(null), 8000);
        }
      } catch (err) {
        console.error("Reminder check failed:", err);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [mounted, userId]);

  // ----- LOAD SELECTED RECIPE -----
  useEffect(() => {
    async function loadRecipe() {
      if (initialView === "detail" && selectedId) {
        let found = catalog.find((r) => r.id === selectedId);
        if (found) {
          setSelected(found);
          setView("detail");
          return;
        }

        try {
          const response = await fetch(`/api/recipes/${selectedId}`);
          if (response.ok) {
            const recipe = await response.json();
            setSelected(recipe);
            setView("detail");
          } else {
            setView("browse");
            router.push("/explore");
          }
        } catch (error) {
          console.error("Failed to fetch recipe:", error);
          setView("browse");
          router.push("/explore");
        }
      }
    }

    if (selectedId && (catalog.length > 0 || initialView === "detail")) {
      loadRecipe();
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
        ...recipe.ingredients.map(
          (ingredient: { name: string }) => ingredient.name
        ),
      ]),
    ]);
  };

  // ----- EXPLORE FILTER -----
  const browse = useMemo(() => {
    return catalog.filter((recipe) => {
      const matchesCategory =
        category === "All" ||
        category === "Comrade Favorites" ||
        recipe.category === category ||
        (category === "Breakfast" && recipe.mealType === "Breakfast");

      const matchesQuery =
        !query || recipe.name.toLowerCase().includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [category, query, catalog]);

  const loved = favorites
    .map((id) => recipeService.get(id))
    .filter(Boolean) as Recipe[];

  const recommend = (type?: MealType) => {
    const ranked = rankRecipes(
      catalog,
      { budget, maxTime: time, pantry, bachelor: false, mealType: type },
      {}
    );
    setResult(ranked[0] ?? null);
    setView("surprise");
  };

  const nav = (next: View | string) => {
    const target = next as View;
    setView(target);
    setMobileOpen(false);

    const paths: Partial<Record<View, string>> = {
      home: "/",
      browse: "/explore",
      pantry: "/pantry",
      planner: "/planner",
      meals: "/meals",
      shopping: "/shopping",
    };

    if (paths[target]) {
      router.push(paths[target] as string);
    }
  };

  const contentOffset = sidebarCollapsed ? "md:pl-[72px]" : "md:pl-[280px]";
  const TopbarComponent = Topbar as any;

  // ✅ Remount key — refreshes dashboard when data changes
  const dashboardKey = `home-${history.length}-${favorites.length}-${pantry.length}-${view}`;

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
        <TopbarComponent
          view={view}
          shoppingCount={shopping.length}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onShowNotice={setNotice}
          onNavigate={nav}
        />

        <main className="w-full px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
          {view === "home" && (
            <Dashboard
              key={dashboardKey}
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
              showAll={showAll}
              setShowAll={setShowAll}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
              totalLoaded={allRecipes.length}
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
              onBack={() => {
                router.back();
              }}
              images={imageOverrides}
              onImageChange={setImageOverrides}
            />
          )}

          {view === "planner" && (
            <Planner
              recipes={catalog}
              open={open}
              shopping={shopping}
              setShopping={setShopping}
              images={imageOverrides}
            />
          )}

          {/* ✅ MEALS — now passes catalog */}
          {view === "meals" && (
            <Meals
              catalog={catalog}
              loved={loved}
              history={history}
              open={open}
              images={imageOverrides}
            />
          )}

          {view === "shopping" && (
            <Shopping items={shopping} setItems={setShopping} />
          )}

          {view === "profile" && <ProfileComponent />}
          {view === "settings" && <SettingsComponent />}
        </main>
      </div>

      {/* NOTICE TOAST */}
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