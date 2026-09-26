// components/views/detail.tsx
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, UtensilsCrossed, Clock3, ShoppingBag, ChefHat, X,
  Library, Check, Plus, Loader2
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { imageAlt, recipeImage } from "@/lib/image-overrides";
import { RecipePlaceholder } from "@/components/recipe-placeholder";
import { CollectionIcon } from "./collections";

const formatCost = (cost: { min: number; max: number }) =>
  `KSh ${cost.min.toLocaleString()}-${cost.max.toLocaleString()}`;

interface DetailProps {
  recipe: Recipe;
  favorite: boolean;
  toggle: () => void;
  cook: () => void;
  onBack: () => void;
  images?: Record<string, string>;
  onImageChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
}

interface CollectionItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
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
  const router = useRouter();
  const [cookMode, setCookMode] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  // ✅ Image state — can be null
  const [currentImage, setCurrentImage] = useState<string | null>(
    recipeImage(recipe, images)
  );
  const [customImage, setCustomImage] = useState(Boolean(images[recipe.id]));
  const [uploading, setUploading] = useState(false);
  const [loggingCook, setLoggingCook] = useState(false);

  // ---- COLLECTIONS STATE ----
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [savingToCollections, setSavingToCollections] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // ---- KEEP IMAGE IN SYNC ----
  useEffect(() => {
    setCurrentImage(recipeImage(recipe, images));
    setCustomImage(Boolean(images[recipe.id]));
  }, [recipe.id, images]);

  // ---- FETCH COLLECTIONS ----
  useEffect(() => {
    if (!showCollectionPicker) return;
    (async () => {
      setLoadingCollections(true);
      try {
        const [collectionsRes, currentRes] = await Promise.all([
          fetch("/api/collections"),
          fetch(`/api/collections/for-recipe?recipe_id=${recipe.id}`),
        ]);
        const collectionsData = await collectionsRes.json();
        const currentData = await currentRes.json();
        setCollections(collectionsData.collections ?? []);
        setSelectedCollectionIds(new Set(currentData.collectionIds ?? []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCollections(false);
      }
    })();
  }, [showCollectionPicker, recipe.id]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  // ---- LOG COOK TO DB + START COOK MODE ----
  const handleStartCooking = async () => {
    // 1. Update local history
    cook();
    // 2. Open cook mode immediately for responsive UX
    setCookMode(true);
    // 3. Log to database in background
    setLoggingCook(true);
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_id: recipe.id,
          recipe_name: recipe.name,
        }),
      });
    } catch (err) {
      console.error("Failed to log cook:", err);
    } finally {
      setLoggingCook(false);
    }
  };

  // ---- IMAGE UPLOAD ----
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
        setCurrentImage(recipeImage(recipe, images));
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
    setCurrentImage(recipeImage(recipe, images));
    setCustomImage(false);
  };

  // ---- COLLECTIONS ----
  const toggleCollectionSelect = (id: string) => {
    const next = new Set(selectedCollectionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCollectionIds(next);
  };

  const saveToCollections = async () => {
    setSavingToCollections(true);
    try {
      const currentRes = await fetch(`/api/collections/for-recipe?recipe_id=${recipe.id}`);
      const currentData = await currentRes.json();
      const currentIds: string[] = currentData.collectionIds ?? [];

      const removedIds = currentIds.filter((id) => !selectedCollectionIds.has(id));
      for (const collectionId of removedIds) {
        await fetch(
          `/api/collections/items?collection_id=${collectionId}&recipe_id=${recipe.id}`,
          { method: "DELETE" }
        );
      }

      if (selectedCollectionIds.size > 0) {
        await fetch("/api/collections/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: recipe.id,
            collection_ids: Array.from(selectedCollectionIds),
          }),
        });
      }

      setShowCollectionPicker(false);
      showNotice("Saved to collections");
    } catch (err) {
      console.error(err);
      showNotice("Failed to save");
    } finally {
      setSavingToCollections(false);
    }
  };

  const createAndAddNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    setSavingToCollections(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          icon: "library",
          color: "orange",
        }),
      });
      const data = await res.json();

      if (data.collection?.id) {
        await fetch("/api/collections/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipe_id: recipe.id,
            collection_ids: [data.collection.id],
          }),
        });
      }

      setShowCollectionPicker(false);
      setShowCreateNew(false);
      setNewCollectionName("");
      showNotice("Collection created & saved");
    } catch (err) {
      console.error(err);
      showNotice("Failed to create");
    } finally {
      setSavingToCollections(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <button
        className="back-button flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        onClick={() => router.back()}
      >
        ← Back to explore
      </button>

      <article className="overflow-hidden rounded-[2rem] border border-border bg-card">
        {/* Image / Placeholder */}
        <div className="relative h-[360px] sm:h-[500px]">
          {currentImage ? (
            <img
              src={currentImage}
              alt={imageAlt(recipe, images)}
              className="size-full object-cover"
            />
          ) : (
            <RecipePlaceholder
              name={recipe.name}
              category={recipe.category}
              className="h-full !aspect-auto"
            />
          )}

          <div className="absolute right-5 top-5 z-10 flex gap-2">
            <label className="secondary-button cursor-pointer rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition">
              {uploading ? "Uploading…" : currentImage ? "Change photo" : "Add photo"}
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
                <span
                  className="tag rounded-full bg-background/20 px-3 py-1 text-xs font-medium"
                  key={tag}
                >
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
              <h2 className="detail-heading mb-3 font-serif text-2xl">
                Ingredients
              </h2>
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
                              : [...checked, i.name]
                          )
                        }
                        className="rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                      />{" "}
                      {i.name}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {i.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="mb-6 flex flex-wrap justify-end gap-2">
              <button
                className="secondary-button flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold hover:bg-secondary transition"
                onClick={() => setShowCollectionPicker(true)}
              >
                <Library className="size-4" />
                Collections
              </button>

              <button
                className="secondary-button flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-semibold hover:bg-secondary transition"
                onClick={toggle}
              >
                <Heart className={favorite ? "fill-current text-red-500" : ""} />{" "}
                {favorite ? "Saved" : "Save"}
              </button>

              {/* ✅ COOK BUTTON — logs to DB */}
              <button
                className="primary-button flex items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90 transition disabled:opacity-60"
                onClick={handleStartCooking}
                disabled={loggingCook}
              >
                {loggingCook ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="size-4" />
                    Let&apos;s cook
                  </>
                )}
              </button>
            </div>

            <h2 className="detail-heading mb-3 font-serif text-2xl">
              Instructions
            </h2>
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

      {/* COLLECTION PICKER MODAL */}
      {showCollectionPicker && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Add to
                </p>
                <h3 className="mt-1 font-serif text-2xl">Collections</h3>
              </div>
              <button
                onClick={() => {
                  setShowCollectionPicker(false);
                  setShowCreateNew(false);
                }}
                className="rounded-lg p-2 transition hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>

            {showCreateNew ? (
              <div className="p-5">
                <p className="mb-3 text-sm text-muted-foreground">
                  Create a new collection and add this recipe.
                </p>
                <input
                  autoFocus
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Weekend BBQ"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createAndAddNewCollection();
                  }}
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowCreateNew(false)}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createAndAddNewCollection}
                    disabled={!newCollectionName.trim() || savingToCollections}
                    className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    {savingToCollections ? (
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    ) : (
                      "Create & Add"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="max-h-[55vh] overflow-y-auto p-4">
                  {loadingCollections ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="size-6 animate-spin text-accent" />
                    </div>
                  ) : collections.length === 0 ? (
                    <div className="py-6 text-center">
                      <Library className="mx-auto size-10 text-muted-foreground/40" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        No collections yet.
                      </p>
                      <button
                        onClick={() => setShowCreateNew(true)}
                        className="mt-3 text-sm font-semibold text-accent hover:underline"
                      >
                        + Create your first collection
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {collections.map((c) => {
                        const selected = selectedCollectionIds.has(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleCollectionSelect(c.id)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                              selected
                                ? "bg-accent/10 ring-1 ring-accent/30"
                                : "hover:bg-secondary"
                            }`}
                          >
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-accent/15 text-accent"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              <CollectionIcon icon={c.icon} className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {c.itemCount}{" "}
                                {c.itemCount === 1 ? "recipe" : "recipes"}
                              </p>
                            </div>
                            {selected && (
                              <Check className="size-5 shrink-0 text-accent" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-4">
                  <button
                    onClick={() => setShowCreateNew(true)}
                    className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-accent hover:text-accent"
                  >
                    <Plus className="size-4" />
                    Create new collection
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCollectionPicker(false)}
                      className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveToCollections}
                      disabled={savingToCollections}
                      className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                      {savingToCollections ? (
                        <Loader2 className="mx-auto size-4 animate-spin" />
                      ) : (
                        `Save${
                          selectedCollectionIds.size > 0
                            ? ` (${selectedCollectionIds.size})`
                            : ""
                        }`
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* COOK MODE */}
      {cookMode && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border p-5">
            <div>
              <p className="eyebrow text-xs uppercase tracking-wider text-muted-foreground">
                Cook mode
              </p>
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

      {/* NOTICE */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-[90] rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
          <p className="text-sm font-medium">{notice}</p>
        </div>
      )}
    </div>
  );
}