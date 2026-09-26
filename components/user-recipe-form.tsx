// components/user-recipe-form.tsx
"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface Ingredient {
  name: string;
  amount: string;
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
  ingredients: Ingredient[];
  instructions: string[];
  image_url: string | null;
  tags: string[];
  dietary_tags: string[];
}

interface UserRecipeFormProps {
  recipe: UserRecipe | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  "Breakfast", "Lunch", "Dinner", "Snack",
  "Traditional", "Street Food", "Vegetarian", "High-Protein",
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const DIFFICULTIES = ["easy", "medium"];

export function UserRecipeForm({ recipe, onClose, onSaved }: UserRecipeFormProps) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [category, setCategory] = useState(recipe?.category ?? "Dinner");
  const [mealType, setMealType] = useState(recipe?.meal_type ?? "Dinner");
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? "easy");
  const [totalTime, setTotalTime] = useState(recipe?.total_time_minutes ?? 30);
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [costMin, setCostMin] = useState(recipe?.cost_min_kes ?? 0);
  const [costMax, setCostMax] = useState(recipe?.cost_max_kes ?? 0);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [{ name: "", amount: "" }]
  );
  const [instructions, setInstructions] = useState<string[]>(
    recipe?.instructions?.length ? recipe.instructions : [""]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(recipe?.id);

  // ESC to close
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "" }]);
  const removeIngredient = (i: number) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, key: keyof Ingredient, val: string) => {
    const next = [...ingredients];
    next[i] = { ...next[i], [key]: val };
    setIngredients(next);
  };

  const addStep = () => setInstructions([...instructions, ""]);
  const removeStep = (i: number) => setInstructions(instructions.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) => {
    const next = [...instructions];
    next[i] = val;
    setInstructions(next);
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      setError("Recipe name is required.");
      return;
    }
    const cleanIngredients = ingredients.filter((i) => i.name.trim());
    if (cleanIngredients.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }
    const cleanInstructions = instructions.filter((s) => s.trim());
    if (cleanInstructions.length === 0) {
      setError("Add at least one cooking step.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      meal_type: mealType,
      difficulty,
      total_time_minutes: Number(totalTime) || 30,
      servings: Number(servings) || 2,
      cost_min_kes: Number(costMin) || 0,
      cost_max_kes: Number(costMax) || 0,
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      tags: [],
      dietary_tags: [],
    };

    try {
      const res = await fetch("/api/user-recipes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: recipe!.id, ...payload } : payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex h-[95vh] w-full max-w-2xl flex-col rounded-t-3xl border border-border bg-card sm:h-auto sm:max-h-[90vh] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {isEdit ? "Edit" : "Create"}
            </p>
            <h2 className="mt-1 font-serif text-2xl">
              {isEdit ? "Edit recipe" : "New recipe"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recipe name *
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandma's Sukuma Wiki"
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description..."
                rows={2}
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meal type
                </span>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total time (min)
                </span>
                <input
                  type="number"
                  value={totalTime}
                  onChange={(e) => setTotalTime(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Servings
                </span>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cost min (KES)
                </span>
                <input
                  type="number"
                  value={costMin}
                  onChange={(e) => setCostMin(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cost max (KES)
                </span>
                <input
                  type="number"
                  value={costMax}
                  onChange={(e) => setCostMax(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:border-accent"
                />
              </label>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ingredients *
              </span>
              <button
                onClick={addIngredient}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Plus className="size-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    placeholder="Ingredient"
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <input
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    placeholder="Amount"
                    className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  {ingredients.length > 1 && (
                    <button
                      onClick={() => removeIngredient(i)}
                      className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-red-300 hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Instructions *
              </span>
              <button
                onClick={addStep}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <Plus className="size-3" /> Add step
              </button>
            </div>
            <div className="space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {i + 1}
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}...`}
                    rows={2}
                    className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  {instructions.length > 1 && (
                    <button
                      onClick={() => removeStep(i)}
                      className="self-start rounded-xl border border-border p-2 text-muted-foreground transition hover:border-red-300 hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border p-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Recipe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}