// components/food-app.tsx
"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { type Recipe } from "@/lib/recipes";
import { rankRecipes, type Match } from "@/lib/recommendations";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { imageOverrideStorageKey } from "@/lib/image-overrides";
import { read } from "@/lib/storage";
import { View, MealType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

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
  budget: "food-budget",
};

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
}

const fetcher = async (url: string) => {
  const res = await apiClient<RecipesResponse>(url);
  if (!res.ok) throw new Error(res.error);
  return res.data;
};

export function FoodApp({
  initialView = "home",
  selectedId,
  initialRecipe,
}: {
  initialView?: View;
  selectedId?: string;
  initialRecipe?: Recipe;
}) {
  const router = useRouter();

  // ----- PAGINATION STATE -----
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ----- DATA -----
  const {
    data: catalogResponse,
    isLoading: isCatalogLoading,
    error: catalogError
  } = useSWR<RecipesResponse>(
    `/api/recipes?page=${page}&limit=50${showAll ? "&includeAll=true" : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (catalogError) {
      toast.error("Failed to load recipes. Please check your connection.");
    }
  }, [catalogError]);

  useEffect(() => {
    if (!catalogResponse?.recipes) return;
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
    setIsLoadingMore(false);
  }, [catalogResponse, page]);

  const prevShowAllRef = useRef(showAll);
  useEffect(() => {
    if (prevShowAllRef.current === showAll) return;
    prevShowAllRef.current = showAll;
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
  const [isAdmin, setIsAdmin] = useState(false);

  // ----- APP STATE -----
  const [view, setView] = useState<View>(initialView);
  const [selected, setSelected] = useState<Recipe | null>(initialRecipe ?? null);
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
  const [time, setTime] = useState(45);
  const [mealType, setMealType] = useState<MealType>();
  const [mounted, setMounted] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});

  // ✅ Budget State
  const [userBudget, setUserBudget] = useState<number>(() => {
    if (typeof window === "undefined") return 250;
    const saved = localStorage.getItem(store.budget);
    return saved ? Number(saved) : 250;
  });

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(store.budget, String(userBudget));
    }
  }, [userBudget, mounted]);

  const viewImages =
    process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE === "global" ? {} : imageOverrides;

  const setGlobalImage = useCallback((id: string, url: string | null) => {
    setAllRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, image: url } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, image: url } : s));
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const firedReminders = useRef<Set<string>>(new Set());

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setPage((p) => p + 1);
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar-collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
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
      setIsAdmin(data.user.app_metadata?.role === "admin");
      setUserEmail(data.user.email || "");
      setUserName(data.user.user_metadata?.display_name || "User");

      const [prefsRes, shoppingRes] = await Promise.all([
        apiClient("/api/preferences"),
        apiClient("/api/shopping"),
      ]);

      const prefs = prefsRes.ok ? prefsRes.data.preferences : null;
      const shoppingData = shoppingRes.ok ? shoppingRes.data : null;

      if (prefs) {
        setFavorites(prefs.favorites ?? read(store.favorites, []));
        setHistory(prefs.history ?? read(store.history, []));
        setPantry(prefs.pantry ?? read(store.pantry, []));
        setReminders(prefs.reminders ?? read(store.reminders, { morning: true, lunch: true, evening: true }));
        setImageOverrides(prefs.image_overrides ?? read(imageOverrideStorageKey, {}));
        if (prefs.user_budget) setUserBudget(prefs.user_budget);
      } else {
        // Fallback to local storage if API fails
        setFavorites(read(store.favorites, []));
        setHistory(read(store.history, []));
        setPantry(read(store.pantry, []));
        setReminders(read(store.reminders, { morning: true, lunch: true, evening: true }));
        setImageOverrides(read(imageOverrideStorageKey, {}));
      }

      setShopping(
        shoppingData?.items?.map((item: { ingredient_name: string }) => item.ingredient_name) ??
          prefs?.shopping ??
          read(store.shopping, [])
      );

      setMounted(true);
    })();

    return () => { active = false; };
  }, [router]);

  // ----- SYNC PREFERENCES -----
  useEffect(() => {
    if (!mounted || !userId) return;

    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("food-theme", JSON.stringify(dark ? "dark" : "light"));

    // Background sync. We don't show a toast on success to avoid spamming the user.
    // We only show an error if the sync fails silently in the background.
    void apiClient("/api/preferences", {
      method: "PATCH",
      body: JSON.stringify({
        favorites,
        history,
        pantry,
        shopping,
        reminders,
        image_overrides: imageOverrides,
        user_budget: userBudget,
      }),
    }).then(res => {
      if (!res.ok && res.status !== 401) {
        // Ignore 401s here (apiClient handles redirect)
        toast.error("Failed to sync preferences to the cloud. Your changes are saved locally.");
      }
    });
  }, [
    favorites, history, pantry, shopping, dark, reminders, imageOverrides, userBudget, mounted, userId,
  ]);

  // ----- REFETCH SHOPPING -----
  useEffect(() => {
    if (view !== "shopping" || !userId) return;
    (async () => {
      const listsRes = await apiClient("/api/shopping-lists");
      if (!listsRes.ok) return; // Silent fail, shopping page will show its own error

      const lists: any[] = listsRes.data.lists ?? [];
      const todayStr = new Date().toISOString().split("T")[0];
      const isActive = (l: any) =>
        l.end_date ? l.start_date <= todayStr && todayStr <= l.end_date : l.start_date === todayStr;
      const listId = lists.find(isActive)?.id ?? lists[0]?.id;
      
      if (!listId) { setShopping([]); return; }
      
      const itemsRes = await apiClient(`/api/shopping?list_id=${listId}`);
      if (itemsRes.ok) {
        setShopping(
          (itemsRes.data.items ?? []).filter((i: any) => !i.checked).map((i: any) => i.ingredient_name)
        );
      }
    })();
  }, [view, userId]);

  // ----- REMINDERS -----
  useEffect(() => {
    if (!mounted || !userId) return;
    let cancelled = false;
    const checkReminders = async () => {
      const res = await apiClient("/api/reminders");
      if (!res.ok) return; // Silent fail for background checker
      
      const settings = res.data.settings ?? [];
      const history = res.data.history ?? [];
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
          (h: any) => h.meal_type === setting.meal_type && new Date(h.fired_at).toDateString() === now.toDateString()
        );
        if (alreadyFiredDB) { firedReminders.current.add(fireKey); continue; }

        const [rh, rm] = (setting.reminder_time || "08:00").split(":").map(Number);
        const reminderMinutes = rh * 60 + rm;
        const isTimeForReminder = currentMinutes >= reminderMinutes && currentMinutes < reminderMinutes + 2;
        if (!isTimeForReminder) continue;

        const title = setting.meal_type === "morning" ? "Good morning!" : setting.meal_type === "lunch" ? "Lunch time" : "Dinner time";
        const message = setting.meal_type === "morning" ? "What's for breakfast today?" : setting.meal_type === "lunch" ? "What's for lunch today?" : "Plan your dinner tonight";
        setNotice(`🔔 ${title} — ${message}`);

        if (typeof window !== "undefined") {
          const soundEnabled = localStorage.getItem("reminder-sound") !== "off";
          if (soundEnabled) {
            try {
              const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT");
              audio.volume = 0.3; audio.play().catch(() => {});
            } catch {}
          }
        }
        firedReminders.current.add(fireKey);
        
        void apiClient("/api/reminder-history", { 
          method: "POST", 
          body: JSON.stringify({ meal_type: setting.meal_type, title, message }) 
        });
        
        setTimeout(() => setNotice(null), 8000);
      }
    };
    
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [mounted, userId]);

  // ----- LOAD SELECTED RECIPE -----
  useEffect(() => {
    async function loadRecipe() {
      if (initialView === "detail" && selectedId) {
        if (initialRecipe) return;
        let found = catalog.find((r) => r.id === selectedId);
        if (found) { setSelected(found); setView("detail"); return; }
        
        const res = await apiClient(`/api/recipes/${selectedId}`);
        if (res.ok) {
          setSelected(res.data);
          setView("detail");
        } else {
          setView("browse");
          router.push("/explore");
        }
      }
    }
    if (selectedId && (catalog.length > 0 || initialView === "detail")) loadRecipe();
  }, [initialView, selectedId, catalog, router, initialRecipe]);

  // ----- ACTIONS -----
  const open = (recipe: Recipe) => { setSelected(recipe); setView("detail"); router.push(`/recipe/${recipe.id}`); };
  const toggle = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((v) => v !== id) : [...current, id]);
  const cook = (recipe: Recipe) => {
    setHistory((current) => [recipe.id, ...current.filter((v) => v !== recipe.id)].slice(0, 20));
    setShopping((current) => [...new Set([...current, ...recipe.ingredients.map((ingredient: { name: string }) => ingredient.name)])]);
  };

  // ----- EXPLORE FILTER -----
  const browse = useMemo(() => {
    return catalog.filter((recipe) => {
      const matchesCategory = category === "All" || category === "Comrade Favorites" || recipe.category === category || (category === "Breakfast" && recipe.mealType === "Breakfast");
      const matchesQuery = !query || recipe.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query, catalog]);

  const loved = favorites.map((id) => catalog.find((r) => r.id === id)).filter(Boolean) as Recipe[];

  const recommend = (type?: MealType) => {
    const ranked = rankRecipes(catalog, { budget: userBudget, maxTime: time, pantry, bachelor: false, mealType: type }, {});
    setResult(ranked[0] ?? null);
    setView("surprise");
  };

  // ----- NAVIGATION -----
  const nav = (next: View | string) => {
    const target = next as View;
    setView(target);
    setMobileOpen(false);
    const paths: Partial<Record<View, string>> = { 
      home: "/dashboard",
      browse: "/explore", 
      pantry: "/pantry", 
      planner: "/planner", 
      meals: "/meals" 
    };
    if (paths[target]) router.push(paths[target] as string);
  };

  const contentOffset = sidebarCollapsed ? "md:pl-[72px]" : "md:pl-[280px]";
  const TopbarComponent = Topbar as any;
  const dashboardKey = `home-${history.length}-${favorites.length}-${pantry.length}-${view}-${userBudget}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar active={view} onNavigate={nav} dark={dark} onToggleTheme={() => setDark(!dark)} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} userEmail={userEmail} userName={userName} />
      <div className={`${contentOffset} transition-[padding] duration-300`}>
        <TopbarComponent view={view} shoppingCount={shopping.length} onOpenMobileMenu={() => setMobileOpen(true)} onShowNotice={setNotice} onNavigate={nav} />
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
              images={viewImages}
              userBudget={userBudget}
              setUserBudget={setUserBudget}
            />
          )}

          {view === "browse" && <Explore recipes={browse} query={query} setQuery={setQuery} category={category} setCategory={setCategory} favorite={favorites} toggle={toggle} open={open} images={viewImages} showAll={showAll} setShowAll={setShowAll} hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={loadMore} totalLoaded={allRecipes.length} loading={isCatalogLoading} />}
          {view === "pantry" && <Pantry recipes={catalog} pantry={pantry} setPantry={setPantry} open={open} shopping={shopping} setShopping={setShopping} images={viewImages} />}
          {view === "surprise" && <Surprise catalog={catalog} onCook={cook} open={open} images={viewImages} onSave={toggle} favorites={favorites} />}
          {view === "detail" && selected && <Detail recipe={selected} favorite={favorites.includes(selected.id)} toggle={() => toggle(selected.id)} cook={() => cook(selected)} onBack={() => router.back()} images={viewImages} onImageChange={setImageOverrides} onGlobalImageChange={setGlobalImage} canEditImage={process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE !== "global" || isAdmin} />}
          {view === "planner" && <Planner recipes={catalog} open={open} shopping={shopping} setShopping={setShopping} images={viewImages} />}
          {view === "meals" && <Meals catalog={catalog} loved={loved} history={history} open={open} images={viewImages} />}
          {view === "shopping" && <Shopping items={shopping} setItems={setShopping} />}
          {view === "profile" && <ProfileComponent />}
          {view === "settings" && <SettingsComponent />}
        </main>
      </div>
      {notice && (
        <div className="fixed bottom-5 right-5 z-60 flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <Bell className="size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium">{notice}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="ml-auto rounded-lg p-1 hover:bg-secondary"><X className="size-4" /></button>
        </div>
      )}
    </div>
  );
}