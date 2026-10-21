// app/recipe/page.tsx
// There is no recipe without an id, so send anyone who lands on /recipe to /explore.
import { redirect } from "next/navigation";

export default function RecipeIndexPage() {
  redirect("/explore");
}