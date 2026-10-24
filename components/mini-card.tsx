// components/mini-card.tsx
"use client";

import { Flame } from "lucide-react";
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
    <button
      type="button"
      className="group rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      onClick={open}
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted transition duration-500 group-hover:shadow-lg">
        {/* RecipeImage picks the best photo: upload → public/meals → online backup → placeholder */}
        <RecipeImage
          recipe={recipe}
          images={images}
          className="aspect-[1.2] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        {recipe.isComradeFriendly && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
            <Flame className="size-3" />
            Comrade
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-1 font-serif text-xl transition-colors group-hover:text-accent">
        {recipe.name}
      </p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        {recipe.totalTime} min · {formatCost(recipe.estimatedCost)}
      </p>
    </button>
  );
}