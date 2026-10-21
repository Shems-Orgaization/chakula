// app/recipe/[id]/page.tsx
import { redirect } from "next/navigation";
import { FoodApp } from "@/components/food-app";
import { createClient } from "@/lib/supabase/server";
import { mapDbRecipe, type DbRecipeRow } from "@/lib/recipe-mapper";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("recipes")
    .select("*")
    .or(`slug.eq.${id},id.eq.${id}`)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) redirect("/explore");

  return (
    <FoodApp
      initialView="detail"
      selectedId={id}
      initialRecipe={mapDbRecipe(data as DbRecipeRow)}
    />
  );
}