import { Heart } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeService } from "@/lib/recipes";
import { MiniCard } from "@/components/mini-card";

interface MealsProps {
  loved: Recipe[];
  history: string[];
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
}

export function Meals({ loved, history, open, images = {} }: MealsProps) {
  const all = [
    ...loved,
    ...history.map((id) => recipeService.get(id)).filter(Boolean),
  ] as Recipe[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Your collection</p>
        <h1 className="section-title mt-3">My meals.</h1>
      </div>

      {all.length ? (
        <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((r) => (
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