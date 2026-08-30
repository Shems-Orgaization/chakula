import { useState, type ChangeEvent } from "react";
import { Heart, UtensilsCrossed, Clock3, ShoppingBag, ChefHat, X } from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { imageAlt, recipeImage } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";

interface DetailProps {
  recipe: Recipe;
  favorite: boolean;
  toggle: () => void;
  cook: () => void;
  onBack: () => void;
  images?: Record<string, string>;
  onImageChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}

export function Detail({
  recipe,
  favorite,
  toggle,
  cook,
  onBack,
  images = {},
  onImageChange,
}: DetailProps) {
  const [cookMode, setCookMode] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [currentImage, setCurrentImage] = useState(
    images[recipe.id] || recipe.image,
  );
  const [customImage, setCustomImage] = useState(Boolean(images[recipe.id]));
  const [uploading, setUploading] = useState(false);

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB");
      return;
    }

    setUploading(true);
    const preview = URL.createObjectURL(file);
    setCurrentImage(preview);
    setCustomImage(true);

    const formData = new FormData();
    formData.append("recipeId", recipe.id);
    formData.append("file", file);

    try {
      const response = await fetch("/api/recipe-images", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        setCurrentImage(images[recipe.id] || recipe.image);
        setCustomImage(Boolean(images[recipe.id]));
        alert("Failed to upload image");
        return;
      }

      onImageChange((current) => ({
        ...current,
        [recipe.id]: payload.url,
      }));
      setCurrentImage(payload.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetImage = async () => {
    try {
      await fetch(`/api/recipe-images?recipeId=${recipe.id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Delete error:", error);
    }

    onImageChange((current) => {
      const next = { ...current };
      delete next[recipe.id];
      return next;
    });
    setCurrentImage(recipe.image);
    setCustomImage(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <button
        className="back-button flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        onClick={onBack}
      >
        ← Back to explore
      </button>

      <article className="overflow-hidden rounded-[2rem] border border-border bg-card">
        {/* Image */}
        <div className="relative h-[360px] sm:h-[500px]">
          <img
            src={currentImage}
            alt={imageAlt(recipe, images)}
            className="size-full object-cover"
          />

          <div className="absolute right-5 top-5 z-10 flex gap-2">
            <label className="secondary-button cursor-pointer rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition">
              {uploading ? "Uploading…" : "Change photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={chooseImage}
                disabled={uploading}
              />
            </label>
            {customImage && (
              <button
                className="secondary-button rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition"
                onClick={resetImage}
              >
                Reset
              </button>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6 text-background sm:p-10">
            <div className="flex flex-wrap gap-2">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span className="tag rounded-full bg-background/20 px-3 py-1 text-xs font-medium" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-3 font-serif text-5xl sm:text-7xl">
              {recipe.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-background/80 sm:text-lg">
              {recipe.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[.85fr_1.15fr]">
          <div className="flex flex-col gap-6">
            <div className="meta-grid flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock3 className="size-4" />
                {recipe.totalTime} min
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="size-4" />
                {formatCost(recipe.estimatedCost)}
              </span>
              <span className="flex items-center gap-1">
                <ChefHat className="size-4" />
                {recipe.difficulty}
              </span>
            </div>

            <div>
              <h2 className="detail-heading mb-3 font-serif text-2xl">Ingredients</h2>
              <ul className="ingredient-list space-y-2">
                {recipe.ingredients.map((i) => (
                  <li key={i.name} className="flex items-center justify-between">
                    <label
                      className={`flex items-center gap-2 ${
                        checked.includes(i.name)
                          ? "line-through opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked.includes(i.name)}
                        onChange={() =>
                          setChecked(
                            checked.includes(i.name)
                              ? checked.filter((x) => x !== i.name)
                              : [...checked, i.name],
                          )
                        }
                        className="rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                      />{" "}
                      {i.name}
                    </label>
                    <span className="text-sm text-muted-foreground">{i.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="mb-6 flex justify-end gap-2">
              <button
                className="secondary-button flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold hover:bg-secondary transition"
                onClick={toggle}
              >
                <Heart className={favorite ? "fill-current text-red-500" : ""} />{" "}
                {favorite ? "Saved" : "Save"}
              </button>
              <button
                className="primary-button flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90 transition"
                onClick={() => {
                  cook();
                  setCookMode(true);
                }}
              >
                <UtensilsCrossed className="size-4" /> Let&apos;s cook
              </button>
            </div>

            <h2 className="detail-heading mb-3 font-serif text-2xl">Instructions</h2>
            <ol className="steps-list space-y-4">
              {recipe.instructions.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-6">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>

      {/* Cook Mode */}
      {cookMode && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border p-5">
            <div>
              <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground">Cook mode</p>
              <h2 className="font-serif text-2xl">{recipe.name}</h2>
            </div>
            <button
              className="icon-button rounded-lg p-2 hover:bg-secondary transition"
              onClick={() => setCookMode(false)}
              aria-label="Close cook mode"
            >
              <X className="size-5" />
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="max-w-2xl">
              <span className="font-serif text-8xl text-accent/20">
                {String(step + 1).padStart(2, "0")}
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight">
                {recipe.instructions[step]}
              </h1>
              <p className="mt-5 text-muted-foreground">
                Step {step + 1} of {recipe.instructions.length}
              </p>
            </div>
          </div>

          <footer className="flex items-center justify-between border-t border-border p-5">
            <button
              className="secondary-button rounded-xl border border-border px-6 py-2.5 font-semibold hover:bg-secondary transition disabled:opacity-50"
              disabled={!step}
              onClick={() => setStep(step - 1)}
            >
              Previous
            </button>
            <button
              className="primary-button rounded-xl bg-accent px-6 py-2.5 font-semibold text-accent-foreground hover:opacity-90 transition"
              onClick={() =>
                step === recipe.instructions.length - 1
                  ? setCookMode(false)
                  : setStep(step + 1)
              }
            >
              {step === recipe.instructions.length - 1 ? "Done" : "Next"}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}