// components/views/detail-image-controls.tsx
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Link2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { MESSAGES } from "@/lib/messages";

export type ImageUpdater = (
  updater: (prev: Record<string, string>) => Record<string, string>,
) => void;

interface Props {
  recipeId: string;
  hasPhoto: boolean;
  globalMode: boolean;
  onPreview: (url: string | null) => void;
  onImageChange: ImageUpdater;
  onGlobalImageChange?: (id: string, url: string | null) => void;
}

const item =
  "flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-secondary disabled:opacity-50";

export function DetailImageControls({
  recipeId,
  hasPhoto,
  globalMode,
  onPreview,
  onImageChange,
  onGlobalImageChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4MB.");
      input.value = "";
      return;
    }

    setBusy(true);
    const blobUrl = URL.createObjectURL(file);
    onPreview(blobUrl);

    const formData = new FormData();
    formData.append("recipeId", recipeId);
    formData.append("file", file);

    const res = await apiClient<{ url?: string; scope?: string }>("/api/recipe-images", {
      method: "POST",
      body: formData,
    });
    const url = res.data?.url;

    if (!res.ok || !url) {
      toast.error(res.error ?? MESSAGES.network.generic);
    } else {
      if (res.data?.scope === "global") onGlobalImageChange?.(recipeId, url);
      else onImageChange((current) => ({ ...current, [recipeId]: url }));
      toast.success("Image updated");
    }

    setBusy(false);
    onPreview(null);
    URL.revokeObjectURL(blobUrl);
    input.value = "";
    setOpen(false);
  };

  const pasteLink = async () => {
    const url = window.prompt("Paste the image link (https://...)")?.trim();
    if (!url) return;
    setBusy(true);
    const res = await apiClient<{ url?: string }>("/api/recipe-images", {
      method: "PATCH",
      body: JSON.stringify({ recipeId, url }),
    });
    if (!res.ok || !res.data?.url) toast.error(res.error ?? MESSAGES.network.generic);
    else {
      onGlobalImageChange?.(recipeId, res.data.url);
      toast.success("Image link saved");
    }
    setBusy(false);
    setOpen(false);
  };

  const resetImage = async () => {
    setBusy(true);
    const res = await apiClient<{ scope?: string }>(`/api/recipe-images?recipeId=${recipeId}`, {
      method: "DELETE",
    });
    if (res.ok && res.data?.scope === "global") onGlobalImageChange?.(recipeId, null);
    else if (!res.ok) toast.error(res.error ?? MESSAGES.network.generic);

    onImageChange((current) => {
      const next = { ...current };
      delete next[recipeId];
      return next;
    });
    setBusy(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className="absolute right-3 top-3 z-10">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-background/90 px-4 text-sm font-semibold backdrop-blur hover:bg-background"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
        Photo
      </button>

      {open && (
        <div role="menu" className="ml-auto mt-2 w-48 rounded-2xl border border-border bg-card p-1 shadow-lg">
          <label role="menuitem" className={item}>
            <ImagePlus className="size-4" />
            {hasPhoto ? "Change photo" : "Add photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={chooseImage} disabled={busy} />
          </label>
          {globalMode && (
            <button type="button" role="menuitem" className={item} onClick={pasteLink} disabled={busy}>
              <Link2 className="size-4" />
              Paste link
            </button>
          )}
          {hasPhoto && (
            <button type="button" role="menuitem" className={item} onClick={resetImage} disabled={busy}>
              <RotateCcw className="size-4" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}