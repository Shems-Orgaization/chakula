// components/views/pantry.tsx
"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { addToShoppingList } from "@/lib/shopping-actions";
import { Recipe } from "@/lib/recipes";
import { matchRecipe, Match } from "@/lib/recommendations";
import { RecipeImage } from "@/components/recipe-image"; // ✅ ADDED

interface PantryProps {
  recipes: Recipe[];
  pantry: string[];
  setPantry: (items: string[]) => void;
  open: (recipe: Recipe) => void;
  shopping: string[];
  setShopping: (items: string[]) => void;
  images?: Record<string, string>; // ✅ ADDED
}

export function Pantry({
  recipes: catalog,
  pantry,
  setPantry,
  open,
  shopping,
  setShopping,
  images = {}, // ✅ ADDED
}: PantryProps) {
  const [input, setInput] = useState("");

  const matches = useMemo(
    () =>
      catalog
        .map((r) => matchRecipe(r, pantry))
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8),
    [pantry, catalog],
  );

  const add = () => {
    const name = input.trim();
    if (!name) return;
    if (pantry.some((x) => x.toLowerCase() === name.toLowerCase())) {
      toast.info("That's already in your pantry.");
      setInput("");
      return;
    }

    // The pantry is saved with your preferences (see food-app.tsx).
    setPantry([...pantry, name]);
    setInput("");
  };

  const shopMissing = async (missing: string[]) => {
    if (missing.length === 0) {
      toast.info("You already have everything for this one.");
      return;
    }
    const res = await addToShoppingList(missing);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setShopping([...new Set([...shopping, ...missing])]);
    toast.success(
      res.added > 0
        ? `Added ${res.added} item${res.added === 1 ? "" : "s"} to your shopping list.`
        : "Those are already on your shopping list.",
    );
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
          <button
            className="primary-button bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
            onClick={add}
          >
            Add
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {pantry.map((item) => (
            <button
              key={item}
              className="ingredient-chip flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/70 transition"
              onClick={() => setPantry(pantry.filter((x) => x !== item))}
            >
              {item} <X className="size-3" />
            </button>
          ))}
        </div>
      </div>

      <h2 className="section-title text-3xl">Here&apos;s what you can make</h2>

      {matches.length === 0 && (
        <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {pantry.length === 0
            ? "Add what's in your kitchen above and we'll show meals you can cook."
            : "No meals match yet. Add a few more ingredients."}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <article
            key={m.recipe.id}
            className="match-row flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={() => open(m.recipe)}
            >
              {/* ✅ REPLACED WITH RecipeImage */}
              <div className="size-16 shrink-0 overflow-hidden rounded-lg">
                <RecipeImage
                  recipe={m.recipe}
                  images={images}
                  className="size-full object-cover"
                  placeholderClassName="!aspect-auto h-full"
                />
              </div>
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
              className="secondary-button inline-flex shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary transition sm:px-4 sm:text-sm"
              onClick={() => void shopMissing(m.missing)}
            >
              Shop missing
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}