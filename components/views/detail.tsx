// components/views/detail.tsx
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, UtensilsCrossed, Clock3, ShoppingBag, ChefHat, X,
  Library, Check, Plus, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Recipe } from "@/lib/recipes";
import { RecipeImage } from "@/components/recipe-image";
import { CollectionIcon } from "./collections";
import { apiClient } from "@/lib/api-client";
import { MESSAGES } from "@/lib/messages";
import { formatCost } from "@/lib/recommendations";

interface DetailProps {
  recipe: Recipe;
  favorite: boolean;
  toggle: () => void;
  cook: () => void;
  onBack: () => void;
  images?: Record<string, string>;
  onImageChange: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  onGlobalImageChange?: (id: string, url: string | null) => void;
  canEditImage?: boolean;
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
  onGlobalImageChange,
  canEditImage = true,
}: DetailProps) {
  const router = useRouter();
  const [cookMode, setCookMode] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  // ✅ Global mode logic
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);
  const globalMode = process.env.NEXT_PUBLIC_RECIPE_IMAGE_MODE === "global";
  const shownImages =
    preview && preview.id === recipe.id ? { ...images, [recipe.id]: preview.url } : images;
  const customImage = globalMode
    ? Boolean(recipe.image) || preview?.id === recipe.id
    : Boolean(shownImages[recipe.id]);

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

  // ---- FETCH COLLECTIONS ----
  useEffect(() => {
    if (!showCollectionPicker) return;
    (async () => {
      setLoadingCollections(true);
      try {
        const [collectionsRes, currentRes] = await Promise.all([
          apiClient("/api/collections"),
          apiClient(`/api/collections/for-recipe?recipe_id=${recipe.id}`),
        ]);
        
        if (collectionsRes.ok && currentRes.ok) {
          setCollections(collectionsRes.data.collections ?? []);
          setSelectedCollectionIds(new Set(currentRes.data.collectionIds ?? []));
        } else {
          toast.error(collectionsRes.error || currentRes.error);
        }
      } catch (err) {
        toast.error(MESSAGES.network.generic);
      } finally {
        setLoadingCollections(false);
      }
    })();
  }, [showCollectionPicker, recipe.id]);

  // Keep the screen awake in cook mode (floury hands).
  useEffect(() => {
    if (!cookMode || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) void sentinel.release();
        else lock = sentinel;
      } catch {}
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };
    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [cookMode]);

  // ---- LOG COOK TO DB + START COOK MODE ----
  const handleStartCooking = async () => {
    cook();
    setStep(0);
    setCookMode(true);
    setLoggingCook(true);
    
    const res = await apiClient("/api/meals", {
      method: "POST",
      body: JSON.stringify({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
      }),
    });

    if (!res.ok) {
      toast.error(res.error);
    }
    setLoggingCook(false);
  };

  // ---- IMAGE UPLOAD ----
  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4MB.");
      return;
    }
    
    setUploading(true);
    const blobUrl = URL.createObjectURL(file);
    setPreview({ id: recipe.id, url: blobUrl });
    
    const formData = new FormData();
    formData.append("recipeId", recipe.id);
    formData.append("file", file);

    const res = await apiClient<{ url?: string; scope?: string }>("/api/recipe-images", {
      method: "POST",
      body: formData,
    });
    const payload = res.data;

    if (!res.ok || !payload?.url) {
      toast.error(res.error ?? MESSAGES.network.generic);
      setPreview(null);
    } else {
      if (payload.scope === "global") {
        onGlobalImageChange?.(recipe.id, payload.url);
      } else {
        onImageChange((current) => ({ ...current, [recipe.id]: payload.url! }));
      }
      toast.success("Image updated");
    }

    setUploading(false);
    setPreview(null);
    URL.revokeObjectURL(blobUrl);
  };

  const pasteLink = async () => {
    const url = window.prompt("Paste the image link (https://...)")?.trim();
    if (!url) return;
    setUploading(true);

    const res = await apiClient("/api/recipe-images", {
      method: "PATCH",
      body: JSON.stringify({ recipeId: recipe.id, url }),
    });

    if (!res.ok) {
      toast.error(res.error);
    } else {
      onGlobalImageChange?.(recipe.id, res.data.url);
      toast.success("Image link saved");
    }
    setUploading(false);
  };

  const resetImage = async () => {
    setUploading(true);
    const res = await apiClient(`/api/recipe-images?recipeId=${recipe.id}`, { method: "DELETE" });
    
    if (res.ok && res.data.scope === "global") {
      onGlobalImageChange?.(recipe.id, null);
    } else if (!res.ok) {
      toast.error(res.error);
    }

    onImageChange((current) => {
      const next = { ...current };
      delete next[recipe.id];
      return next;
    });
    setUploading(false);
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
      const currentRes = await apiClient(`/api/collections/for-recipe?recipe_id=${recipe.id}`);
      if (!currentRes.ok) throw new Error(currentRes.error);

      const currentIds: string[] = currentRes.data.collectionIds ?? [];
      const removedIds = currentIds.filter((id) => !selectedCollectionIds.has(id));
      
      // Remove items
      for (const collectionId of removedIds) {
        const delRes = await apiClient(`/api/collections/items?collection_id=${collectionId}&recipe_id=${recipe.id}`, { method: "DELETE" });
        if (!delRes.ok) throw new Error(delRes.error);
      }

      // Add items
      if (selectedCollectionIds.size > 0) {
        const addRes = await apiClient("/api/collections/items", {
          method: "POST",
          body: JSON.stringify({
            recipe_id: recipe.id,
            collection_ids: Array.from(selectedCollectionIds),
          }),
        });
        if (!addRes.ok) throw new Error(addRes.error);
      }

      setShowCollectionPicker(false);
      toast.success("Saved to collections");
    } catch (err: any) {
      toast.error(err.message || MESSAGES.network.generic);
    } finally {
      setSavingToCollections(false);
    }
  };

  const createAndAddNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    setSavingToCollections(true);
    
    const createRes = await apiClient("/api/collections", {
      method: "POST",
      body: JSON.stringify({
        name: newCollectionName.trim(),
        icon: "library",
        color: "orange",
      }),
    });

    if (!createRes.ok) {
      toast.error(createRes.error);
      setSavingToCollections(false);
      return;
    }

    const newId = createRes.data.collection?.id;
    if (newId) {
      const addRes = await apiClient("/api/collections/items", {
        method: "POST",
        body: JSON.stringify({
          recipe_id: recipe.id,
          collection_ids: [newId],
        }),
      });
      
      if (!addRes.ok) {
        toast.error(addRes.error);
        setSavingToCollections(false);
        return;
      }
    }

    setShowCollectionPicker(false);
    setShowCreateNew(false);
    setNewCollectionName("");
    toast.success("Collection created & saved");
    setSavingToCollections(false);
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
          <RecipeImage
            recipe={recipe}
            images={shownImages}
            showName
            className="size-full object-cover"
            placeholderClassName="h-full !aspect-auto"
          />

          {/* ✅ ADMIN-ONLY BUTTONS */}
          {canEditImage && (
            <div className="absolute right-5 top-5 z-10 flex gap-2">
              <label className="secondary-button cursor-pointer rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition">
                {uploading ? "Uploading…" : customImage ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={chooseImage}
                  disabled={uploading}
                />
              </label>
              {globalMode && (
                <button
                  className="secondary-button rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition"
                  onClick={pasteLink}
                  disabled={uploading}
                >
                  Paste link
                </button>
              )}
              {customImage && (
                <button
                  className="secondary-button rounded-xl bg-background/90 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-background/80 transition"
                  onClick={resetImage}
                  disabled={uploading}
                >
                  Reset
                </button>
              )}
            </div>
          )}

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
            <p className="-mt-3 text-xs text-muted-foreground">
              Approximate cost of ingredients only. Gas or charcoal not included.
            </p>

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
                <li key={`${i}-${s}`} className="flex gap-3">
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
    </div>
  );
}