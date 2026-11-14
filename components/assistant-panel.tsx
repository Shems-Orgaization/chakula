"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Send, Sparkles, Undo2, X } from "lucide-react";
import { formatCost } from "@/lib/recommendations";
import type { AssistantAction, AssistantPage, ChatMessage, ExploreFilters, PlanItem } from "@/lib/assistant-types";

const CHIPS: Record<AssistantPage, string[]> = {
  dashboard: ["What can I cook now?", "Cheapest meals for today"],
  explore: ["Cheap meals under 20 minutes", "Quick meals for tonight"],
  detail: ["Make it cheaper", "Make it quicker", "What to serve with this?", "What to do with leftovers?"],
  other: ["What can I cook with my pantry?", "Cheap Kenyan dinner ideas"],
};
const LABEL: Record<AssistantPage, string> = { dashboard: "Dashboard", explore: "Explore", detail: "This recipe", other: "Chakula" };

function filterSummary(f: ExploreFilters) {
  const p: string[] = [];
  if (f.query) p.push(`"${f.query}"`);
  if (f.category) p.push(f.category);
  if (f.maxBudget) p.push(`under KES ${f.maxBudget}`);
  if (f.maxTime) p.push(`under ${f.maxTime} min`);
  if (f.sort) p.push(f.sort === "cheapest" ? "cheapest first" : f.sort === "quickest" ? "quickest first" : "best match");
  if (f.usePantry) p.push("use my pantry");
  return p.join(", ");
}

function actionText(a: AssistantAction, budget: number) {
  if (a.type === "plan_meals") return { title: `Plan ${a.items.length} meal${a.items.length === 1 ? "" : "s"}`, detail: "Preview below, saved only when you tap Apply" };
  if (a.type === "create_recipe") return { title: "Save new recipe", detail: `${a.draft.name} · AI-made, cost estimated KES ${a.draft.cost.min}–${a.draft.cost.max}` };
  if (a.type === "my_version") return { title: "Save as My version", detail: `${a.draft.name} · AI-made, cost estimated KES ${a.draft.cost.min}–${a.draft.cost.max}` };
  if (a.type === "suggest_correction") return { title: `Suggest correction: ${a.recipeName}`, detail: a.note };
  if (a.type === "set_filters") return { title: "Apply filters", detail: filterSummary(a.filters) };
  if (a.type === "add_to_shopping") return { title: `Add ${a.names.length} item${a.names.length === 1 ? "" : "s"} to shopping`, detail: a.names.join(", ") };
  if (a.type === "save_favorite") return { title: "Save to favourites", detail: a.recipeName };
  return { title: `Set budget to KES ${a.amount}`, detail: `Now KES ${budget}` };
}

function PlanPreview({ items, budget, onSend }: { items: PlanItem[]; budget: number; onSend: (t: string) => void }) {
  const days = [...new Set(items.map((i) => i.date))].sort();
  return (
    <div className="mt-2 space-y-2 text-xs">
      {days.map((d) => {
        const rows = items.filter((i) => i.date === d);
        const total = rows.reduce((s, i) => s + Math.round((i.cost.min + i.cost.max) / 2), 0);
        const over = budget > 0 && total > budget;
        const label = new Date(`${d}T00:00:00`).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
        return (
          <div key={d}>
            <p className="font-semibold text-foreground">
              {label} · estimate KES {total}
              {over && <span className="text-warm"> · over budget</span>}
            </p>
            <ul className="text-muted-foreground">
              {rows.map((i) => <li key={i.slot} className="capitalize">{i.slot}: {i.recipeName}</li>)}
            </ul>
            {over && (
              <button type="button" onClick={() => onSend(`Plan ${d} again, cheaper, under KES ${budget} for the whole day.`)} className="mt-1 font-semibold text-accent hover:underline">
                Swap for something cheaper
              </button>
            )}
          </div>
        );
      })}
      <p className="text-muted-foreground">A meal already planned in these slots will be replaced. Undo brings it back.</p>
    </div>
  );
}

type Props = {
  page: AssistantPage;
  messages: ChatMessage[];
  loading: boolean;
  budget: number;
  done: Record<string, "applied" | "undone">;
  canUndo: (key: string) => boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  onOpenRecipe: (id: string) => void;
  onApply: (key: string, a: AssistantAction) => void;
  onUndo: (key: string) => void;
};

export function AssistantPanel({ page, messages, loading, budget, done, canUndo, onClose, onSend, onOpenRecipe, onApply, onUndo }: Props) {
  const [text, setText] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    if (window.matchMedia("(min-width: 768px)").matches) inputRef.current?.focus();
    else dialogRef.current?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading]);

  function submit() {
    const t = text.trim();
    if (!t || loading) return;
    setText("");
    onSend(t);
  }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[79] bg-foreground/40 md:hidden" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-label="Ask Chakula assistant"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
        className="fixed inset-x-0 bottom-0 z-[80] flex h-[85vh] flex-col rounded-t-3xl border-t border-border bg-card shadow-xl outline-none md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[420px] md:rounded-none md:border-l md:border-t-0"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-semibold leading-tight text-primary">Ask Chakula</p>
            <p className="text-xs text-muted-foreground">{LABEL[page]}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close assistant" className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">Ask about meals, ingredients or your budget. Answers use Chakula recipes.</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "space-y-2"}>
              <p
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent px-3.5 py-2 text-sm text-accent-foreground"
                    : `max-w-[92%] whitespace-pre-wrap rounded-2xl bg-secondary px-3.5 py-2 text-sm text-foreground ${m.error ? "border border-destructive/40" : ""}`
                }
              >
                {m.text}
              </p>
              {m.recipes?.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onOpenRecipe(r.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition hover:bg-secondary"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{r.name}</span>
                    <span className="block text-xs text-muted-foreground">{r.category} · {r.time} min</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-highlight/15 px-2 py-0.5 text-xs font-semibold text-highlight">{formatCost(r.cost)}</span>
                </button>
              ))}
              {m.actions?.map((a, i) => {
                const key = `${m.id}:${i}`;
                const t = actionText(a, budget);
                const applied = done[key] === "applied";
                return (
                  <div key={key} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.detail}</p>
                      {(a.type === "create_recipe" || a.type === "my_version") && (
                        <details className="mt-1.5 text-xs text-muted-foreground">
                          <summary className="cursor-pointer font-semibold text-foreground">See recipe</summary>
                          <p className="mt-1">{a.draft.ingredients.map((i) => `${i.amount || i.qty || ""} ${i.name}`.trim()).join(", ")}</p>
                          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                            {a.draft.instructions.map((s, n) => <li key={n}>{s}</li>)}
                          </ol>
                        </details>
                      )}
                      {a.type === "plan_meals" && <PlanPreview items={a.items} budget={budget} onSend={onSend} />}
                    </div>
                    {applied ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Check className="size-3.5" /> Applied</span>
                        {canUndo(key) && (
                          <button type="button" onClick={() => onUndo(key)} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-secondary">
                            <Undo2 className="size-3.5" /> Undo
                          </button>
                        )}
                      </div>
                    ) : (
                      <button type="button" onClick={() => onApply(key, a)} className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition hover:opacity-90">
                        Apply
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {loading && (
            <div className="space-y-2" aria-hidden="true">
              <div className="h-9 w-3/4 animate-pulse rounded-2xl bg-secondary" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-secondary" />
            </div>
          )}
          {loading && <p className="sr-only">Thinking</p>}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {CHIPS[page].map((c) => (
              <button key={c} type="button" disabled={loading} onClick={() => onSend(c)} className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary disabled:opacity-60">
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2">
            <label htmlFor="assistant-input" className="sr-only">Message Chakula</label>
            <textarea
              id="assistant-input"
              ref={inputRef}
              rows={2}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="What would you like to cook?"
              className="min-h-10 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={submit} disabled={loading || !text.trim()} aria-label="Send" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition hover:opacity-90 disabled:opacity-60">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}