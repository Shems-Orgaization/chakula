import { BookOpen, ChevronRight, Heart, Search, ShoppingBag, Sparkles, Bell } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { MiniCard } from "@/components/mini-card";

interface DashboardProps {
  recipes: Recipe[];
  onNavigate: (view: string) => void;
  onRecommend: (type?: string) => void;
  loved: Recipe[];
  open: (recipe: Recipe) => void;
  pantry: string[];
  reminders: { morning: boolean; lunch: boolean; evening: boolean };
  setReminders: (r: any) => void;
  images?: Record<string, string>;
}

export function Dashboard({
  recipes: catalog,
  onNavigate,
  onRecommend,
  loved,
  open,
  pantry,
  reminders,
  setReminders,
  images = {},
}: DashboardProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-12 text-primary-foreground shadow-xl sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="eyebrow text-primary-foreground/70">Your daily food shortcut</p>
          <h1 className="mt-4 font-serif text-5xl leading-[.95] tracking-tight sm:text-7xl">
            What are we eating?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-primary-foreground/75">
            Don&apos;t feel like deciding? Sawa basi. We&apos;ll find something familiar, affordable and easy to cook.
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
          UGALI<br />DENGU<br />CHAI
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
            <h2 className="section-title text-3xl sm:text-4xl">Chakula ideas</h2>
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
              {loved.slice(0, 3).map((r) => (
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
            Get a gentle in-app nudge in the morning, at lunch and in the evening.
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

// ActionCard (local)
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
          accent ? "bg-accent-foreground/15" : "bg-secondary text-accent"
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