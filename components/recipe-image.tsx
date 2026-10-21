// components/recipe-image.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { RecipePlaceholder } from "@/components/recipe-placeholder";
import { imageAlt } from "@/lib/image-overrides";
import { recipeImageSources } from "@/lib/meal-images";

interface RecipeImageProps {
  recipe: { id: string; name: string; category?: string; image?: string | null };
  images?: Record<string, string>;
  className?: string; // classes for the <img>
  placeholderClassName?: string; // classes for the placeholder
  showName?: boolean;
}

export function RecipeImage({ recipe, images = {}, ...rest }: RecipeImageProps) {
  const sources = recipeImageSources(recipe, images);
  // key resets the chain when the sources change, so a new upload shows immediately
  return <SourceChain key={sources.join("|")} recipe={recipe} images={images} sources={sources} {...rest} />;
}

function SourceChain({
  recipe, images, sources, className = "", placeholderClassName = "", showName = false,
}: RecipeImageProps & { images: Record<string, string>; sources: string[] }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const src = sources[index];

  // Catches images that already failed before React attached onError (SSR case)
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setIndex((i) => i + 1);
  }, [src]);

  if (!src) {
    return (
      <RecipePlaceholder
        name={recipe.name}
        category={recipe.category}
        showName={showName}
        className={placeholderClassName}
      />
    );
  }

  return (
    <img
      ref={ref}
      key={src}
      src={src}
      alt={imageAlt(recipe, images)}
      loading="lazy"
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  );
}