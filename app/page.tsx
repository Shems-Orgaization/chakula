// app/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { FoodApp } from "@/components/food-app";
import { View } from "@/lib/types";

export default function HomePage() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as View | null;

  // Only allow valid views – default to "home"
  const validViews: View[] = [
    "home",
    "surprise",
    "browse",
    "pantry",
    "planner",
    "meals",
    "shopping",
    "detail",
    "profile",
    "settings",
  ];
  const initialView = viewParam && validViews.includes(viewParam) ? viewParam : "home";

  return <FoodApp initialView={initialView} />;
}