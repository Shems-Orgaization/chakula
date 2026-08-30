import { Search, Heart } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";

interface ExploreProps {
  recipes: Recipe[];
  query: string;
  setQuery: (q: string) => void;
  category: string;
  setCategory: (c: string) => void;
  favorite: string[];
  toggle: (id: string) => void;
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
}

export function Explore({
  recipes: list,
  query,
  setQuery,
  category,
  setCategory,
  favorite,
  toggle,
  open,
  images = {},
}: ExploreProps) {
  const cats = [
    "All",
    "Breakfast",
    "Street",
    "Quick Meals",
    "Rice",
    "Ugali",
    "Beans",
    "Ndengu",
    "Vegetables",
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Explore the menu</p>
        <h1 className="section-title mt-3">Find your next plate.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          From ndengu to smocha, find food that feels like home.
        </p>
      </div>

      <div className="panel flex flex-col gap-5">
        <div className="search-box w-full sm:max-w-xl">
          <Search className="size-4 text-muted-foreground" />
          <input
            aria-label="Search meals"
            placeholder="Search meals, e.g. mukimo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="category-scroll flex gap-2 overflow-x-auto pb-2">
          {cats.map((c) => (
            <button
              key={c}
              className={`filter-pill whitespace-nowrap ${
                category === c ? "filter-pill-active" : ""
              }`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="recipe-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <article
            className="recipe-card relative rounded-2xl border border-border bg-card overflow-hidden transition hover:shadow-lg"
            key={r.id}
          >
            <button className="block w-full" onClick={() => open(r)}>
              <img
                src={recipeImage(r, images)}
                alt={imageAlt(r, images)}
                className="aspect-[1.2] w-full object-cover"
              />
            </button>

            <button
              className={`absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur transition hover:scale-110 ${
                favorite.includes(r.id)
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
              onClick={() => toggle(r.id)}
              aria-label="Save meal"
            >
              <Heart
                className={`size-4 ${favorite.includes(r.id) ? "fill-current" : ""}`}
              />
            </button>

            <button className="block w-full p-4 text-left" onClick={() => open(r)}>
              <p className="eyebrow text-accent">
                {r.category} · {r.mealType}
              </p>
              <h2 className="mt-1 font-serif text-2xl group-hover:text-accent transition-colors">
                {r.name}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                {r.description}
              </p>
              <div className="mt-4 flex gap-3 text-xs font-semibold text-muted-foreground">
                <span>{r.totalTime} min</span>
                <span>{formatCost(r.estimatedCost)}</span>
                <span>{r.difficulty}</span>
              </div>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}