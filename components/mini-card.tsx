// components/mini-card.tsx
import { Recipe } from "@/lib/recipes";
import { recipeImage } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";

interface MiniCardProps {
  recipe: Recipe;
  open: () => void;
  images?: Record<string, string>;
}

export function MiniCard({ recipe, open, images = {} }: MiniCardProps) {
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