// components/mini-card.tsx
"use client";

import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";
import { RecipePlaceholder } from "@/components/recipe-placeholder";

interface MiniCardProps {
  recipe: Recipe;
  open: () => void;
  images?: Record<string, string>;
}

export function MiniCard({ recipe, open, images = {} }: MiniCardProps) {
  const img = recipeImage(recipe, images);

  return (
    <button className="group text-left" onClick={open}>
      {img ? (
        <img
          src={img}
          alt={imageAlt(recipe, images)}
          className="aspect-[1.2] w-full rounded-2xl object-cover transition duration-500 group-hover:scale-[1.02] group-hover:shadow-lg"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl transition duration-500 group-hover:scale-[1.02] group-hover:shadow-lg">
          <RecipePlaceholder
            name={recipe.name}
            category={recipe.category}
            showName={false}
          />
        </div>
      )}
      <p className="mt-3 font-serif text-xl transition-colors group-hover:text-accent">
        {recipe.name}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {recipe.totalTime} min · {formatCost(recipe.estimatedCost)}
      </p>
    </button>
  );
}