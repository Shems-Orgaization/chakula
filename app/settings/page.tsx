"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Moon,
  Sun,
  Bell,
  Coffee,
  Sunset,
  UtensilsCrossed,
  Apple,
  Fish,
  Leaf,
  AlertCircle,
  Check,
  Loader2,
  Save,
  X,
} from "lucide-react";

type Option = { id: string; label: string; icon: any };
type MealPeriod = { id: "morning" | "lunch" | "evening"; label: string; icon: any; description: string };

const dietaryOptions: Option[] = [
  { id: "vegetarian", label: "Vegetarian", icon: Leaf },
  { id: "vegan", label: "Vegan", icon: Leaf },
  { id: "pescatarian", label: "Pescatarian", icon: Fish },
  { id: "gluten-free", label: "Gluten free", icon: AlertCircle },
  { id: "dairy-free", label: "Dairy free", icon: AlertCircle },
  { id: "keto", label: "Keto", icon: Apple },
  { id: "high-protein", label: "High protein", icon: Fish },
];

const allergyOptions: Option[] = ["Peanuts", "Tree nuts", "Milk", "Eggs", "Soy", "Wheat", "Shellfish", "Fish"].map(
  (label) => ({ id: label, label, icon: AlertCircle }),
);

const mealTypeOptions: Option[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Quick meals",
  "Traditional",
  "Street food",
].map((label) => ({ id: label, label, icon: UtensilsCrossed }));

const mealPeriods: MealPeriod[] = [
  { id: "morning", label: "Morning", icon: Coffee, description: "Before 11am" },
  { id: "lunch", label: "Lunch", icon: Sun, description: "11am – 4pm" },
  { id: "evening", label: "Evening", icon: Sunset, description: "After 4pm" },
];

// ===== MAIN COMPONENT =====
export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(false);

  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferredMealTypes, setPreferredMealTypes] = useState<string[]>([]);
  const [reminders, setReminders] = useState({ morning: true, lunch: true, evening: true });

  useEffect(() => {
    // Load theme
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);

    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("reminders")
        .eq("user_id", user.id)
        .single();

      if (prefs?.reminders) setReminders(prefs.reminders);

      setDietaryPreferences(user.user_metadata?.dietary_preferences || []);
      setAllergies(user.user_metadata?.allergies || []);
      setPreferredMealTypes(user.user_metadata?.preferred_meal_types || []);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await supabase.auth.updateUser({
        data: {
          dietary_preferences: dietaryPreferences,
          allergies,
          preferred_meal_types: preferredMealTypes,
        },
      });
      await supabase.from("user_preferences").upsert({
        user_id: user.id,
        reminders,
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Could not save your settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((v) => v !== id) : [...list, id]);
  }

  function toggleTheme() {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("food-theme", JSON.stringify(newDark ? "dark" : "light"));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button className="back-button flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group" onClick={() => router.push("/")}>
        <span className="transition-transform group-hover:-translate-x-1">←</span> Back to dashboard
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Preferences</p>
          <h1 className="section-title mt-2">Make Chakula fit your table.</h1>
        </div>
        <button onClick={saveSettings} disabled={saving} className="primary-button shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-5">
        {/* Theme */}
        <SettingSection icon={dark ? Moon : Sun} title="Theme" description="This stays saved on this device until you change it again.">
          <button onClick={toggleTheme} className="filter-pill filter-pill-active inline-flex w-fit items-center gap-2">
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
            {dark ? "Dark mode" : "Light mode"}
          </button>
        </SettingSection>

        {/* Dietary */}
        <SettingSection icon={Apple} title="Dietary preferences" description="Select anything that applies to you, or add your own.">
          <EditableChipGroup
            options={dietaryOptions}
            selected={dietaryPreferences}
            onToggle={(id) => toggle(dietaryPreferences, setDietaryPreferences, id)}
            onAddCustom={(value) => setDietaryPreferences((prev) => (prev.includes(value) ? prev : [...prev, value]))}
            onRemoveCustom={(value) => setDietaryPreferences((prev) => prev.filter((v) => v !== value))}
            placeholder="Add another preference"
          />
        </SettingSection>

        {/* Allergies */}
        <SettingSection icon={AlertCircle} title="Allergies & restrictions" description="We'll flag recipes that contain these.">
          <EditableChipGroup
            warn
            options={allergyOptions}
            selected={allergies}
            onToggle={(id) => toggle(allergies, setAllergies, id)}
            onAddCustom={(value) => setAllergies((prev) => (prev.includes(value) ? prev : [...prev, value]))}
            onRemoveCustom={(value) => setAllergies((prev) => prev.filter((v) => v !== value))}
            placeholder="Add another allergy"
          />
        </SettingSection>

        {/* Meal Types */}
        <SettingSection icon={UtensilsCrossed} title="Preferred meal types" description="Tell us what you reach for most, or add your own.">
          <EditableChipGroup
            options={mealTypeOptions}
            selected={preferredMealTypes}
            onToggle={(id) => toggle(preferredMealTypes, setPreferredMealTypes, id)}
            onAddCustom={(value) => setPreferredMealTypes((prev) => (prev.includes(value) ? prev : [...prev, value]))}
            onRemoveCustom={(value) => setPreferredMealTypes((prev) => prev.filter((v) => v !== value))}
            placeholder="Add another meal type"
          />
        </SettingSection>

        {/* Reminders */}
        <SettingSection icon={Bell} title="Meal reminders" description="A gentle nudge at the right time of day.">
          <div className="flex flex-col gap-3">
            {mealPeriods.map((period) => (
              <button
                key={period.id}
                onClick={() => setReminders((prev) => ({ ...prev, [period.id]: !prev[period.id] }))}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${reminders[period.id] ? "bg-accent/10" : "bg-secondary"}`}
              >
                <span className="flex items-center gap-3">
                  <period.icon className={`size-5 ${reminders[period.id] ? "text-accent" : "text-muted-foreground"}`} />
                  <span>
                    <span className="block text-sm font-semibold">{period.label}</span>
                    <span className="block text-xs text-muted-foreground">{period.description}</span>
                  </span>
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reminders[period.id] ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"}`}>
                  {reminders[period.id] ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

// ===== SUB-COMPONENTS =====
function SettingSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="panel p-6 sm:p-8 rounded-2xl border border-border/60 bg-card">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-accent">
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="font-serif text-xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Chip({ active, icon: Icon, label, onClick, warn }: any) {
  if (warn) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${active ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-secondary text-muted-foreground hover:bg-card"}`}
      >
        <Icon className="size-3.5" />
        {label}
        {active && <Check className="size-3" />}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`filter-pill inline-flex items-center gap-1.5 ${active ? "filter-pill-active" : ""}`}>
      <Icon className="size-3.5" />
      {label}
      {active && <Check className="size-3" />}
    </button>
  );
}

function EditableChipGroup({
  options,
  selected,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  warn,
  placeholder,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  onAddCustom: (value: string) => void;
  onRemoveCustom: (value: string) => void;
  warn?: boolean;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const customItems = selected.filter((id) => !options.some((option) => option.id === id));

  function submit() {
    const value = draft.trim();
    if (!value) return;
    onAddCustom(value);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.id}
            warn={warn}
            active={selected.includes(option.id)}
            icon={option.icon}
            label={option.label}
            onClick={() => onToggle(option.id)}
          />
        ))}
        {customItems.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold ${warn ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-accent/30 bg-accent/10 text-accent"}`}
          >
            {item}
            <button onClick={() => onRemoveCustom(item)} aria-label={`Remove ${item}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex max-w-xs gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="text-input flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <button onClick={submit} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary transition">
          Add
        </button>
      </div>
    </div>
  );
}