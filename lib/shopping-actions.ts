// lib/shopping-actions.ts
// One place that puts ingredients on the user's real shopping list
// (the same list the Shopping page shows).
import { apiClient } from "@/lib/api-client";
import { localDateStr } from "@/lib/dates";

interface ListRow {
  id: string;
  start_date: string;
  end_date: string | null;
}

export type AddResult = { ok: true; added: number } | { ok: false; error: string };

/** Adds names to the active list (creates "Weekly Groceries" if there is none). Skips names already on the list. */
export async function addToShoppingList(names: string[]): Promise<AddResult> {
  const wanted = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  if (wanted.length === 0) return { ok: true, added: 0 };

  const listsRes = await apiClient<{ lists?: ListRow[] }>("/api/shopping-lists");
  if (!listsRes.ok) return { ok: false, error: listsRes.error ?? "Could not open your shopping list." };

  const lists = listsRes.data?.lists ?? [];
  const today = localDateStr();
  const isActive = (l: ListRow) =>
    l.end_date ? l.start_date <= today && today <= l.end_date : l.start_date === today;
  let listId: string | undefined = lists.find(isActive)?.id ?? lists[0]?.id;

  if (!listId) {
    const end = new Date();
    end.setDate(end.getDate() + 6);
    const created = await apiClient<{ list?: { id: string } }>("/api/shopping-lists", {
      method: "POST",
      body: JSON.stringify({
        name: "Weekly Groceries",
        period_type: "week",
        start_date: today,
        end_date: localDateStr(end),
        budget: 0,
      }),
    });
    if (!created.ok) return { ok: false, error: created.error ?? "Could not create a shopping list." };
    listId = created.data?.list?.id;
  }
  if (!listId) return { ok: false, error: "Could not open your shopping list." };

  const existingRes = await apiClient<{ items?: { ingredient_name: string }[] }>(`/api/shopping?list_id=${listId}`);
  const have = new Set((existingRes.data?.items ?? []).map((i) => i.ingredient_name.trim().toLowerCase()));
  const fresh = wanted.filter((n) => !have.has(n.toLowerCase()));
  if (fresh.length === 0) return { ok: true, added: 0 };

  const addRes = await apiClient("/api/shopping", {
    method: "POST",
    body: JSON.stringify({ items: fresh, list_id: listId, source: "recipe" }),
  });
  if (!addRes.ok) return { ok: false, error: addRes.error ?? "Could not add to your shopping list." };
  return { ok: true, added: fresh.length };
}