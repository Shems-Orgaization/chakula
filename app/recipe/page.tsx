// app/recipe/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { FoodApp } from "@/components/food-app";

export default function RecipePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <FoodApp
      initialView="detail"
      {...({ selectedId: id } as any)}
    />
  );
}