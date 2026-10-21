// components/mini-card.tsx
"use client";

import { Recipe } from "@/lib/recipes";
import { formatCost } from "@/lib/recommendations";
import { RecipeImage } from "@/components/recipe-image";

interface MiniCardProps {
  recipe: Recipe;
  open: () => void;
  images?: Record<string, string>;
}

export function MiniCard({ recipe, open, images = {} }: MiniCardProps) {
  return (
    <button className="group text-left" onClick={open}>
      <div className="overflow-hidden rounded-2xl transition duration-500 group-hover:shadow-lg">
        <RecipeImage
          recipe={recipe}
          images={images}
          className="aspect-[1.2] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 font-serif text-xl transition-colors group-hover:text-accent">
        {recipe.name}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {recipe.totalTime} min · {formatCost(recipe.estimatedCost)}
      </p>
    </button>
  );
}