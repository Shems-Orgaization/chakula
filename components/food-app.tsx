"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChefHat,
  ChevronRight,
  Clock3,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { recipes, recipeService, type Recipe } from "@/lib/recipes";
import {
  formatCost,
  matchRecipe,
  rankRecipes,
  type Match,
} from "@/lib/recommendations";
import { Sidebar, type View } from "@/components/sidebar";
import {
  imageAlt,
  imageOverrideStorageKey,
  imageGuidance,
  recipeImage,
} from "@/lib/image-overrides";
import ProfilePage from "@/app/profile/page";
import SettingsPage from "@/app/settings/page";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

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

export function FoodApp({ initialView = "home" }: { initialView?: View }) {
  const router = useRouter();
  const { data: catalogResponse, error: catalogError } = useSWR<{
    recipes: Recipe[];
  }>("/api/recipes?limit=100", fetcher);
  const catalog = catalogResponse?.recipes ?? [];

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

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
  const [mealType, setMealType] = useState<Recipe["mealType"] | undefined>();
  const [mounted, setMounted] = useState(false);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>(
    {},
  );

  // Load user data
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

      // Load preferences
      const response = await fetch("/api/preferences");
      const payload = response.ok ? await response.json() : {};
      const prefs = payload.preferences;

      setFavorites(prefs?.favorites ?? read(store.favorites, []));
      setHistory(prefs?.history ?? read(store.history, []));
      setPantry(prefs?.pantry ?? read(store.pantry, []));

      // Load shopping
      const shoppingResponse = await fetch("/api/shopping");
      const shoppingPayload = shoppingResponse.ok
        ? await shoppingResponse.json()
        : null;
      setShopping(
        shoppingPayload?.items?.map(
          (item: { ingredient_name: string }) => item.ingredient_name,
        ) ??
          prefs?.shopping ??
          read(store.shopping, []),
      );

      setDark(read<string>(store.theme, "light") === "dark");
      setReminders(
        prefs?.reminders ??
          read(store.reminders, { morning: true, lunch: true, evening: true }),
      );
      setImageOverrides(
        prefs?.image_overrides ?? read(imageOverrideStorageKey, {}),
      );

      setMounted(true);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  // Sync preferences
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

  // Reminder notification
  useEffect(() => {
    const hour = new Date().getHours();
    const period = hour < 11 ? "morning" : hour < 16 ? "lunch" : "evening";

    if (!reminders[period] || !mounted) return;

    setNotice(
      `${period[0].toUpperCase() + period.slice(1)} food o'clock — try something chap chap?`,
    );

    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [mounted, reminders]);

  const open = (recipe: Recipe) => {
    setSelected(recipe);
    setView("detail");
  };

  const toggle = (id: string) =>
    setFavorites((x) =>
      x.includes(id) ? x.filter((v) => v !== id) : [...x, id],
    );

  const cook = (recipe: Recipe) => {
    setHistory((x) =>
      [recipe.id, ...x.filter((v) => v !== recipe.id)].slice(0, 20),
    );
    setShopping((x) => [
      ...new Set([
        ...x,
        ...recipe.ingredients.map((i: Recipe["ingredients"][number]) => i.name),
      ]),
    ]);
  };

  const browse = useMemo(
    () =>
      catalog.filter(
        (r) =>
          (category === "All" ||
            r.category === category ||
            (category === "Breakfast" && r.mealType === "Breakfast")) &&
          r.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query, catalog],
  );

  const loved = favorites
    .map((id) => recipeService.get(id))
    .filter(Boolean) as Recipe[];

  const recommend = (type = mealType) => {
    const ranked = rankRecipes(
      catalog,
      { budget, maxTime: time, pantry, bachelor: false, mealType: type },
      {},
    );
    setResult(ranked[0] ?? null);
    setView("surprise");
  };

  const nav = (next: View) => {
    setView(next);
    setMobileOpen(false);

    const paths: Record<View, string> = {
      home: "/",
      browse: "/explore",
      pantry: "/pantry",
      planner: "/planner",
      meals: "/meals",
      shopping: "/shopping",
      surprise: "/?view=surprise",
      detail: "/explore",
      profile: "/profile",
      settings: "/settings",
    };
    router.push(paths[next]);
  };

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

      <div className="md:pl-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/90 px-5 py-4 backdrop-blur lg:px-12">
          <button
            className="icon-button md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <ChefHat className="size-4 text-accent" />
            Modern Kenyan Dining
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="icon-button"
              onClick={() =>
                setNotice("Meal reminders are on — we will keep you posted.")
              }
            >
              <Bell className="size-4" />
              <span className="hidden sm:inline">Reminders</span>
            </button>
            <button
              className="icon-button"
              onClick={() => nav("shopping")}
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">
                List {shopping.length ? `(${shopping.length})` : ""}
              </span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          {view === "home" && (
            <Dashboard
              recipes={catalog}
              onNavigate={nav}
              onRecommend={recommend}
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
              result={result}
              onPick={() => recommend()}
              onAnother={() => recommend()}
              onCook={cook}
              open={open}
              budget={budget}
              setBudget={setBudget}
              time={time}
              setTime={setTime}
              mealType={mealType}
              setMealType={setMealType}
              images={imageOverrides}
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

          {view === "shopping" && (
            <Shopping
              items={shopping}
              setItems={setShopping}
            />
          )}

          {view === "profile" && <ProfileView />}
          {view === "settings" && <SettingsView dark={dark} onToggleTheme={() => setDark(!dark)} />}
        </main>
      </div>

      {/* Notification toast */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <Bell className="size-5 shrink-0 text-accent" />
          <p className="text-sm font-medium">{notice}</p>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="ml-auto"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD COMPONENT
// ============================================================

function Dashboard({
  recipes: catalog,
  onNavigate,
  onRecommend,
  loved,
  open,
  pantry,
  reminders,
  setReminders,
  images = {},
}: any) {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-12 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="eyebrow text-primary-foreground/70">
            Your daily food shortcut
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
            What are we eating?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-primary-foreground/75">
            Don&apos;t feel like deciding? Sawa basi. We&apos;ll find something
            familiar, affordable and easy to cook.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="action-button action-button-light"
              onClick={() => onRecommend()}
            >
              <Sparkles className="size-4" /> Surprise me
            </button>
            <button
              className="action-button action-button-quiet"
              onClick={() => onNavigate("browse")}
            >
              <BookOpen className="size-4" /> I&apos;ll choose
            </button>
            <button
              className="action-button action-button-quiet"
              onClick={() => onNavigate("pantry")}
            >
              <ShoppingBag className="size-4" /> Use what I have
            </button>
          </div>
        </div>
        <div className="food-hero-art" aria-hidden="true">
          UGALI
          <br />
          DENGU
          <br />
          CHAI
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-5 md:grid-cols-3">
        <ActionCard
          icon={Sparkles}
          title="Surprise Me"
          text="Pick a meal for me, chap chap."
          accent
          onClick={() => onRecommend()}
        />
        <ActionCard
          icon={Search}
          title="Explore"
          text="Browse traditional, street and quick food."
          onClick={() => onNavigate("browse")}
        />
        <ActionCard
          icon={ShoppingBag}
          title="Pantry matches"
          text={`${pantry.length || 0} ingredients in your kitchen.`}
          onClick={() => onNavigate("pantry")}
        />
      </section>

      {/* Quick picks */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Quick picks</p>
            <h2 className="section-title text-3xl sm:text-4xl">
              Chakula ideas
            </h2>
          </div>
          <button className="text-button" onClick={() => onNavigate("browse")}>
            See all <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            "Breakfast",
            "Lunch",
            "Dinner",
            "Street food",
            "Under KES 200",
            "15 minutes",
          ].map((x) => (
            <button
              key={x}
              className="filter-pill whitespace-nowrap"
              onClick={() =>
                x === "Breakfast"
                  ? onRecommend("Breakfast")
                  : onNavigate("browse")
              }
            >
              {x}
            </button>
          ))}
        </div>
      </section>

      {/* Recently loved + Reminders */}
      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow">Recently loved</p>
              <h2 className="section-title text-3xl">Good food, saved</h2>
            </div>
            <Heart className="size-5 text-accent" />
          </div>
          {loved.length ? (
            <div className="recipe-grid">
              {loved.slice(0, 3).map((r: Recipe) => (
                <MiniCard key={r.id} recipe={r} open={() => open(r)} images={images} />
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <Heart className="size-5 text-accent" />
              <p>Save a meal and it will show up here.</p>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Meal reminders</p>
              <h2 className="mt-2 font-serif text-3xl">Stay on track</h2>
            </div>
            <Bell className="size-5 text-accent" />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Get a gentle in-app nudge in the morning, at lunch and in the
            evening.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {(["morning", "lunch", "evening"] as const).map((p) => (
              <label
                key={p}
                className="flex items-center justify-between rounded-xl bg-secondary px-3 py-3 text-sm font-semibold capitalize"
              >
                <span>{p}</span>
                <input
                  type="checkbox"
                  checked={reminders[p]}
                  onChange={(e) =>
                    setReminders({ ...reminders, [p]: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// ACTION CARD
// ============================================================

function ActionCard({ icon: Icon, title, text, onClick, accent = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`group flex min-h-48 flex-col items-start justify-between rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        accent
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card hover:border-accent/30"
      }`}
    >
      <span
        className={`flex size-12 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
          accent
            ? "bg-accent-foreground/15"
            : "bg-secondary text-accent"
        }`}
      >
        <Icon className="size-6" />
      </span>
      <span>
        <strong className="block font-serif text-2xl">{title}</strong>
        <span
          className={`mt-1 block text-sm ${
            accent ? "opacity-80" : "text-muted-foreground"
          }`}
        >
          {text}
        </span>
      </span>
    </button>
  );
}

// ============================================================
// MINI CARD
// ============================================================

function MiniCard({ recipe, open, images = {} }: any) {
  return (
    <button className="group text-left" onClick={open}>
      <img
        src={recipeImage(recipe, images)}
        alt={recipe.name}
        className="aspect-[1.2] w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.02] group-hover:shadow-lg"
      />
      <p className="mt-3 font-serif text-xl group-hover:text-accent transition-colors">
        {recipe.name}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {recipe.totalTime} min · {formatCost(recipe.estimatedCost)}
      </p>
    </button>
  );
}

// ============================================================
// EXPLORE COMPONENT
// ============================================================

function Explore({
  recipes: list,
  query,
  setQuery,
  category,
  setCategory,
  favorite,
  toggle,
  open,
  images = {},
}: any) {
  const cats = [
    "All",
    "Breakfast",
    "Street",
    "Quick Meals",
    "Rice",
    "Ugali",
    "Beans",
    "Ndengu",
    "Vegetables",
  ];

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
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r: Recipe) => (
          <article className="recipe-card relative rounded-2xl border border-border bg-card overflow-hidden transition hover:shadow-lg" key={r.id}>
            <button
              className="block w-full"
              onClick={() => open(r)}
            >
              <img
                src={recipeImage(r, images)}
                alt={imageAlt(r, images)}
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
              <Heart className={`size-4 ${favorite.includes(r.id) ? "fill-current" : ""}`} />
            </button>

            <button className="block w-full p-4 text-left" onClick={() => open(r)}>
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
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PANTRY COMPONENT
// ============================================================

function Pantry({
  recipes: catalog,
  pantry,
  setPantry,
  open,
  shopping,
  setShopping,
}: any) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const matches = useMemo(
    () =>
      catalog
        .map((r: Recipe) => matchRecipe(r, pantry))
        .sort((a: Match, b: Match) => b.score - a.score)
        .slice(0, 8),
    [pantry, catalog],
  );

  const add = async () => {
    const ingredientName = input.trim();
    if (!ingredientName || isAdding) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient_name: ingredientName }),
      });

      if (response.ok) {
        setPantry([...new Set([...pantry, ingredientName])]);
        setInput("");
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">What&apos;s in your kitchen?</p>
        <h1 className="section-title mt-3">Let&apos;s minimize waste.</h1>
      </div>

      <div className="panel">
        <div className="flex gap-2">
          <input
            className="text-input flex-1 rounded-lg border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Add an ingredient, e.g. eggs"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <button className="primary-button bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60" onClick={add} disabled={isAdding}>
            {isAdding ? "Adding…" : "Add"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {pantry.map((item: string) => (
            <button
              key={item}
              className="ingredient-chip flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/70 transition"
              onClick={() => setPantry(pantry.filter((x: string) => x !== item))}
            >
              {item} <X className="size-3" />
            </button>
          ))}
        </div>
      </div>

      <h2 className="section-title text-3xl">Here&apos;s what you can make</h2>

      <div className="flex flex-col gap-3">
        {matches.map((m: Match) => (
          <article key={m.recipe.id} className="match-row flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:shadow-md">
            <button
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => open(m.recipe)}
            >
              <img
                src={m.recipe.image}
                alt={m.recipe.name}
                className="size-16 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1">
                <strong className="block">{m.recipe.name}</strong>
                <span className="mt-1 block truncate text-sm text-muted-foreground">
                  Have: {m.have.join(", ") || "nothing yet"} · Missing:{" "}
                  {m.missing.join(", ") || "nothing"}
                </span>
              </span>
              <span className="font-semibold text-accent">{m.score}%</span>
            </button>
            <button
              className="secondary-button hidden sm:inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary transition"
              onClick={() => setShopping([...new Set([...shopping, ...m.missing])])}
            >
              Shop missing
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SURPRISE COMPONENT
// ============================================================

function Surprise({
  result,
  onPick,
  onAnother,
  onCook,
  open,
  budget,
  setBudget,
  time,
  setTime,
  mealType,
  setMealType,
  images = {},
}: any) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Surprise me</p>
        <h1 className="section-title mt-3">A good call is waiting.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.65fr_1.35fr]">
        <aside className="panel rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">
          <label className="field-label">
            Budget <span>KES {budget}</span>
            <input
              type="range"
              min="80"
              max="600"
              step="10"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>

          <label className="field-label">
            Time <span>{time} min</span>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </label>

          <div>
            <p className="field-label">Meal period</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["Breakfast", "Lunch", "Dinner"] as const).map((x) => (
                <button
                  key={x}
                  onClick={() => setMealType(mealType === x ? undefined : x)}
                  className={`filter-pill ${
                    mealType === x ? "filter-pill-active" : ""
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>

          <button
            className="primary-button w-full bg-accent text-accent-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            onClick={onPick}
          >
            <Sparkles className="size-4" /> Pick my meal
          </button>
        </aside>

        {result ? (
          <article className="result-card rounded-2xl border border-border bg-card overflow-hidden">
            <img
              src={recipeImage(result.recipe, images)}
              alt={imageAlt(result.recipe, images)}
              className="result-image aspect-[1.6] w-full object-cover"
            />
            <div className="p-6">
              <p className="eyebrow text-accent">
                Your pick · {result.score}% fit
              </p>
              <h2 className="mt-2 font-serif text-4xl">{result.recipe.name}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                {result.recipe.description}
              </p>

              <div className="meta-grid mt-5 flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock3 className="size-4" /> {result.recipe.totalTime} min
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="size-4" />{" "}
                  {formatCost(result.recipe.estimatedCost)}
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="size-4" /> {result.recipe.difficulty}
                </span>
              </div>

              <div className="why-box mt-5 rounded-xl bg-secondary/50 p-4">
                <strong>Why this one</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.explanation}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="primary-button bg-accent text-accent-foreground px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition flex items-center gap-2"
                  onClick={() => {
                    onCook(result.recipe);
                    open(result.recipe);
                  }}
                >
                  Cook this <ChevronRight className="size-4" />
                </button>
                <button
                  className="secondary-button border border-border px-6 py-2.5 rounded-xl font-semibold hover:bg-secondary transition"
                  onClick={onAnother}
                >
                  Give me another
                </button>
              </div>
            </div>
          </article>
        ) : (
          <div className="result-empty flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
            <Sparkles className="size-8 text-accent" />
            <h2 className="mt-4 font-serif text-3xl">Ready when you are.</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Set your mood and let Chakula make the call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL COMPONENT
// ============================================================

function Detail({
  recipe,
  favorite,
  toggle,
  cook,
  onBack,
  images = {},
  onImageChange = () => {},
}: any) {
  const [cookMode, setCookMode] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [currentImage, setCurrentImage] = useState(
    images[recipe.id] || recipe.image,
  );
  const [customImage, setCustomImage] = useState(Boolean(images[recipe.id]));
  const [uploading, setUploading] = useState(false);

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB");
      return;
    }

    setUploading(true);
    const preview = URL.createObjectURL(file);
    setCurrentImage(preview);
    setCustomImage(true);

    const formData = new FormData();
    formData.append("recipeId", recipe.id);
    formData.append("file", file);

    try {
      const response = await fetch("/api/recipe-images", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        setCurrentImage(images[recipe.id] || recipe.image);
        setCustomImage(Boolean(images[recipe.id]));
        alert("Failed to upload image");
        return;
      }

      onImageChange((current: Record<string, string>) => ({
        ...current,
        [recipe.id]: payload.url,
      }));
      setCurrentImage(payload.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetImage = async () => {
    try {
      await fetch(`/api/recipe-images?recipeId=${recipe.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete error:", error);
    }

    onImageChange((current: Record<string, string>) => {
      const next = { ...current };
      delete next[recipe.id];
      return next;
    });
    setCurrentImage(recipe.image);
    setCustomImage(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <button
        className="back-button flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        onClick={onBack}
      >
        ← Back to explore
      </button>

      <article className="overflow-hidden rounded-[2rem] border border-border bg-card">
        {/* Image */}
        <div className="relative h-[360px] sm:h-[500px]">
          <img
            src={currentImage}
            alt={imageAlt(recipe, images)}
            className="size-full object-cover"
          />

          <div className="absolute right-5 top-5 z-10 flex gap-2">
            <label className="secondary-button cursor-pointer rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition">
              {uploading ? "Uploading…" : "Change photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={chooseImage}
                disabled={uploading}
              />
            </label>
            {customImage && (
              <button
                className="secondary-button rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition"
                onClick={resetImage}
              >
                Reset
              </button>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 text-background sm:p-10">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.slice(0, 3).map((tag: string) => (
                <span className="tag rounded-full bg-background/20 px-3 py-1 text-xs font-medium" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-3 font-serif text-5xl sm:text-7xl">
              {recipe.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-background/80 sm:text-lg">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[.85fr_1.15fr]">
          <div className="flex flex-col gap-6">
            <div className="meta-grid flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock3 className="size-4" />
                {recipe.totalTime} min
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="size-4" />
                {formatCost(recipe.estimatedCost)}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="size-4" />
                {recipe.difficulty}
              </span>
            </div>

            <div>
              <h2 className="detail-heading mb-3 font-serif text-2xl">Ingredients</h2>
              <ul className="ingredient-list space-y-2">
                {recipe.ingredients.map((i: Recipe["ingredients"][number]) => (
                  <li key={i.name} className="flex items-center justify-between">
                    <label
                      className={`flex items-center gap-2 ${
                        checked.includes(i.name)
                          ? "line-through opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked.includes(i.name)}
                        onChange={() =>
                          setChecked(
                            checked.includes(i.name)
                              ? checked.filter((x) => x !== i.name)
                              : [...checked, i.name],
                          )
                        }
                        className="rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                      />{" "}
                      {i.name}
                    </label>
                    <span className="text-sm text-muted-foreground">{i.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="mb-6 flex justify-end gap-2">
              <button
                className="secondary-button flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold hover:bg-secondary transition"
                onClick={toggle}
              >
                <Heart className={favorite ? "fill-current text-red-500" : ""} />{" "}
                {favorite ? "Saved" : "Save"}
              </button>
              <button
                className="primary-button flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90 transition"
                onClick={() => {
                  cook();
                  setCookMode(true);
                }}
              >
                <UtensilsCrossed className="size-4" /> Let&apos;s cook
              </button>
            </div>

            <h2 className="detail-heading mb-3 font-serif text-2xl">Instructions</h2>
            <ol className="steps-list space-y-4">
              {recipe.instructions.map((s: string, i: number) => (
                <li key={s} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-6">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>

      {/* Cook Mode */}
      {cookMode && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border p-5">
            <div>
              <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground">Cook mode</p>
              <h2 className="font-serif text-2xl">{recipe.name}</h2>
            </div>
            <button
              className="icon-button rounded-lg p-2 hover:bg-secondary transition"
              onClick={() => setCookMode(false)}
              aria-label="Close cook mode"
            >
              <X className="size-5" />
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="max-w-2xl">
              <span className="font-serif text-8xl text-accent/20">
                {String(step + 1).padStart(2, "0")}
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight">
                {recipe.instructions[step]}
              </h1>
              <p className="mt-5 text-muted-foreground">
                Step {step + 1} of {recipe.instructions.length}
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-border p-5">
            <button
              className="secondary-button rounded-xl border border-border px-6 py-2.5 font-semibold hover:bg-secondary transition disabled:opacity-50"
              disabled={!step}
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
            <button
              className="primary-button rounded-xl bg-accent px-6 py-2.5 font-semibold text-accent-foreground hover:opacity-90 transition"
              onClick={() =>
                step === recipe.instructions.length - 1
                  ? setCookMode(false)
                  : setStep(step + 1)
              }
            >
              {step === recipe.instructions.length - 1 ? "Done" : "Next"}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PLANNER COMPONENT
// ============================================================

function Planner({
  recipes: catalog,
  history,
  open,
  shopping,
  images = {},
}: any) {
  const menu = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    .map(
      (day, i) =>
        catalog.find((recipe: Recipe) => recipe.id === history[i]) ||
        catalog[i],
    )
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Plan ahead</p>
        <h1 className="section-title mt-3">Weekly planner.</h1>
        <p className="mt-3 text-muted-foreground">
          Keep the week simple, affordable and very Kenyan.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {menu.map((r: Recipe, i: number) => (
          <MiniCard
            key={r.id + i}
            recipe={r}
            open={() => open(r)}
            images={images}
          />
        ))}
      </div>

      <div className="panel flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground">Shopping list</p>
          <h2 className="mt-2 font-serif text-3xl">
            {shopping.length} items ready
          </h2>
        </div>
        <ShoppingBag className="size-8 text-accent" />
      </div>
    </div>
  );
}

// ============================================================
// MEALS COMPONENT
// ============================================================

function Meals({ loved, history, open, images = {} }: any) {
  const all = [
    ...loved,
    ...history.map((id: string) => recipeService.get(id)).filter(Boolean),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Your collection</p>
        <h1 className="section-title mt-3">My meals.</h1>
      </div>

      {all.length ? (
        <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((r: Recipe) => (
            <MiniCard key={r.id} recipe={r} open={() => open(r)} images={images} />
          ))}
        </div>
      ) : (
        <div className="empty-panel flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <Heart className="size-8 text-accent" />
          <p className="mt-4 text-muted-foreground">
            Your saved and cooked meals will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHOPPING COMPONENT
// ============================================================

function Shopping({ items, setItems }: any) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const name = input.trim();
    if (!name || busy) return;

    setBusy(true);
    try {
      const response = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient_name: name }),
      });

      if (response.ok) {
        setItems((current: string[]) => [...new Set([...current, name])]);
        setInput("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Ready when you are</p>
        <h1 className="section-title mt-3">Shopping list.</h1>
        <div className="mt-5 flex max-w-xl gap-2">
          <input
            className="text-input flex-1 rounded-lg border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            aria-label="Add shopping item"
            placeholder="Add an item, e.g. onions"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void add();
            }}
          />
          <button
            className="primary-button rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 transition"
            onClick={() => void add()}
            disabled={busy}
          >
            {busy ? "Adding…" : "Add item"}
          </button>
        </div>
      </div>

      <div className="panel rounded-2xl border border-border bg-card p-6">
        <ul className="shopping-list space-y-2">
          {items.length ? (
            items.map((item: string) => (
              <li key={item} className="flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <span className="font-medium">{item}</span>
                </label>
                <button
                  className="text-button text-sm text-muted-foreground hover:text-red-500 transition"
                  onClick={async () => {
                    const response = await fetch(
                      `/api/shopping?ingredient_name=${encodeURIComponent(item)}`,
                      { method: "DELETE" },
                    );
                    if (response.ok)
                      setItems(items.filter((x: string) => x !== item));
                  }}
                >
                  Remove
                </button>
              </li>
            ))
          ) : (
            <li className="text-center text-muted-foreground py-4">
              Cook a meal to add ingredients here.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}