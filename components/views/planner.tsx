import { ShoppingBag } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { MiniCard } from "@/components/mini-card";

interface PlannerProps {
  recipes: Recipe[];
  history: string[];
  open: (recipe: Recipe) => void;
  shopping: string[];
  images?: Record<string, string>;
}

export function Planner({
  recipes: catalog,
  history,
  open,
  shopping,
  images = {},
}: PlannerProps) {
  const menu = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    .map(
      (_, i) =>
        catalog.find((recipe) => recipe.id === history[i]) ||
        catalog[i],
    )
    .filter(Boolean) as Recipe[];

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
        {menu.map((r, i) => (
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