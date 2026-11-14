"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { localDateStr } from "@/lib/dates";
import { addToShoppingList } from "@/lib/shopping-actions";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/recipes";
import type { View } from "@/lib/types";
import type { AssistantAction, AssistantContext, AssistantPage, AssistantResponse, ChatMessage, FilterHandler } from "@/lib/assistant-types";
import { AssistantPanel } from "./assistant-panel";

type OpenArgs = { page?: AssistantPage; prompt?: string; context?: AssistantContext };
type Ctx = { openAssistant: (args?: OpenArgs) => void; registerFilters: (fn: FilterHandler | null) => void };
const AssistantCtx = createContext<Ctx | null>(null);

export function useAssistant(): Ctx {
  const c = useContext(AssistantCtx);
  if (!c) throw new Error("useAssistant must be used inside AssistantProvider");
  return c;
}

type Props = {
  children: ReactNode;
  view: View;
  selectedId?: string;
  catalog: Recipe[];
  budget: number;
  pantry: string[];
  favorites: string[];
  onOpenRecipe: (r: Recipe) => void;
  onSetFavorite: (id: string, on: boolean) => void;
  onSetBudget: (n: number) => void;
  onShoppingAdded: (names: string[]) => void;
  onPlansChanged: () => void;
};

const pageOf = (v: View): AssistantPage => (v === "home" ? "dashboard" : v === "browse" ? "explore" : v === "detail" ? "detail" : "other");

export function AssistantProvider({ children, view, selectedId, catalog, budget, pantry, favorites, onOpenRecipe, onSetFavorite, onSetBudget, onShoppingAdded, onPlansChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [override, setOverride] = useState<{ view: View; page: AssistantPage; extra: AssistantContext } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Record<string, "applied" | "undone">>({});
  const messagesRef = useRef<ChatMessage[]>([]);
  const busy = useRef(false);
  const seq = useRef(0);
  const undos = useRef(new Map<string, () => void>());
  const applying = useRef(new Set<string>());
  const filtersFn = useRef<FilterHandler | null>(null);
  const registerFilters = useCallback((fn: FilterHandler | null) => { filtersFn.current = fn; }, []);

  const ov = override && override.view === view ? override : null;
  const page = ov?.page ?? pageOf(view);

  const uid = () => String(++seq.current);
  const commit = (next: ChatMessage[]) => {
    messagesRef.current = next.slice(-10);
    setMessages(messagesRef.current);
  };
  const ctxFor = (pg: AssistantPage, extra?: AssistantContext): AssistantContext => ({
    budget,
    pantry: pantry.slice(0, 40),
    date: localDateStr(),
    recipeId: pg === "detail" ? selectedId : undefined,
    ...extra,
  });

  async function send(text: string, pg: AssistantPage, ctx: AssistantContext) {
    const msg = text.trim().slice(0, 1000);
    if (!msg || busy.current) return;
    busy.current = true;
    setLoading(true);
    const history = messagesRef.current.filter((m) => !m.error).slice(-4).map((m) => ({ role: m.role, text: m.text.slice(0, 300) }));
    commit([...messagesRef.current, { id: uid(), role: "user", text: msg }]);

    const res = await apiClient<AssistantResponse>("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ message: msg, page: pg, context: ctx, history }),
    });

    if (res.ok) {
      commit([...messagesRef.current, { id: uid(), role: "assistant", text: res.data.reply, recipes: res.data.recipes, actions: res.data.actions }]);
    } else {
      const errText =
        res.status === 429
          ? res.code === "cooldown"
            ? "Please wait a few seconds, then ask again."
            : "The assistant is resting. Try again later."
          : res.error;
      commit([...messagesRef.current, { id: uid(), role: "assistant", text: errText, error: true }]);
    }
    busy.current = false;
    setLoading(false);
  }

  function openAssistant(args: OpenArgs = {}) {
    const pg = args.page ?? pageOf(view);
    setOverride({ view, page: pg, extra: args.context ?? {} });
    setOpen(true);
    if (args.prompt) void send(args.prompt, pg, ctxFor(pg, args.context));
  }

  async function openRecipe(id: string) {
    setOpen(false);
    const hit = catalog.find((r) => r.id === id);
    if (hit) return onOpenRecipe(hit);
    const res = await apiClient<Recipe>(`/api/recipes/${id}`);
    if (res.ok) onOpenRecipe(res.data);
    else toast.error(res.error);
  }

  async function apply(key: string, a: AssistantAction) {
    if (done[key] === "applied" || applying.current.has(key)) return;
    applying.current.add(key);
    try {
      if (a.type === "set_budget") {
        const prev = budget;
        onSetBudget(a.amount);
        undos.current.set(key, () => onSetBudget(prev));
      } else if (a.type === "save_favorite") {
        const was = favorites.includes(a.recipeId);
        onSetFavorite(a.recipeId, true);
        if (!was) undos.current.set(key, () => onSetFavorite(a.recipeId, false));
      } else if (a.type === "set_filters") {
        const fn = filtersFn.current;
        if (!fn) { toast.error("Open Explore to apply filters."); return; }
        undos.current.set(key, fn(a.filters));
        setOpen(false);
        toast.success("Filters applied", { action: { label: "Undo", onClick: () => undo(key) } });
      } else if (a.type === "create_recipe" || a.type === "my_version") {
        const d = a.draft;
        const res = await apiClient<{ recipe: { id: string } }>("/api/user-recipes", {
          method: "POST",
          body: JSON.stringify({
            name: d.name, description: d.description, category: d.category, meal_type: d.mealType,
            total_time_minutes: d.totalTime, servings: d.servings,
            cost_min_kes: d.cost.min, cost_max_kes: d.cost.max,
            ingredients: d.ingredients, instructions: d.instructions,
            tags: a.type === "my_version" ? ["AI-made", "My version"] : ["AI-made"],
          }),
        });
        if (!res.ok) { toast.error(res.error); return; }
        const id = res.data.recipe.id;
        undos.current.set(key, () => { void apiClient(`/api/user-recipes?id=${id}`, { method: "DELETE" }); });
        toast.success("Saved to My recipes");
      } else if (a.type === "suggest_correction") {
        const sb = createSupabaseClient();
        const { data } = await sb.auth.getUser();
        if (!data.user) { toast.error("Please log in again."); return; }
        const { error } = await sb.from("recipe_corrections").insert({ recipe_id: a.recipeId, user_id: data.user.id, note: a.note });
        if (error) { toast.error("Could not send your note."); return; }
        toast.success("Thanks, we will review it");
      } else if (a.type === "plan_meals") {
        const dates = a.items.map((i) => i.date).sort();
        const cur = await apiClient<{ plans: { plan_date: string; meal_type: string; recipe_id: string; servings: number }[] }>(
          `/api/plans?start=${dates[0]}&end=${dates[dates.length - 1]}`,
        );
        if (!cur.ok) { toast.error(cur.error); return; }
        const before = new Map(cur.data.plans.map((p) => [`${p.plan_date}|${p.meal_type}`, p]));
        const restore = async (list: typeof a.items) => {
          for (const i of list) {
            const prev = before.get(`${i.date}|${i.slot}`);
            if (prev) await apiClient("/api/plans", { method: "POST", body: JSON.stringify({ plan_date: i.date, meal_type: i.slot, recipe_id: prev.recipe_id, servings: prev.servings }) });
            else await apiClient(`/api/plans?date=${i.date}&meal_type=${i.slot}`, { method: "DELETE" });
          }
        };
        const saved: typeof a.items = [];
        for (const i of a.items) {
          const r = await apiClient("/api/plans", { method: "POST", body: JSON.stringify({ plan_date: i.date, meal_type: i.slot, recipe_id: i.recipeId }) });
          if (!r.ok) {
            toast.error(r.error);
            await restore(saved);
            onPlansChanged();
            return;
          }
          saved.push(i);
        }
        undos.current.set(key, () => { void restore(saved).then(onPlansChanged); });
        onPlansChanged();
        toast.success(`Planned ${saved.length} meal${saved.length === 1 ? "" : "s"}`);
      } else if (a.type === "add_to_shopping") {
        const r = await addToShoppingList(a.names);
        if (!r.ok) {
          toast.error(r.error);
          return;
        }
        onShoppingAdded(a.names);
      }
      setDone((d) => ({ ...d, [key]: "applied" }));
    } finally {
      applying.current.delete(key);
    }
  }

  function undo(key: string) {
    undos.current.get(key)?.();
    undos.current.delete(key);
    setDone((d) => ({ ...d, [key]: "undone" }));
  }

  return (
    <AssistantCtx.Provider value={{ openAssistant, registerFilters }}>
      {children}
      {open && (
        <AssistantPanel
          page={page}
          messages={messages}
          loading={loading}
          budget={budget}
          done={done}
          canUndo={(k: string) => undos.current.has(k)}
          onClose={() => setOpen(false)}
          onSend={(t: string) => void send(t, page, ctxFor(page, ov?.extra))}
          onOpenRecipe={(id: string) => void openRecipe(id)}
          onApply={(k: string, a: AssistantAction) => void apply(k, a)}
          onUndo={undo}
        />
      )}
    </AssistantCtx.Provider>
  );
}