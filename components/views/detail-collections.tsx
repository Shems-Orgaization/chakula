// components/views/detail-collections.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, Library, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { MESSAGES } from "@/lib/messages";
import { CollectionIcon } from "./collections";

interface CollectionItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  itemCount: number;
}

export function DetailCollections({ recipeId, onClose }: { recipeId: string; onClose: () => void }) {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const [all, current] = await Promise.all([
        apiClient<{ collections?: CollectionItem[] }>("/api/collections"),
        apiClient<{ collectionIds?: string[] }>(`/api/collections/for-recipe?recipe_id=${recipeId}`),
      ]);
      if (!active) return;
      if (all.ok && current.ok) {
        setCollections(all.data?.collections ?? []);
        setSelected(new Set(current.data?.collectionIds ?? []));
      } else {
        toast.error(all.error ?? current.error ?? MESSAGES.network.generic);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [recipeId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const current = await apiClient<{ collectionIds?: string[] }>(`/api/collections/for-recipe?recipe_id=${recipeId}`);
      if (!current.ok) throw new Error(current.error ?? MESSAGES.network.generic);

      const removed = (current.data?.collectionIds ?? []).filter((id) => !selected.has(id));
      for (const collectionId of removed) {
        const del = await apiClient(`/api/collections/items?collection_id=${collectionId}&recipe_id=${recipeId}`, { method: "DELETE" });
        if (!del.ok) throw new Error(del.error ?? MESSAGES.network.generic);
      }

      if (selected.size > 0) {
        const add = await apiClient("/api/collections/items", {
          method: "POST",
          body: JSON.stringify({ recipe_id: recipeId, collection_ids: Array.from(selected) }),
        });
        if (!add.ok) throw new Error(add.error ?? MESSAGES.network.generic);
      }

      toast.success("Saved to collections");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : MESSAGES.network.generic);
    } finally {
      setSaving(false);
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);

    const created = await apiClient<{ collection?: { id: string } }>("/api/collections", {
      method: "POST",
      body: JSON.stringify({ name, icon: "library", color: "orange" }),
    });
    if (!created.ok) {
      toast.error(created.error ?? MESSAGES.network.generic);
      setSaving(false);
      return;
    }

    const newId = created.data?.collection?.id;
    if (newId) {
      const add = await apiClient("/api/collections/items", {
        method: "POST",
        body: JSON.stringify({ recipe_id: recipeId, collection_ids: [newId] }),
      });
      if (!add.ok) {
        toast.error(add.error ?? MESSAGES.network.generic);
        setSaving(false);
        return;
      }
    }

    toast.success("Collection created & saved");
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="collections-title" className="relative w-full max-w-md rounded-t-3xl border border-border bg-card sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="eyebrow">Add to</p>
            <h2 id="collections-title" className="mt-1 font-serif text-2xl">Collections</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 transition hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        {creating ? (
          <div className="p-5">
            <p className="mb-3 text-sm text-muted-foreground">Create a new collection and add this recipe.</p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void createAndAdd()}
              placeholder="e.g. Weekend BBQ"
              aria-label="Collection name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setCreating(false)} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void createAndAdd()}
                disabled={!newName.trim() || saving}
                className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Create & add"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[55vh] overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-accent" />
                </div>
              ) : collections.length === 0 ? (
                <div className="py-6 text-center">
                  <Library className="mx-auto size-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No collections yet.</p>
                  <button type="button" onClick={() => setCreating(true)} className="mt-3 text-sm font-semibold text-accent hover:underline">
                    Create your first collection
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {collections.map((c) => {
                    const on = selected.has(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleSelect(c.id)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${on ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-secondary"}`}
                      >
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground"}`}>
                          <CollectionIcon icon={c.icon} className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{c.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {c.itemCount} {c.itemCount === 1 ? "recipe" : "recipes"}
                          </span>
                        </span>
                        {on && <Check className="size-5 shrink-0 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-accent hover:text-accent"
              >
                <Plus className="size-4" />
                Create new collection
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="mx-auto size-4 animate-spin" /> : `Save${selected.size > 0 ? ` (${selected.size})` : ""}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}