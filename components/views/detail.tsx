// components/views/detail.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  ChefHat,
  Clock3,
  Heart,
  Library,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { type Recipe } from "@/lib/recipes";
import { RecipeImage } from "@/components/recipe-image";
import { apiClient } from "@/lib/api-client";
import { MESSAGES } from "@/lib/messages";
import { formatCost } from "@/lib/recommendations";
import { inPantry } from "@/lib/pantry";
import { scaledAmount } from "@/lib/servings";
import { addToShoppingList } from "@/lib/shopping-actions";
import { localDateStr } from "@/lib/dates";
import { useAssistant } from "@/components/assistant-provider";
import { DetailCollections } from "./detail-collections";
import { DetailCookMode } from "./detail-cook-mode";
import { DetailImageControls, type ImageUpdater } from "./detail-image-controls";

interface DetailProps {
  recipe: Recipe;
  catalog: Recipe[];
  pantry: string[];
  favorite: boolean;
  toggle: () => void;
  cook: () => void;
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
  onImageChange: ImageUpdater;
  onGlobalImageChange?: (id: string, url: string | null) => void;
  canEditImage?: boolean;
}

type Slot = "breakfast" | "lunch" | "dinner";
const SLOTS: Slot[] = ["breakfast", "lunch", "dinner"];
const defaultSlot = (m: Recipe["mealType"]): Slot =>
  m === "Breakfast" ? "breakfast" : m === "Lunch" ? "lunch" : "dinner";

const secondaryBtn =
  "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold transition hover:bg-secondary";

/* ---------- Add to plan (small sheet) ---------- */
function PlanModal({ recipe, servings, onClose }: { recipe: Recipe; servings: number; onClose: () => void }) {
  const [date, setDate] = useState(localDateStr());
  const [slot, setSlot] = useState<Slot>(defaultSlot(recipe.mealType));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    if (!date) return;
    setSaving(true);
    const res = await apiClient("/api/plans", {
      method: "POST",
      body: JSON.stringify({ plan_date: date, meal_type: slot, recipe_id: recipe.id, servings }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error ?? MESSAGES.network.generic);
      return;
    }
    toast.success(`Added to your ${slot} plan`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="plan-title" className="relative w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 id="plan-title" className="font-serif text-2xl">Add to plan</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{recipe.name} · {servings} servings</p>

        <label className="mt-5 block text-sm font-semibold" htmlFor="plan-date">Date</label>
        <input
          id="plan-date"
          type="date"
          min={localDateStr()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 outline-none focus:border-accent"
        />

        <p className="mt-5 text-sm font-semibold">Meal</p>
        <div className="mt-2 flex gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={slot === s}
              onClick={() => setSlot(s)}
              className={`filter-pill flex-1 capitalize ${slot === s ? "filter-pill-active" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">A meal already planned in this slot will be replaced.</p>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !date}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          Add to plan
        </button>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export function Detail({
  recipe,
  catalog,
  pantry,
  favorite,
  toggle,
  cook,
  open,
  images = {},
  onImageChange,
  onGlobalImageChange,
  canEditImage = true,
}: DetailProps) {
  const router = useRouter();
  const { openAssistant } = useAssistant();
  const [cookMode, setCookMode] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [loggingCook, setLoggingCook] = useState(false);
  const [addingShopping, setAddingShopping] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [servings, setServings] = useState(Math.min(8, Math.max(1, recipe.servings)));
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);

  // Photo: global (admin, shared) or personal (per user) mode
  const globalMode = process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE === "global";
  const shownImages = preview && preview.id === recipe.id ? { ...images, [recipe.id]: preview.url } : images;
  const hasPhoto = globalMode ? Boolean(recipe.image) || preview?.id === recipe.id : Boolean(shownImages[recipe.id]);

  const factor = servings / Math.max(1, recipe.servings);
  const missing = recipe.ingredients.filter((i) => !checked.includes(i.name) && !inPantry(i.name, pantry));

  const perServing = formatCost({
    min: Math.round(recipe.estimatedCost.min / Math.max(1, recipe.servings)),
    max: Math.round(recipe.estimatedCost.max / Math.max(1, recipe.servings)),
  });

  const similar = useMemo(
    () => catalog.filter((r) => r.category === recipe.category && r.id !== recipe.id).slice(0, 4),
    [catalog, recipe.category, recipe.id],
  );

  const handleStartCooking = async () => {
    cook();
    setCookMode(true);
    setLoggingCook(true);
    const res = await apiClient("/api/meals", {
      method: "POST",
      body: JSON.stringify(
        recipe.userRecipe
          ? { user_recipe_id: recipe.id, recipe_name: recipe.name }
          : { recipe_id: recipe.id, recipe_name: recipe.name },
      ),
    });
    if (!res.ok) toast.error(res.error ?? MESSAGES.network.generic);
    setLoggingCook(false);
  };

  const addMissing = async () => {
    if (missing.length === 0) return;
    setAddingShopping(true);
    const res = await addToShoppingList(missing.map((i) => i.name));
    setAddingShopping(false);
    if (!res.ok) toast.error(res.error);
    else if (res.added === 0) toast("Already on your shopping list");
    else toast.success(`Added ${res.added} item${res.added === 1 ? "" : "s"} to your shopping list`);
  };

  const stats = [
    { icon: Clock3, label: "Time", value: `${recipe.totalTime} min` },
    { icon: Users, label: "Servings", value: String(recipe.servings) },
    { icon: ChefHat, label: "Difficulty", value: recipe.difficulty },
    { icon: Wallet, label: "Per serving", value: perServing },
  ];

  return (
    <div className="flex flex-col gap-6 pb-16 md:pb-0">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* HERO */}
      <section className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-secondary">
          <RecipeImage
            recipe={recipe}
            images={shownImages}
            showName
            className="size-full object-cover"
            placeholderClassName="aspect-auto! h-full"
          />
          {canEditImage && (
            <DetailImageControls
              recipeId={recipe.id}
              hasPhoto={hasPhoto}
              globalMode={globalMode}
              onPreview={(url) => setPreview(url ? { id: recipe.id, url } : null)}
              onImageChange={onImageChange}
              onGlobalImageChange={onGlobalImageChange}
            />
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="eyebrow">
            {recipe.category} · {recipe.mealType}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{recipe.name}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{recipe.description}</p>

          {recipe.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <li key={tag} className="tag">{tag}</li>
              ))}
            </ul>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-3">
                <Icon className="size-4 text-accent" />
                <dd className="mt-2 text-sm font-bold leading-tight">{value}</dd>
                <dt className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleStartCooking()}
              disabled={loggingCook}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {loggingCook ? <Loader2 className="size-4 animate-spin" /> : <UtensilsCrossed className="size-4" />}
              Let&apos;s cook
            </button>
            <button type="button" onClick={toggle} aria-pressed={favorite} className={secondaryBtn}>
              <Heart className={`size-4 ${favorite ? "fill-current text-warm" : ""}`} />
              {favorite ? "Saved" : "Save"}
            </button>
            {!recipe.userRecipe && (
              <>
                <button type="button" onClick={() => setCollectionsOpen(true)} className={secondaryBtn}>
                  <Library className="size-4" />
                  Collections
                </button>
                <button type="button" onClick={() => setPlanOpen(true)} className={secondaryBtn}>
                  <CalendarPlus className="size-4" />
                  Add to plan
                </button>
              </>
            )}
            <button type="button" onClick={() => openAssistant({ page: "detail" })} className={secondaryBtn}>
              <Sparkles className="size-4" />
              Ask Chakula
            </button>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] xl:grid-cols-[minmax(0,380px)_1fr_300px]">
        {/* Ingredients */}
        <div className="h-fit rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">Ingredients</h2>
            <div className="flex items-center gap-1 rounded-full border border-border p-1" role="group" aria-label="Servings">
              <button
                type="button"
                aria-label="Fewer servings"
                disabled={servings <= 1}
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="flex size-8 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-[4.5rem] text-center text-sm font-semibold" aria-live="polite">
                {servings} {servings === 1 ? "serving" : "servings"}
              </span>
              <button
                type="button"
                aria-label="More servings"
                disabled={servings >= 8}
                onClick={() => setServings((s) => Math.min(8, s + 1))}
                className="flex size-8 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {recipe.ingredients.map((i, idx) => {
              const done = checked.includes(i.name);
              const have = inPantry(i.name, pantry);
              return (
                <li key={`${i.name}-${idx}`}>
                  <label className="flex cursor-pointer items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() =>
                        setChecked((c) => (c.includes(i.name) ? c.filter((x) => x !== i.name) : [...c, i.name]))
                      }
                      className="size-4 accent-accent"
                    />
                    <span className={`flex-1 text-sm ${done ? "line-through opacity-50" : ""}`}>
                      {i.name}
                      {have && (
                        <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                          In pantry
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">{scaledAmount(i, factor)}</span>
                  </label>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => void addMissing()}
            disabled={missing.length === 0 || addingShopping}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {addingShopping ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
            {missing.length === 0 ? "Nothing missing" : `Add missing to shopping (${missing.length})`}
          </button>
        </div>

        {/* Steps */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h2 className="font-serif text-2xl">Instructions</h2>
          <ol className="mt-5 flex flex-col gap-6">
            {recipe.instructions.map((s, i) => (
              <li key={`${i}-${s}`} className="flex gap-4">
                <span className="w-10 shrink-0 font-serif text-5xl leading-none text-accent/50">{i + 1}</span>
                <div className="pt-1">
                  <p className="leading-7">{s}</p>
                  <button
                    type="button"
                    onClick={() => openAssistant({ page: "detail", prompt: `Explain this step simply: ${s}` })}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    <Sparkles className="size-3" />
                    Explain this step
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right rail (xl) / stacked below on smaller screens */}
        <aside className="flex flex-col gap-6 lg:col-span-2 xl:col-span-1">
          <div className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-serif text-2xl">Approximate cost</h2>
            <p className="mt-3 inline-block rounded-full bg-highlight px-3 py-1 text-sm font-bold text-highlight-foreground">
              {formatCost(recipe.estimatedCost)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              for {recipe.servings} servings · {perServing} per serving
            </p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Approximate cost of ingredients only. Gas or charcoal not included.
            </p>
          </div>

          {similar.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <h2 className="font-serif text-2xl">Similar recipes</h2>
              <ul className="mt-3 flex flex-col gap-1">
                {similar.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => open(r)}
                      className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-secondary"
                    >
                      <span className="size-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <RecipeImage
                          recipe={r}
                          images={images}
                          className="size-full object-cover"
                          placeholderClassName="aspect-auto! h-full"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-lg">{r.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.totalTime} min · {formatCost(r.estimatedCost)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {/* Mobile: floating cook button above the bottom nav */}
      <button
        type="button"
        onClick={() => void handleStartCooking()}
        disabled={loggingCook}
        className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-lg md:hidden"
      >
        <UtensilsCrossed className="size-4" />
        Let&apos;s cook
      </button>

      {collectionsOpen && <DetailCollections recipeId={recipe.id} onClose={() => setCollectionsOpen(false)} />}
      {planOpen && <PlanModal recipe={recipe} servings={servings} onClose={() => setPlanOpen(false)} />}
      {cookMode && <DetailCookMode recipe={recipe} onClose={() => setCookMode(false)} />}
    </div>
  );
}