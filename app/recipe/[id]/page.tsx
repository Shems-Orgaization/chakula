// app/recipe/[id]/page.tsx
import { FoodApp } from "@/components/food-app";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FoodApp initialView="detail" selectedId={id} />;
}