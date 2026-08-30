import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { matchRecipe, Match } from "@/lib/recommendations";

interface PantryProps {
  recipes: Recipe[];
  pantry: string[];
  setPantry: (items: string[]) => void;
  open: (recipe: Recipe) => void;
  shopping: string[];
  setShopping: (items: string[]) => void;
}

export function Pantry({
  recipes: catalog,
  pantry,
  setPantry,
  open,
  shopping,
  setShopping,
}: PantryProps) {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const matches = useMemo(
    () =>
      catalog
        .map((r) => matchRecipe(r, pantry))
        .sort((a, b) => b.score - a.score)
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
          <button
            className="primary-button bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-60"
            onClick={add}
            disabled={isAdding}
          >
            {isAdding ? "Adding…" : "Add"}
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
              onClick={() =>
                setShopping([...new Set([...shopping, ...m.missing])])
              }
            >
              Shop missing
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}