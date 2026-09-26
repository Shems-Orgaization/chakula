"use client";

import { useEffect, useState } from "react";
import {
  Plus, X, Loader2, MoreVertical, Edit3, Trash2,
  Library, BookOpen, ChevronLeft, Check, Search, FolderPlus,
  Heart, PartyPopper, Utensils, Salad, Beef, Soup, Cake, Pizza,
  Coffee, Flame, Star, Sparkles, Award, Gift, CakeSlice
} from "lucide-react";
import { Recipe } from "@/lib/recipes";
import { recipeImage, imageAlt } from "@/lib/image-overrides";
import { formatCost } from "@/lib/recommendations";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  itemCount: number;
  previewImages: string[];
  created_at: string;
}

interface CollectionsProps {
  open: (recipe: Recipe) => void;
  images?: Record<string, string>;
}

// Map icon keys to Lucide components
const ICON_MAP: Record<string, any> = {
  library: Library,
  heart: Heart,
  party: PartyPopper,
  utensils: Utensils,
  salad: Salad,
  beef: Beef,
  soup: Soup,
  cake: CakeSlice,
  pizza: Pizza,
  coffee: Coffee,
  flame: Flame,
  star: Star,
  sparkles: Sparkles,
  award: Award,
  gift: Gift,
  book: BookOpen,
};

const ICON_OPTIONS = [
  "library", "heart", "party", "utensils",
  "salad", "beef", "soup", "cake",
  "pizza", "coffee", "flame", "star",
];

const COLOR_OPTIONS = ["orange", "red", "green", "blue", "purple", "yellow"];

// Subtle tint backgrounds (no loud gradients)
const COLOR_STYLES: Record<string, { bg: string; icon: string; dot: string }> = {
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    icon: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    icon: "text-green-600 dark:text-green-400",
    dot: "bg-green-500",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    icon: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    icon: "text-yellow-600 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
};

// Helper to render icon
export function CollectionIcon({ icon, className = "size-5" }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] || Library;
  return <Icon className={className} />;
}

export function Collections({ open, images = {} }: CollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("library");
  const [newColor, setNewColor] = useState("orange");

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      setCollections(data.collections ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const createCollection = async () => {
    if (!newName.trim()) return;

    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        description: newDescription.trim(),
        icon: newIcon,
        color: newColor,
      }),
    });

    if (res.ok) {
      await loadCollections();
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      setNewIcon("library");
      setNewColor("orange");
      showNotice("Collection created");
    }
  };

  const updateCollection = async () => {
    if (!editingCollection) return;

    await fetch("/api/collections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingCollection.id,
        name: newName.trim(),
        description: newDescription.trim(),
        icon: newIcon,
        color: newColor,
      }),
    });

    await loadCollections();
    setEditingCollection(null);
    showNotice("Collection updated");
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Recipes won't be deleted.")) return;

    await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setOpenMenuId(null);
    showNotice("Collection deleted");
  };

  const startEdit = (c: Collection) => {
    setEditingCollection(c);
    setNewName(c.name);
    setNewDescription(c.description ?? "");
    setNewIcon(c.icon);
    setNewColor(c.color);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingCollection(null);
    setNewName("");
    setNewDescription("");
    setNewIcon("library");
    setNewColor("orange");
  };

  if (openCollectionId) {
    const collection = collections.find((c) => c.id === openCollectionId);
    if (collection) {
      return (
        <CollectionDetail
          collection={collection}
          onBack={() => {
            setOpenCollectionId(null);
            loadCollections();
          }}
          open={open}
          images={images}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">Your Collections</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Group recipes that belong together — meals, moods, occasions.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          <FolderPlus className="size-4" />
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <EmptyCollections onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const style = COLOR_STYLES[c.color] || COLOR_STYLES.orange;
            return (
              <div
                key={c.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:border-accent/50 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenCollectionId(c.id)}
                  className={`block w-full ${style.bg} p-6 text-left`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-xl bg-background/80 ${style.icon}`}>
                      <CollectionIcon icon={c.icon} className="size-6" />
                    </div>
                    <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                      {c.itemCount} {c.itemCount === 1 ? "recipe" : "recipes"}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-2xl truncate">{c.name}</h3>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </button>

                {c.previewImages.length > 0 && (
                  <div className="flex gap-1 px-6 pb-4 pt-3">
                    {c.previewImages.slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="h-14 flex-1 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Menu button */}
                <div className="absolute right-2 top-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === c.id ? null : c.id);
                    }}
                    className="rounded-lg bg-background/80 p-1.5 backdrop-blur transition hover:bg-background"
                  >
                    <MoreVertical className="size-4" />
                  </button>

                  {openMenuId === c.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                        <button
                          onClick={() => startEdit(c)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-secondary"
                        >
                          <Edit3 className="size-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => deleteCollection(c.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create card */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center transition hover:border-accent hover:bg-accent/5"
          >
            <FolderPlus className="size-10 text-muted-foreground/50" />
            <p className="font-serif text-lg">New collection</p>
            <p className="text-xs text-muted-foreground">Group recipes your way</p>
          </button>
        </div>
      )}

      {/* Create / Edit modal */}
      {(showCreate || editingCollection) && (
        <CollectionFormModal
          isEdit={Boolean(editingCollection)}
          name={newName}
          setName={setNewName}
          description={newDescription}
          setDescription={setNewDescription}
          icon={newIcon}
          setIcon={setNewIcon}
          color={newColor}
          setColor={setNewColor}
          onCancel={resetForm}
          onSubmit={editingCollection ? updateCollection : createCollection}
        />
      )}

      {notice && (
        <div className="fixed bottom-5 right-5 z-[90] rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
          <p className="text-sm font-medium">{notice}</p>
        </div>
      )}
    </div>
  );
}

// ============ EMPTY STATE ============
function EmptyCollections({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-16 text-center">
      <Library className="size-14 text-muted-foreground/40" />
      <p className="mt-4 font-serif text-2xl">No collections yet</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first collection. Ideas: "Weekend BBQ", "Quick Breakfasts", "Comfort Food", "Party Recipes".
      </p>
      <button
        onClick={onCreate}
        className="mt-4 flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
      >
        <Plus className="size-4" />
        Create your first collection
      </button>
    </div>
  );
}

// ============ COLLECTION DETAIL ============
function CollectionDetail({
  collection,
  onBack,
  open,
  images,
}: {
  collection: Collection;
  onBack: () => void;
  open: (r: Recipe) => void;
  images: Record<string, string>;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const style = COLOR_STYLES[collection.color] || COLOR_STYLES.orange;

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${collection.id}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [collection.id]);

  const removeItem = async (recipeId: string) => {
    if (!confirm("Remove from collection?")) return;
    setItems((prev) => prev.filter((i) => i.recipe_id !== recipeId));
    await fetch(
      `/api/collections/${collection.id}?recipe_id=${recipeId}`,
      { method: "DELETE" }
    );
  };

  const filtered = items.filter((item) =>
    !search || item.recipe.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to collections
      </button>

      <div className={`rounded-2xl border border-border ${style.bg} p-6`}>
        <div className="flex items-center gap-4">
          <div className={`flex size-16 items-center justify-center rounded-2xl bg-background/80 ${style.icon}`}>
            <CollectionIcon icon={collection.icon} className="size-8" />
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-4xl">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:max-w-md">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
          <p className="mt-3 font-serif text-xl">This collection is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add recipes from any recipe page — just tap "Collections".
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No recipes match your search.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const r = item.recipe;
            return (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg">
                <button onClick={() => open(r)} className="block w-full">
                  <img
                    src={recipeImage(r, images) ?? undefined}
                    alt={imageAlt(r, images)}
                    className="aspect-[1.2] w-full object-cover"
                  />
                </button>
                <button
                  onClick={() => removeItem(r.id)}
                  className="absolute right-3 top-3 rounded-full bg-background/90 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                  aria-label="Remove from collection"
                >
                  <X className="size-4" />
                </button>
                <button onClick={() => open(r)} className="block w-full p-4 text-left">
                  <p className="eyebrow text-accent">{r.category} · {r.mealType}</p>
                  <h3 className="mt-1 font-serif text-xl">{r.name}</h3>
                  <div className="mt-2 flex gap-3 text-xs font-semibold text-muted-foreground">
                    <span>{r.totalTime} min</span>
                    <span>{formatCost(r.estimatedCost)}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ FORM MODAL ============
function CollectionFormModal({
  isEdit,
  name,
  setName,
  description,
  setDescription,
  icon,
  setIcon,
  color,
  setColor,
  onCancel,
  onSubmit,
}: any) {
  const style = COLOR_STYLES[color] || COLOR_STYLES.orange;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl border border-border bg-card sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-serif text-2xl">
            {isEdit ? "Edit collection" : "New collection"}
          </h2>
          <button onClick={onCancel} className="rounded-lg p-2 transition hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend BBQ"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this collection about?"
              rows={2}
              className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          {/* Icon picker */}
          <div className="mt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Icon
            </span>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((i) => {
                const IconComp = ICON_MAP[i] || Library;
                const selected = icon === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`flex aspect-square items-center justify-center rounded-xl border-2 transition ${
                      selected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <IconComp className={`size-5 ${selected ? "text-accent" : "text-muted-foreground"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div className="mt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => {
                const cStyle = COLOR_STYLES[c];
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`flex size-10 items-center justify-center rounded-xl border-2 transition ${
                      selected ? "border-foreground" : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className={`size-6 rounded-lg ${cStyle.dot}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <div className={`mt-2 rounded-2xl border border-border ${style.bg} p-5`}>
              <div className={`flex size-12 items-center justify-center rounded-xl bg-background/80 ${style.icon}`}>
                {(() => {
                  const IconComp = ICON_MAP[icon] || Library;
                  return <IconComp className="size-6" />;
                })()}
              </div>
              <h3 className="mt-3 font-serif text-2xl truncate">
                {name || "Collection name"}
              </h3>
              {description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">0 recipes</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-border p-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!name.trim()}
            className="flex-1 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isEdit ? "Save Changes" : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}