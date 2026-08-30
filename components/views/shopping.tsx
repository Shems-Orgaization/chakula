// components/views/shopping.tsx
import { useState } from "react";

interface ShoppingProps {
  items: string[];
  setItems: (items: string[] | ((prev: string[]) => string[])) => void;
}

export function Shopping({ items, setItems }: ShoppingProps) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const name = input.trim();
    if (!name || busy) return;

    setBusy(true);
    try {
      const response = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient_name: name }),
      });

      if (response.ok) {
        setItems((current) => [...new Set([...current, name])]);
        setInput("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Ready when you are</p>
        <h1 className="section-title mt-3">Shopping list.</h1>
        <div className="mt-5 flex max-w-xl gap-2">
          <input
            className="text-input flex-1 rounded-lg border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-accent"
            aria-label="Add shopping item"
            placeholder="Add an item, e.g. onions"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void add();
            }}
          />
          <button
            className="primary-button rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60 transition"
            onClick={() => void add()}
            disabled={busy}
          >
            {busy ? "Adding…" : "Add item"}
          </button>
        </div>
      </div>

      <div className="panel rounded-2xl border border-border bg-card p-6">
        <ul className="shopping-list space-y-2">
          {items.length ? (
            items.map((item) => (
              <li key={item} className="flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <span className="font-medium">{item}</span>
                </label>
                <button
                  className="text-button text-sm text-muted-foreground hover:text-red-500 transition"
                  onClick={async () => {
                    const response = await fetch(
                      `/api/shopping?ingredient_name=${encodeURIComponent(item)}`,
                      { method: "DELETE" }
                    );
                    if (response.ok)
                      setItems((prev) => prev.filter((x) => x !== item));
                  }}
                >
                  Remove
                </button>
              </li>
            ))
          ) : (
            <li className="text-center text-muted-foreground py-4">
              Cook a meal to add ingredients here.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}