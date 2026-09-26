"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, X, Search, Trash2, ShoppingCart, Loader2,
  CheckCircle2, Circle, Sparkles, Wallet, AlertTriangle,
  Edit3, Eye, EyeOff, Calendar, ChevronDown, MoreVertical,
  Archive, Copy, Check, Star
} from "lucide-react";

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

const CATEGORIES = [
  { key: "all", label: "All", icon: "🛒" },
  { key: "produce", label: "Produce", icon: "🥬" },
  { key: "meat", label: "Meat & Fish", icon: "🥩" },
  { key: "dairy", label: "Dairy", icon: "🥛" },
  { key: "pantry", label: "Pantry", icon: "🥫" },
  { key: "spices", label: "Spices", icon: "🧂" },
  { key: "other", label: "Other", icon: "📦" },
];

const CATEGORY_ORDER = ["produce", "meat", "dairy", "pantry", "spices", "other"];

const PERIOD_ICONS: Record<string, string> = {
  today: "⚡",
  week: "📅",
  month: "🗓️",
  custom: "📌",
  event: "🎉",
};

// Date helpers
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const formatDisplay = (dateStr: string) =>
  new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", { month: "short", day: "numeric" });

const getWeekRange = (from: Date) => {
  const start = new Date(from);
  const end = new Date(from);
  end.setDate(end.getDate() + 6);
  return [start, end];
};

const getMonthRange = (from: Date) => {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(from.getFullYear(), from.getMonth() + 1, 0);
  return [start, end];
};

const getPeriodLabel = (list: ShoppingList): string => {
  if (list.period_type === "today") return "Today";
  if (list.period_type === "event") return "Event";
  
  if (list.end_date) {
    return `${formatDisplay(list.start_date)} → ${formatDisplay(list.end_date)}`;
  }
  return formatDisplay(list.start_date);
};

const isActive = (list: ShoppingList): boolean => {
  const today = formatDate(new Date());
  if (list.end_date) {
    return list.start_date <= today && today <= list.end_date;
  }
  return list.start_date === today;
};

export function Shopping({ items: legacyItems, setItems: setLegacyItems }: ShoppingProps) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [notice, setNotice] = useState<string | null>(null);
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
    try {
      const res = await fetch("/api/shopping-lists");
      const data = await res.json();
      const fetchedLists: ShoppingList[] = data.lists ?? [];
      setLists(fetchedLists);

      // Auto-select: active list today, else most recent
      if (fetchedLists.length > 0 && !activeListId) {
        const todayActive = fetchedLists.find((l) => isActive(l));
        setActiveListId(todayActive?.id ?? fetchedLists[0].id);
      } else if (fetchedLists.length === 0) {
        setActiveListId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============ LOAD ITEMS ============
  const loadItems = async (listId: string) => {
    try {
      const res = await fetch(`/api/shopping?list_id=${listId}`);
      const data = await res.json();
      setItems(data.items ?? []);
      const names = (data.items ?? []).filter((i: ShoppingItem) => !i.checked).map((i: ShoppingItem) => i.ingredient_name);
      setLegacyItems(names);
    } catch (err) {
      console.error(err);
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

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  // ============ CREATE LIST ============
  const createList = async () => {
    if (!newListName.trim()) return;

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

    const res = await fetch("/api/shopping-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newListName.trim(),
        period_type: newListPeriod,
        start_date: newListStart,
        end_date: end,
        budget: newListBudget ? Number(newListBudget) : 0,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setLists((prev) => [data.list, ...prev]);
      setActiveListId(data.list.id);
      setShowCreateList(false);
      setNewListName("");
      setNewListPeriod("week");
      setNewListStart(formatDate(new Date()));
      setNewListEnd("");
      setNewListBudget("");
      showNotice("✅ List created");
    }
  };

  // ============ UPDATE LIST ============
  const updateList = async (id: string, updates: Partial<ShoppingList>) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    await fetch("/api/shopping-lists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
  };

  // ============ ARCHIVE / DELETE ============
  const archiveList = async (id: string) => {
    if (!confirm("Archive this list? You can still view it later.")) return;
    await fetch(`/api/shopping-lists?id=${id}&archive=true`, { method: "DELETE" });
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) setActiveListId(null);
    showNotice("📦 List archived");
  };

  const deleteList = async (id: string) => {
    if (!confirm("Delete this list and all its items? This cannot be undone.")) return;
    await fetch(`/api/shopping-lists?id=${id}`, { method: "DELETE" });
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) setActiveListId(null);
    showNotice("🗑️ List deleted");
  };

  // ============ ADD ITEM ============
  const addItem = async () => {
    const name = input.trim();
    if (!name || busy || !activeListId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient_name: name, list_id: activeListId }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [data.item, ...prev]);
        setInput("");
      }
    } finally { setBusy(false); }
  };

  // ============ TOGGLE ============
  const toggleCheck = async (item: ShoppingItem) => {
    const newChecked = !item.checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i)));
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, checked: newChecked }),
    });
  };

  // ============ DELETE ITEM ============
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/shopping?id=${id}`, { method: "DELETE" });
  };

  // ============ SAVE NAME ============
  const saveEdit = async (id: string) => {
    const name = editValue.trim();
    if (!name) { setEditingId(null); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ingredient_name: name } : i)));
    setEditingId(null);
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ingredient_name: name }),
    });
  };

  // ============ SAVE PRICE ============
  const savePriceEdit = async (id: string) => {
    const trimmed = editPriceValue.trim();
    const price = trimmed === "" ? null : Number(trimmed);
    if (price !== null && (isNaN(price) || price < 0)) { setEditingPriceId(null); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, actual_price: price } : i)));
    setEditingPriceId(null);
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actual_price: price }),
    });
  };

  // ============ SAVE QUANTITY ============
  const saveQtyEdit = async (id: string) => {
    const trimmed = editQtyValue.trim();
    const qty = trimmed === "" ? null : Number(trimmed);
    if (qty !== null && (isNaN(qty) || qty < 0)) { setEditingQtyId(null); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    setEditingQtyId(null);
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity: qty }),
    });
  };

  // ============ CLEAR ============
  const clearChecked = async () => {
    if (!activeListId || !confirm("Remove all checked items?")) return;
    setItems((prev) => prev.filter((i) => !i.checked));
    await fetch(`/api/shopping?clear_checked=true&list_id=${activeListId}`, { method: "DELETE" });
    showNotice("🗑️ Checked items cleared");
  };

  const clearAll = async () => {
    if (!activeListId || !confirm("Remove ALL items from this list?")) return;
    setItems([]);
    await fetch(`/api/shopping?clear_all=true&list_id=${activeListId}`, { method: "DELETE" });
    showNotice("🗑️ All items cleared");
  };

  // ============ BUDGET ============
  const saveBudget = async () => {
    if (!activeList) return;
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 0) {
      await updateList(activeList.id, { budget: val });
      showNotice(val > 0 ? "💵 Budget set" : "Budget removed");
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
  const totalCost = items.filter((i) => i.actual_price !== null)
    .reduce((s, i) => s + (i.actual_price ?? 0) * (i.quantity ?? 1), 0);
  const hasBudget = (activeList?.budget ?? 0) > 0;
  const hasPrices = pricedItems.length > 0;
  const budgetPercent = hasBudget ? Math.min(Math.round((pendingCost / (activeList?.budget ?? 1)) * 100), 100) : 0;
  const overBudget = hasBudget && pendingCost > (activeList?.budget ?? 0);
  const remaining = hasBudget ? (activeList?.budget ?? 0) - pendingCost : 0;

  // Category totals
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

  // Filtered
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

  // No lists yet
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
              ⚡ Today
            </button>
            <button
              onClick={() => { setNewListPeriod("week"); setNewListName("Weekly Groceries"); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              📅 This Week
            </button>
            <button
              onClick={() => { setNewListPeriod("month"); setNewListName("Monthly Restock"); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              🗓️ This Month
            </button>
            <button
              onClick={() => { setNewListPeriod("event"); setNewListName(""); setShowCreateList(true); }}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-accent"
            >
              🎉 Event
            </button>
          </div>
        </div>

        {showCreateList && <CreateListModal {...{ newListName, setNewListName, newListPeriod, setNewListPeriod, newListStart, setNewListStart, newListEnd, setNewListEnd, newListBudget, setNewListBudget, createList, setShowCreateList }} />}
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
                <span className="text-xl">{PERIOD_ICONS[activeList?.period_type ?? "custom"]}</span>
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
                      <span className="text-lg">{PERIOD_ICONS[list.period_type]}</span>
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

          {/* List menu */}
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
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rename inline */}
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
                <p className={`text-lg font-bold ${overBudget ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
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
                    <span className="ml-2 text-yellow-600 dark:text-yellow-500">
                      · {unpricedCount} unpriced
                    </span>
                  )}
                </span>
                <span className={overBudget ? "text-red-500 font-bold" : "text-accent font-bold"}>
                  {budgetPercent}%
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? "bg-red-500" : budgetPercent > 75 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                />
              </div>
              {overBudget && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="size-4" />
                  <span>Over by KES {Math.abs(remaining).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {hasBudget && !hasPrices && total > 0 && (
            <p className="mt-4 rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              💡 Tap any item below to enter its price and track your budget.
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
                    const pct = pendingCost > 0 ? Math.round((catTotal / pendingCost) * 100) : 0;
                    return (
                      <div key={catKey} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span>{info?.icon}</span>
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
                  <span>{cat.icon}</span>
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
                    <span>{catInfo?.icon}</span>
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
                              onClick={() => { setEditingPriceId(item.id); setEditPriceValue(item.actual_price !== null ? String(item.actual_price) : ""); }}
                              className="shrink-0 text-right"
                            >
                              {hasPrice ? (
                                <>
                                  <span className="text-sm font-bold text-accent">KES {cost.toLocaleString()}</span>
                                  {qty > 1 && <span className="ml-1 text-xs text-muted-foreground">({item.actual_price}×{qty})</span>}
                                </>
                              ) : (
                                <span className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-accent hover:text-accent">
                                  <Edit3 className="size-3" /> Set price
                                </span>
                              )}
                            </button>
                          )}

                          <button onClick={() => deleteItem(item.id)} className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950">
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

      {/* CREATE LIST MODAL */}
      {showCreateList && <CreateListModal {...{
        newListName, setNewListName,
        newListPeriod, setNewListPeriod,
        newListStart, setNewListStart,
        newListEnd, setNewListEnd,
        newListBudget, setNewListBudget,
        createList,
        setShowCreateList,
      }} />}

      {notice && (
        <div className="fixed bottom-5 right-5 z-[90] rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
          <p className="text-sm font-medium">{notice}</p>
        </div>
      )}
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
  createList, setShowCreateList,
}: any) {
  const periods = [
    { key: "today", label: "Today", icon: "⚡", desc: "Quick shopping run" },
    { key: "week", label: "This Week", icon: "📅", desc: "Weekly groceries" },
    { key: "month", label: "This Month", icon: "🗓️", desc: "Monthly restock" },
    { key: "event", label: "Event", icon: "🎉", desc: "Party or celebration" },
    { key: "custom", label: "Custom", icon: "📌", desc: "Any date range" },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl border border-border bg-card sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-serif text-2xl">New shopping list</h2>
          <button onClick={() => setShowCreateList(false)} className="rounded-lg p-2 transition hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Name */}
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

          {/* Period type */}
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setNewListPeriod(p.key as any)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    newListPeriod === p.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
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

          {/* Budget */}
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
            disabled={!newListName.trim()}
            className="flex-1 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            Create List
          </button>
        </div>
      </div>
    </div>
  );
}