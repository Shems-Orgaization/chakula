// components/views/shopping.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Search, Trash2, ShoppingCart, Loader2,
  CheckCircle2, Circle, Sparkles, Wallet, AlertTriangle,
  Edit3, Eye, EyeOff, ChevronDown, MoreVertical,
  Archive, Check, Leaf, Drumstick, Milk, Wheat, Flame, Package,
  Zap, CalendarDays, CalendarRange, Pin, PartyPopper, Lightbulb,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { localDateStr } from "@/lib/dates";
import { useAssistant } from "@/components/assistant-provider";
import { getEstimatedPrice, hasPrice } from "@/lib/ingredient-prices";
import { useEscape } from "@/lib/use-escape";

interface ShoppingList {
  id: string;
  name: string;
  period_type: "today" | "week" | "month" | "custom" | "event";
  start_date: string;
  end_date: string | null;
  budget: number;
  notes: string | null;
  archived: boolean;
  color: string;
}

interface ShoppingItem {
  id: string;
  list_id: string | null;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  source: "manual" | "recipe";
  category: string;
  actual_price: number | null;
}

interface ShoppingProps {
  items: string[];
  setItems: (items: string[] | ((prev: string[]) => string[])) => void;
}

const CATEGORIES: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All", icon: ShoppingCart },
  { key: "produce", label: "Produce", icon: Leaf },
  { key: "meat", label: "Meat & Fish", icon: Drumstick },
  { key: "dairy", label: "Dairy", icon: Milk },
  { key: "pantry", label: "Pantry", icon: Wheat },
  { key: "spices", label: "Spices", icon: Flame },
  { key: "other", label: "Other", icon: Package },
];

const CATEGORY_ORDER = ["produce", "meat", "dairy", "pantry", "spices", "other"];

const PERIOD_ICONS: Record<string, LucideIcon> = { 
  today: Zap, week: CalendarDays, month: CalendarRange, custom: Pin, event: PartyPopper 
};

function PeriodIcon({ type, className }: { type: string; className?: string }) {
  const Icon = PERIOD_ICONS[type] ?? Pin;
  return <Icon className={className} />;
}

const formatDate = (d: Date) => localDateStr(d);
const formatDisplay = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", { month: "short", day: "numeric" });

const getPeriodLabel = (list: ShoppingList): string => {
  if (list.period_type === "today") return "Today";
  if (list.period_type === "event") return "Event";
  if (list.end_date) return `${formatDisplay(list.start_date)} → ${formatDisplay(list.end_date)}`;
  return formatDisplay(list.start_date);
};

const isActive = (list: ShoppingList): boolean => {
  const today = formatDate(new Date());
  if (list.end_date) return list.start_date <= today && today <= list.end_date;
  return list.start_date === today;
};

export function Shopping({ setItems: setLegacyItems }: ShoppingProps) {
  const { openAssistant } = useAssistant();
  const [say, setSay] = useState("");
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [showListPicker, setShowListPicker] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState("");
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState("");
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  // Create-list form
  const [newListName, setNewListName] = useState("");
  const [newListPeriod, setNewListPeriod] = useState<"today" | "week" | "month" | "custom" | "event">("week");
  const [newListStart, setNewListStart] = useState(formatDate(new Date()));
  const [newListEnd, setNewListEnd] = useState("");
  const [newListBudget, setNewListBudget] = useState("");

  const activeList = lists.find((l) => l.id === activeListId) || null;

  // ============ LOAD LISTS ============
  const loadLists = async () => {
    const res = await apiClient("/api/shopping-lists");
    if (res.ok) {
      const fetchedLists: ShoppingList[] = res.data.lists ?? [];
      setLists(fetchedLists);
      if (fetchedLists.length > 0 && !activeListId) {
        const todayActive = fetchedLists.find((l) => isActive(l));
        setActiveListId(todayActive?.id ?? fetchedLists[0].id);
      } else if (fetchedLists.length === 0) {
        setActiveListId(null);
      }
    } else {
      toast.error(res.error);
    }
  };

  // ============ LOAD ITEMS ============
  const loadItems = async (listId: string) => {
    const res = await apiClient(`/api/shopping?list_id=${listId}`);
    if (res.ok) {
      setItems(res.data.items ?? []);
    } else {
      toast.error(res.error);
    }
  };

  // ============ INIT ============
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadLists();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (activeListId) loadItems(activeListId);
    else setItems([]);
  }, [activeListId]);

  useEffect(() => {
    if (loading) return;
    setLegacyItems(items.filter((i) => !i.checked).map((i) => i.ingredient_name));
  }, [items, loading, setLegacyItems]);

  // ============ CREATE LIST ============
  const createList = async () => {
    if (!newListName.trim() || busy) return;
    setBusy(true);

    let end = newListEnd || null;
    if (!end) {
      if (newListPeriod === "today") end = newListStart;
      else if (newListPeriod === "week") {
        const d = new Date(newListStart); d.setDate(d.getDate() + 6);
        end = formatDate(d);
      } else if (newListPeriod === "month") {
        const d = new Date(newListStart); d.setMonth(d.getMonth() + 1); d.setDate(0);
        end = formatDate(d);
      }
    }

    const res = await apiClient("/api/shopping-lists", {
      method: "POST",
      body: JSON.stringify({
        name: newListName.trim(),
        period_type: newListPeriod,
        start_date: newListStart,
        end_date: end,
        budget: newListBudget ? Number(newListBudget) : 0,
      }),
    });

    if (res.ok) {
      setLists((prev) => [res.data.list, ...prev]);
      setActiveListId(res.data.list.id);
      setShowCreateList(false);
      setNewListName("");
      setNewListPeriod("week");
      setNewListStart(formatDate(new Date()));
      setNewListEnd("");
      setNewListBudget("");
      toast.success("Shopping list created");
    } else {
      toast.error(res.error);
    }
    setBusy(false);
  };

  // ============ UPDATE LIST (Optimistic) ============
  const updateList = async (id: string, updates: Partial<ShoppingList>) => {
    const previous = [...lists];
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

    const res = await apiClient("/api/shopping-lists", {
      method: "PATCH",
      body: JSON.stringify({ id, ...updates }),
    });

    if (!res.ok) {
      setLists(previous);
      toast.error(res.error);
    }
  };

  // ============ ARCHIVE / DELETE ============
  const archiveList = async (id: string) => {
    if (!confirm("Archive this list? You can still view it later.")) return;
    const res = await apiClient(`/api/shopping-lists?id=${id}&archive=true`, { method: "DELETE" });
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (activeListId === id) setActiveListId(null);
      toast.success("List archived");
    } else {
      toast.error(res.error);
    }
  };

  const deleteList = async (id: string) => {
    if (!confirm("Delete this list and all its items? This cannot be undone.")) return;
    const res = await apiClient(`/api/shopping-lists?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== id));
      if (activeListId === id) setActiveListId(null);
      toast.success("List deleted");
    } else {
      toast.error(res.error);
    }
  };

  // ============ ADD ITEM ============
  const addItem = async () => {
    const name = input.trim();
    if (!name || busy || !activeListId) return;
    setBusy(true);

    const res = await apiClient("/api/shopping", {
      method: "POST",
      body: JSON.stringify({ ingredient_name: name, list_id: activeListId }),
    });

    if (res.ok) {
      setItems((prev) => [res.data.item, ...prev]);
      setInput("");
      toast.success("Item added");
    } else {
      toast.error(res.error);
    }
    setBusy(false);
  };

  // ============ TOGGLE (Optimistic) ============
  const toggleCheck = async (item: ShoppingItem) => {
    const newChecked = !item.checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i)));

    const res = await apiClient("/api/shopping", {
      method: "PATCH",
      body: JSON.stringify({ id: item.id, checked: newChecked }),
    });

    if (!res.ok) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)));
      toast.error(res.error);
    }
  };

  // ============ DELETE ITEM (Optimistic) ============
  const deleteItem = async (id: string) => {
    const previous = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));

    const res = await apiClient(`/api/shopping?id=${id}`, { method: "DELETE" });

    if (!res.ok) {
      setItems(previous);
      toast.error(res.error);
    }
  };

  // ============ SAVE NAME (Optimistic) ============
  const saveEdit = async (id: string) => {
    const name = editValue.trim();
    if (!name) { setEditingId(null); return; }

    const previous = [...items];
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ingredient_name: name } : i)));
    setEditingId(null);

    const res = await apiClient("/api/shopping", {
      method: "PATCH",
      body: JSON.stringify({ id, ingredient_name: name }),
    });

    if (!res.ok) {
      setItems(previous);
      toast.error(res.error);
    }
  };

  // ============ SAVE PRICE (Optimistic) ============
  const savePriceEdit = async (id: string) => {
    const trimmed = editPriceValue.trim();
    const price = trimmed === "" ? null : Number(trimmed);
    if (price !== null && (isNaN(price) || price < 0)) { setEditingPriceId(null); return; }

    const previous = [...items];
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, actual_price: price } : i)));
    setEditingPriceId(null);

    const res = await apiClient("/api/shopping", {
      method: "PATCH",
      body: JSON.stringify({ id, actual_price: price }),
    });

    if (!res.ok) {
      setItems(previous);
      toast.error(res.error);
    }
  };

  // ============ SAVE QUANTITY (Optimistic) ============
  const saveQtyEdit = async (id: string) => {
    const trimmed = editQtyValue.trim();
    const qty = trimmed === "" ? null : Number(trimmed);
    if (qty !== null && (isNaN(qty) || qty < 0)) { setEditingQtyId(null); return; }

    const previous = [...items];
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    setEditingQtyId(null);

    const res = await apiClient("/api/shopping", {
      method: "PATCH",
      body: JSON.stringify({ id, quantity: qty }),
    });

    if (!res.ok) {
      setItems(previous);
      toast.error(res.error);
    }
  };

  // ============ CLEAR ============
  const clearChecked = async () => {
    if (!activeListId || !confirm("Remove all checked items?")) return;
    const previous = [...items];
    setItems((prev) => prev.filter((i) => !i.checked));

    const res = await apiClient(`/api/shopping?clear_checked=true&list_id=${activeListId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Checked items cleared");
    } else {
      setItems(previous);
      toast.error(res.error);
    }
  };

  // ============ BUDGET ============
  const saveBudget = async () => {
    if (!activeList) return;
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 0) {
      await updateList(activeList.id, { budget: val });
      toast.success(val > 0 ? "Budget set" : "Budget removed");
    }
    setEditingBudget(false);
    setBudgetInput("");
  };

  // ============ STATS ============
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pending = total - done;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const pricedItems = items.filter((i) => i.actual_price !== null);
  const unpricedCount = items.filter((i) => i.actual_price === null).length;
  const pendingCost = items.filter((i) => !i.checked && i.actual_price !== null)
    .reduce((s, i) => s + (i.actual_price ?? 0) * (i.quantity ?? 1), 0);
  const hasBudget = (activeList?.budget ?? 0) > 0;
  const hasPrices = pricedItems.length > 0;
  const budgetPercent = hasBudget ? Math.min(Math.round((pendingCost / (activeList?.budget ?? 1)) * 100), 100) : 0;
  const overBudget = hasBudget && pendingCost > (activeList?.budget ?? 0);
  const remaining = hasBudget ? (activeList?.budget ?? 0) - pendingCost : 0;

  const estimateFor = (i: ShoppingItem) =>
    i.actual_price === null && hasPrice(i.ingredient_name) ? getEstimatedPrice(i.ingredient_name) : null;
  const estimatedCount = items.filter((i) => !i.checked && estimateFor(i)).length;
  const estimatedExtra = items.reduce((s, i) => {
    if (i.checked) return s;
    const e = estimateFor(i);
    return e ? s + e.typical * (i.quantity ?? 1) : s;
  }, 0);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, { total: number; count: number; pricedCount: number }> = {};
    for (const item of items) {
      if (item.checked) continue;
      const cat = CATEGORY_ORDER.includes(item.category) ? item.category : "other";
      if (!totals[cat]) totals[cat] = { total: 0, count: 0, pricedCount: 0 };
      totals[cat].count += 1;
      if (item.actual_price !== null) {
        totals[cat].total += item.actual_price * (item.quantity ?? 1);
        totals[cat].pricedCount += 1;
      }
    }
    return totals;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter === "pending") list = list.filter((i) => !i.checked);
    if (filter === "done") list = list.filter((i) => i.checked);
    if (activeCategory !== "all") list = list.filter((i) => i.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.ingredient_name.toLowerCase().includes(q));
    }
    return list;
  }, [items, filter, activeCategory, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    for (const item of filtered) {
      const cat = CATEGORY_ORDER.includes(item.category) ? item.category : "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.ingredient_name.localeCompare(b.ingredient_name);
      });
    });
    return groups;
  }, [filtered]);

  // ============ RENDER ============
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h1 className="section-title mt-3">Shopping lists.</h1>
          <p className="mt-3 text-muted-foreground">
            Create lists for today, this week, this month, or a special event.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-16 text-center">
          <ShoppingCart className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-serif text-2xl">No shopping lists yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first list to start shopping smart.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { setNewListPeriod("today"); setNewListName("Quick Run"); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              <Zap className="mr-1.5 inline size-4" /> Today
            </button>
            <button
              onClick={() => { setNewListPeriod("week"); setNewListName("Weekly Groceries"); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              <CalendarDays className="mr-1.5 inline size-4" /> This Week
            </button>
            <button
              onClick={() => { setNewListPeriod("month"); setNewListName("Monthly Restock"); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              <CalendarRange className="mr-1.5 inline size-4" /> This Month
            </button>
            <button
              onClick={() => { setNewListPeriod("event"); setNewListName(""); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              <PartyPopper className="mr-1.5 inline size-4" /> Event
            </button>
          </div>
        </div>

        {showCreateList && <CreateListModal {...{ newListName, setNewListName, newListPeriod, setNewListPeriod, newListStart, setNewListStart, newListEnd, setNewListEnd, newListBudget, setNewListBudget, createList, setShowCreateList, busy }} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h1 className="section-title mt-3">Shopping lists.</h1>
        </div>
        <button
          onClick={() => setShowCreateList(true)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
        >
          <Plus className="size-4" />
          New List
        </button>
      </div>

      {/* LIST SELECTOR */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <button
              onClick={() => setShowListPicker(!showListPicker)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-accent"
            >
              <div className="flex items-center gap-3 min-w-0">
                <PeriodIcon type={activeList?.period_type ?? "custom"} className="size-5 shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{activeList?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {activeList && getPeriodLabel(activeList)}
                    {activeList && isActive(activeList) && (
                      <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-accent font-semibold">
                        Active
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <ChevronDown className={`size-4 shrink-0 transition ${showListPicker ? "rotate-180" : ""}`} />
            </button>

            {showListPicker && (
              <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="max-h-80 overflow-y-auto">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => {
                        setActiveListId(list.id);
                        setShowListPicker(false);
                        setActiveCategory("all");
                        setFilter("all");
                        setSearch("");
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-secondary ${
                        list.id === activeListId ? "bg-accent/5" : ""
                      }`}
                    >
                      <PeriodIcon type={list.period_type} className="size-4 shrink-0 text-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{list.name}</p>
                        <p className="text-xs text-muted-foreground">{getPeriodLabel(list)}</p>
                      </div>
                      {list.id === activeListId && <Check className="size-4 text-accent shrink-0" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setShowListPicker(false); setShowCreateList(true); }}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-sm font-semibold text-accent transition hover:bg-secondary"
                >
                  <Plus className="size-4" />
                  Create new list
                </button>
              </div>
            )}
          </div>

          {activeList && (
            <div className="relative">
              <button
                onClick={() => setShowListMenu(!showListMenu)}
                className="rounded-xl border border-border bg-background p-2.5 transition hover:border-accent"
              >
                <MoreVertical className="size-4" />
              </button>
              {showListMenu && (
                <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                  <button
                    onClick={() => { setEditingName(true); setNameInput(activeList.name); setShowListMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-secondary"
                  >
                    <Edit3 className="size-3.5" /> Rename
                  </button>
                  <button
                    onClick={() => { archiveList(activeList.id); setShowListMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-secondary"
                  >
                    <Archive className="size-3.5" /> Archive
                  </button>
                  <button
                    onClick={() => { deleteList(activeList.id); setShowListMenu(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editingName && activeList && (
          <div className="mt-3 flex gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { updateList(activeList.id, { name: nameInput.trim() }); setEditingName(false); }
                if (e.key === "Escape") setEditingName(false);
              }}
              className="flex-1 rounded-lg border border-accent bg-background px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={() => { updateList(activeList.id, { name: nameInput.trim() }); setEditingName(false); }}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* BUDGET */}
      {activeList && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Wallet className="size-5 text-accent" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
                {editingBudget ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="number"
                      placeholder="e.g. 3000"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveBudget();
                        if (e.key === "Escape") { setEditingBudget(false); setBudgetInput(""); }
                      }}
                      className="w-32 rounded-lg border border-accent bg-background px-2 py-1 text-lg font-bold outline-none"
                    />
                    <button onClick={saveBudget} className="rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">Save</button>
                  </div>
                ) : hasBudget ? (
                  <button onClick={() => { setEditingBudget(true); setBudgetInput(String(activeList.budget)); }} className="text-left">
                    <span className="text-lg font-bold">KES {activeList.budget.toLocaleString()}</span>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(tap to edit)</span>
                  </button>
                ) : (
                  <button onClick={() => { setEditingBudget(true); setBudgetInput(""); }} className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                    <Plus className="size-3" /> Set a budget (optional)
                  </button>
                )}
              </div>
            </div>
            {hasBudget && hasPrices && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {overBudget ? "Over budget" : "Remaining"}
                </p>
                <p className={`text-lg font-bold ${overBudget ? "text-destructive" : "text-accent"}`}>
                  KES {Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {hasBudget && hasPrices && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Pending: <strong>KES {pendingCost.toLocaleString()}</strong>
                  {unpricedCount > 0 && (
                    <span className="ml-2 text-highlight">
                      · {unpricedCount} unpriced
                    </span>
                  )}
                </span>
                <span className={overBudget ? "text-destructive font-bold" : "text-accent font-bold"}>
                  {budgetPercent}%
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? "bg-destructive" : budgetPercent > 75 ? "bg-highlight" : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                />
              </div>
              {overBudget && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="size-4" />
                  <span>Over by KES {Math.abs(remaining).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {estimatedCount > 0 && (
            <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              Market estimate for {estimatedCount} unpriced item{estimatedCount === 1 ? "" : "s"}:{" "}
              <strong>≈ KES {estimatedExtra.toLocaleString()}</strong>
              {hasBudget && ` · total ≈ KES ${(pendingCost + estimatedExtra).toLocaleString()}`}. Based on one market unit (a kg, bunch or piece) per item unless you set a quantity.
            </p>
          )}

          {hasBudget && !hasPrices && total > 0 && (
            <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              <Lightbulb className="mr-1 inline size-3.5" /> Tap any item below to enter its price and track your budget.
            </p>
          )}

          {hasBudget && hasPrices && Object.keys(categoryTotals).length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <button
                onClick={() => setShowBudgetDetails(!showBudgetDetails)}
                className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {showBudgetDetails ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                {showBudgetDetails ? "Hide" : "Show"} breakdown
              </button>
              {showBudgetDetails && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {CATEGORY_ORDER.filter((c) => categoryTotals[c]).map((catKey) => {
                    const info = CATEGORIES.find((c) => c.key === catKey);
                    const { total: catTotal, count, pricedCount } = categoryTotals[catKey];
                    return (
                      <div key={catKey} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          {info && <info.icon className="size-3.5" />}
                          <span className="text-muted-foreground">{info?.label}</span>
                          <span className="text-xs text-muted-foreground">({pricedCount}/{count})</span>
                        </span>
                        <span className="font-semibold">
                          {catTotal > 0 ? `KES ${catTotal.toLocaleString()}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PROGRESS */}
      {total > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="size-5 text-accent" />
              <span className="text-sm font-semibold">{done} of {total} items</span>
            </div>
            <span className="text-sm font-bold text-accent">{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ADD ITEM */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Add an item, e.g. onions, tomatoes, beef..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void addItem(); }}
          />
          <button
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
            onClick={() => void addItem()}
            disabled={busy || !input.trim()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add
          </button>
        </div>
      </div>

      {/* AI TIDY-UP */}
      <form
        className="flex gap-2 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const t = say.trim();
          if (!t) return;
          setSay("");
          openAssistant({ page: "shopping", prompt: `Add these to my shopping list as clean ingredient names: ${t}` });
        }}
      >
        <label htmlFor="shop-ai" className="sr-only">Paste a list for Chakula</label>
        <input
          id="shop-ai"
          value={say}
          onChange={(e) => setSay(e.target.value)}
          maxLength={400}
          placeholder="Paste or type a messy list, Chakula tidies it"
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!say.trim()}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary disabled:opacity-50"
        >
          <Sparkles className="size-4" /> Tidy up
        </button>
      </form>

      {/* FILTERS */}
      {total > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:max-w-xs">
              <Search className="size-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." className="w-full bg-transparent text-sm outline-none" />
            </div>
            <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
              {(["all", "pending", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filter === f ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {f} {f === "pending" && `(${pending})`} {f === "done" && `(${done})`}
                </button>
              ))}
            </div>
            {done > 0 && (
              <button onClick={clearChecked} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary">
                Clear Done ({done})
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const count = cat.key === "all" ? items.length : items.filter((i) => i.category === cat.key).length;
              if (count === 0 && cat.key !== "all") return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                    activeCategory === cat.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  <cat.icon className="size-3.5" />
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-16 text-center">
          <ShoppingCart className="size-12 text-muted-foreground/50" />
          <div>
            <p className="font-serif text-2xl">This list is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Add items above, or generate from a recipe or meal plan.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No items match your filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((catKey) => {
            const catInfo = CATEGORIES.find((c) => c.key === catKey);
            const catItems = grouped[catKey];
            const catDone = catItems.filter((i) => i.checked).length;
            const catSubtotal = catItems.filter((i) => !i.checked && i.actual_price !== null)
              .reduce((s, i) => s + (i.actual_price ?? 0) * (i.quantity ?? 1), 0);

            return (
              <div key={catKey}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {catInfo && <catInfo.icon className="size-3.5" />}
                    {catInfo?.label}
                    <span className="text-xs font-normal normal-case">({catDone}/{catItems.length})</span>
                  </h3>
                  {catSubtotal > 0 && (
                    <span className="text-xs font-semibold text-accent">KES {catSubtotal.toLocaleString()}</span>
                  )}
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <ul className="divide-y divide-border">
                    {catItems.map((item) => {
                      const qty = item.quantity ?? 1;
                      const hasPrice = item.actual_price !== null;
                      const cost = hasPrice ? (item.actual_price ?? 0) * qty : 0;
                      const est = estimateFor(item);

                      return (
                        <li key={item.id} className={`group flex items-center gap-3 px-4 py-3 transition ${item.checked ? "bg-secondary/30" : "hover:bg-secondary/20"}`}>
                          <button onClick={() => toggleCheck(item)} className="shrink-0">
                            {item.checked ? <CheckCircle2 className="size-6 text-accent" /> : <Circle className="size-6 text-muted-foreground/40 transition group-hover:text-accent" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            {editingId === item.id ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => saveEdit(item.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit(item.id);
                                  if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                                }}
                                className="w-full rounded-lg border border-accent bg-background px-2 py-1 text-sm outline-none"
                              />
                            ) : (
                              <button onClick={() => { setEditingId(item.id); setEditValue(item.ingredient_name); }} className="w-full text-left">
                                <span className={`text-sm font-medium ${item.checked ? "text-muted-foreground line-through" : ""}`}>
                                  {item.ingredient_name}
                                </span>
                              </button>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              {editingQtyId === item.id ? (
                                <input
                                  autoFocus
                                  type="number"
                                  step="0.1"
                                  value={editQtyValue}
                                  onChange={(e) => setEditQtyValue(e.target.value)}
                                  onBlur={() => saveQtyEdit(item.id)}
                                  onKeyDown={(e) => { if (e.key === "Enter") saveQtyEdit(item.id); }}
                                  className="w-16 rounded border border-accent bg-background px-1 text-xs outline-none"
                                />
                              ) : (
                                <button onClick={() => { setEditingQtyId(item.id); setEditQtyValue(item.quantity !== null ? String(item.quantity) : ""); }} className="hover:text-accent">
                                  {item.quantity !== null ? `${item.quantity} ${item.unit ?? ""}` : "set qty"}
                                </button>
                              )}
                            </div>
                          </div>

                          {item.source === "recipe" && (
                            <span className="hidden shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent sm:inline-flex">
                              <Sparkles className="size-3" /> Recipe
                            </span>
                          )}

                          {editingPriceId === item.id ? (
                            <input
                              autoFocus
                              type="number"
                              placeholder="KES"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              onBlur={() => savePriceEdit(item.id)}
                              onKeyDown={(e) => { if (e.key === "Enter") savePriceEdit(item.id); }}
                              className="w-24 rounded-lg border border-accent bg-background px-2 py-1 text-right text-sm font-semibold outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditPriceValue(item.actual_price !== null ? String(item.actual_price) : est ? String(est.typical) : "");
                              }}
                              className="shrink-0 text-right"
                            >
                              {hasPrice ? (
                                <>
                                  <span className="text-sm font-bold text-accent">KES {cost.toLocaleString()}</span>
                                  {qty > 1 && <span className="ml-1 text-xs text-muted-foreground">({item.actual_price}×{qty})</span>}
                                </>
                              ) : (
                                <span className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-accent hover:text-accent">
                                  <Edit3 className="size-3" /> {est ? `≈ KES ${est.typical}/${est.unit}` : "Set price"}
                                </span>
                              )}
                            </button>
                          )}

                          <button onClick={() => deleteItem(item.id)} className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                            <X className="size-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateList && <CreateListModal {...{
        newListName, setNewListName,
        newListPeriod, setNewListPeriod,
        newListStart, setNewListStart,
        newListEnd, setNewListEnd,
        newListBudget, setNewListBudget,
        createList,
        setShowCreateList,
        busy
      }} />}
    </div>
  );
}

// ============ CREATE LIST MODAL ============
function CreateListModal({
  newListName, setNewListName,
  newListPeriod, setNewListPeriod,
  newListStart, setNewListStart,
  newListEnd, setNewListEnd,
  newListBudget, setNewListBudget,
  createList, setShowCreateList, busy
}: any) {
  useEscape(() => setShowCreateList(false));

  const periods = [
    { key: "today", label: "Today", icon: Zap, desc: "Quick shopping run" },
    { key: "week", label: "This Week", icon: CalendarDays, desc: "Weekly groceries" },
    { key: "month", label: "This Month", icon: CalendarRange, desc: "Monthly restock" },
    { key: "event", label: "Event", icon: PartyPopper, desc: "Party or celebration" },
    { key: "custom", label: "Custom", icon: Pin, desc: "Any date range" },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl border border-border bg-card sm:rounded-3xl" role="dialog" aria-modal="true" aria-labelledby="new-list-title">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 id="new-list-title" className="font-serif text-2xl">New shopping list</h2>
          <button onClick={() => setShowCreateList(false)} className="rounded-lg p-2 transition hover:bg-secondary" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">List name</span>
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. Weekly Groceries"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-accent"
            />
          </label>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {periods.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.key}
                    onClick={() => setNewListPeriod(p.key as any)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                      newListPeriod === p.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <Icon className="mt-0.5 size-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {(newListPeriod === "custom" || newListPeriod === "event") && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start</span>
                <input
                  type="date"
                  value={newListStart}
                  onChange={(e) => setNewListStart(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                />
              </label>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End (optional)</span>
                <input
                  type="date"
                  value={newListEnd}
                  onChange={(e) => setNewListEnd(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                />
              </label>
            </div>
          )}

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget (KES) — optional
            </span>
            <input
              type="number"
              value={newListBudget}
              onChange={(e) => setNewListBudget(e.target.value)}
              placeholder="e.g. 3000"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-border p-5">
          <button
            onClick={() => setShowCreateList(false)}
            className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={createList}
            disabled={!newListName.trim() || busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Create List
          </button>
        </div>
      </div>
    </div>
  );
}