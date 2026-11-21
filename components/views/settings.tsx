// components/views/settings.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Loader2, Plus, X, Check, Moon, Sun, Wallet, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Pescatarian", "Halal", "Keto", "Gluten-Free", 
  "Dairy-Free", "Nut-Free", "Low-Carb", "High-Protein", "Diabetic-Friendly", 
  "Low-Sodium"
];

const ALLERGY_OPTIONS = [
  "Peanuts", "Tree Nuts", "Milk", "Eggs", "Wheat", "Soy", "Fish", "Shellfish", "Sesame"
];

interface SettingsProps {
  userBudget: number;
  setUserBudget: (n: number) => void;
  dark: boolean;
  setDark: (b: boolean) => void;
}

export function SettingsComponent({ userBudget, setUserBudget, dark, setDark }: SettingsProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [budget, setBudget] = useState(String(userBudget));

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const meta = user.user_metadata || {};
        if (Array.isArray(meta.dietary_preferences)) setDietary(meta.dietary_preferences);
        if (Array.isArray(meta.allergies)) setAllergies(meta.allergies);
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();

    const cleanBudget = Number(budget);
    if (!isNaN(cleanBudget) && cleanBudget >= 0) {
      setUserBudget(cleanBudget);
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        dietary_preferences: dietary,
        allergies: allergies,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Preferences updated");
      router.refresh();
    }
    setSaving(false);
  };

  const toggleTheme = () => {
    setDark(!dark);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16 pt-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1 className="section-title mt-3">Settings.</h1>
          <p className="mt-3 text-muted-foreground">
            Personalise your experience and manage dietary needs.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* DIETARY */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl border-b border-border pb-4 mb-4">Dietary Preferences</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Chakula Assistant uses this to personalise meal suggestions.
            </p>
            <EditableChipGroup
              options={DIETARY_OPTIONS}
              selected={dietary}
              onChange={setDietary}
              placeholder="Add custom diet..."
            />
          </section>

          {/* ALLERGIES */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl border-b border-border pb-4 mb-4 flex items-center gap-2">
              Allergies & Restrictions
              <AlertTriangle className="size-5 text-highlight" />
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Chakula Assistant hides recipes whose ingredients match these. Recipe data is incomplete, so always read the ingredients yourself.
            </p>
            <EditableChipGroup
              options={ALLERGY_OPTIONS}
              selected={allergies}
              onChange={setAllergies}
              placeholder="Add custom allergy..."
            />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* APPEARANCE */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl border-b border-border pb-4 mb-4">Appearance</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-secondary"
              >
                <span className="flex items-center gap-2">
                  {dark ? <Sun className="size-5 text-accent" /> : <Moon className="size-5 text-accent" />}
                  {dark ? "Light Mode" : "Dark Mode"}
                </span>
                <div className={`flex size-6 items-center justify-center rounded-full border-2 ${dark ? "border-accent bg-accent/20" : "border-border"}`}>
                  {dark && <Check className="size-3 text-accent" />}
                </div>
              </button>
            </div>
          </section>

          {/* BUDGET */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl border-b border-border pb-4 mb-4 flex items-center gap-2">
              <Wallet className="size-5 text-accent" /> Budget
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-medium">Daily Budget</p>
                <p className="text-sm text-muted-foreground">Used to filter and rank recipes.</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
                <span className="font-semibold text-muted-foreground">KES</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent text-right text-base font-semibold outline-none"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EditableChipGroup({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const toggle = (item: string) => {
    if (selected.includes(item)) onChange(selected.filter((s) => s !== item));
    else onChange([...selected, item]);
  };

  const addDraft = () => {
    const v = draft.trim().slice(0, 40);
    if (!v) return;
    if (!selected.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...selected, v]);
    setDraft("");
  };

  const customItems = selected.filter((s) => !options.includes(s));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                isSelected
                  ? "border-accent bg-accent/10 text-accent shadow-sm ring-1 ring-accent/20"
                  : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:bg-secondary"
              }`}
            >
              {isSelected && <Check className="size-3.5" />}
              {opt}
            </button>
          );
        })}
      </div>

      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {customItems.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 rounded-xl border border-accent bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
            >
              {item}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="rounded-md p-0.5 transition hover:bg-accent/20"
                aria-label={`Remove ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex max-w-sm gap-2 pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={!draft.trim()}
          className="flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary/80 disabled:opacity-50"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}