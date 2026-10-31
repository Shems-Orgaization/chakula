// components/views/settings.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MESSAGES, authErrorMessage, dbErrorMessage } from "@/lib/messages";
import { REMINDERS_ENABLED } from "@/lib/features";
import {
  Moon, Sun, Bell, Coffee, Sunset, UtensilsCrossed, Apple, Fish, Leaf, AlertCircle, Check, Loader2, Save, X, Wallet
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

const allergyOptions: Option[] = [
  "Peanuts", "Tree nuts", "Milk", "Eggs", "Soy", "Wheat", "Shellfish", "Fish",
].map((label) => ({ id: label, label, icon: AlertCircle }));

const mealTypeOptions: Option[] = [
  "Breakfast", "Lunch", "Dinner", "Snacks", "Quick meals", "Traditional", "Street food",
].map((label) => ({ id: label, label, icon: UtensilsCrossed }));

const mealPeriods: MealPeriod[] = [
  { id: "morning", label: "Morning", icon: Coffee, description: "Before 11am" },
  { id: "lunch", label: "Lunch", icon: Sun, description: "11am – 4pm" },
  { id: "evening", label: "Evening", icon: Sunset, description: "After 4pm" },
];

interface SettingsProps {
  userBudget: number;
  setUserBudget: (value: number) => void;
  dark: boolean;
  setDark: (value: boolean) => void;
}

export function SettingsComponent({ userBudget, setUserBudget, dark, setDark }: SettingsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [budget, setBudget] = useState(userBudget);

  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferredMealTypes, setPreferredMealTypes] = useState<string[]>([]);
  const [reminders, setReminders] = useState({ morning: true, lunch: true, evening: true });

  useEffect(() => {
    loadSettings();
  }, []);

  // Keep in step if the app finishes loading the saved budget after this page opens.
  useEffect(() => {
    setBudget(userBudget);
  }, [userBudget]);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: prefs } = await supabase.from("user_preferences").select("reminders").eq("user_id", user.id).single();
      if (prefs?.reminders) setReminders(prefs.reminders);

      setDietaryPreferences(user.user_metadata?.dietary_preferences || []);
      setAllergies(user.user_metadata?.allergies || []);
      setPreferredMealTypes(user.user_metadata?.preferred_meal_types || []);
    } catch (error) {
      toast.error(MESSAGES.network.generic);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!user) return;
    if (!Number.isFinite(budget) || budget < 1 || budget > 100000) {
      toast.error("Enter a daily budget between KES 1 and KES 100,000.");
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: { dietary_preferences: dietaryPreferences, allergies, preferred_meal_types: preferredMealTypes },
      });
      if (authError) {
        toast.error(authErrorMessage(authError));
        return;
      }
      const { error: dbError } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          reminders,
          user_budget: budget,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (dbError) {
        toast.error(dbErrorMessage(dbError));
        return;
      }
      // Tell the rest of the app, so it does not save the old budget back later.
      setUserBudget(budget);
      setSaved(true);
      toast.success("Settings saved.");
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error(MESSAGES.network.generic);
    } finally {
      setSaving(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((v: string) => v !== id) : [...list, id]);
  }

  function toggleTheme() {
    // The app applies the class and saves it (see food-app.tsx).
    setDark(!dark);
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-accent" /></div>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow text-accent">Preferences</p>
        <h1 className="section-title mt-3">Make Chakula fit your table.</h1>
      </div>

      <div className="flex justify-end">
        <button onClick={saveSettings} disabled={saving} className="primary-button shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </div>

      <div className="grid gap-5">
        <SettingSection icon={Wallet} title="Daily Budget" description="We'll try to recommend meals within this limit.">
           <div className="relative w-full sm:w-64">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">KES</span>
              <input type="number" value={budget || ""} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-xl border-2 border-border bg-background py-3 pl-14 pr-4 text-xl font-bold outline-none focus:border-accent" />
            </div>
        </SettingSection>

        <SettingSection icon={dark ? Moon : Sun} title="Theme" description="Saved on this device.">
          <button onClick={toggleTheme} className="filter-pill filter-pill-active inline-flex w-fit items-center gap-2">
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />} {dark ? "Dark mode" : "Light mode"}
          </button>
        </SettingSection>

        <SettingSection icon={Apple} title="Dietary preferences" description="Select anything that applies to you.">
          <EditableChipGroup 
            options={dietaryOptions} 
            selected={dietaryPreferences} 
            onToggle={(id: string) => toggle(dietaryPreferences, setDietaryPreferences, id)} 
            onAddCustom={(v: string) => setDietaryPreferences((prev: string[]) => [...prev, v])} 
            onRemoveCustom={(v: string) => setDietaryPreferences((prev: string[]) => prev.filter((i: string) => i !== v))} 
            placeholder="Add preference" 
          />
        </SettingSection>

        <SettingSection icon={AlertCircle} title="Allergies & restrictions" description="Saved to your profile. Recipes are not checked against these yet, so always read the ingredients.">
          <EditableChipGroup 
            warn 
            options={allergyOptions} 
            selected={allergies} 
            onToggle={(id: string) => toggle(allergies, setAllergies, id)} 
            onAddCustom={(v: string) => setAllergies((prev: string[]) => [...prev, v])} 
            onRemoveCustom={(v: string) => setAllergies((prev: string[]) => prev.filter((i: string) => i !== v))} 
            placeholder="Add allergy" 
          />
        </SettingSection>

        <SettingSection icon={UtensilsCrossed} title="Preferred meal types" description="What you reach for most.">
          <EditableChipGroup 
            options={mealTypeOptions} 
            selected={preferredMealTypes} 
            onToggle={(id: string) => toggle(preferredMealTypes, setPreferredMealTypes, id)} 
            onAddCustom={(v: string) => setPreferredMealTypes((prev: string[]) => [...prev, v])} 
            onRemoveCustom={(v: string) => setPreferredMealTypes((prev: string[]) => prev.filter((i: string) => i !== v))} 
            placeholder="Add meal type" 
          />
        </SettingSection>

        {REMINDERS_ENABLED && (
        <SettingSection icon={Bell} title="Meal reminders" description="A gentle nudge at the right time.">
          <div className="flex flex-col gap-3">
            {mealPeriods.map((period) => (
              <button key={period.id} onClick={() => setReminders((prev) => ({ ...prev, [period.id]: !prev[period.id] }))} className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${reminders[period.id] ? "bg-accent/10" : "bg-secondary"}`}>
                <span className="flex items-center gap-3"><period.icon className={`size-5 ${reminders[period.id] ? "text-accent" : "text-muted-foreground"}`} /><span><span className="block text-sm font-semibold">{period.label}</span><span className="block text-xs text-muted-foreground">{period.description}</span></span></span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reminders[period.id] ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"}`}>{reminders[period.id] ? "On" : "Off"}</span>
              </button>
            ))}
          </div>
        </SettingSection>
        )}
      </div>
    </div>
  );
}

function SettingSection({ icon: Icon, title, description, children }: any) {
  return (
    <div className="panel p-6 sm:p-8 rounded-2xl border border-border/60 bg-card">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-accent"><Icon className="size-4" /></span>
        <div><h2 className="font-serif text-xl">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>
      </div>
      {children}
    </div>
  );
}

function Chip({ active, icon: Icon, label, onClick, warn }: any) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${warn ? (active ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-secondary text-muted-foreground hover:bg-card") : (active ? "filter-pill-active" : "filter-pill")}`}>
      <Icon className="size-3.5" />{label}{active && <Check className="size-3" />}
    </button>
  );
}

function EditableChipGroup({ 
  options, selected, onToggle, onAddCustom, onRemoveCustom, warn, placeholder 
}: { 
  options: Option[]; 
  selected: string[]; 
  onToggle: (id: string) => void; 
  onAddCustom: (v: string) => void; 
  onRemoveCustom: (v: string) => void; 
  warn?: boolean; 
  placeholder: string; 
}) {
  const [draft, setDraft] = useState("");
  const customItems = selected.filter((id: string) => !options.some((o: Option) => o.id === id));
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((o: Option) => <Chip key={o.id} warn={warn} active={selected.includes(o.id)} icon={o.icon} label={o.label} onClick={() => onToggle(o.id)} />)}
        {customItems.map((item: string) => (
          <span key={item} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold ${warn ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-accent/30 bg-accent/10 text-accent"}`}>
            {item}<button onClick={() => onRemoveCustom(item)}><X className="size-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex max-w-xs gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if(draft.trim()){onAddCustom(draft.trim());setDraft("")} } }} placeholder={placeholder} className="text-input flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent" />
        <button onClick={() => { if(draft.trim()){onAddCustom(draft.trim());setDraft("")} }} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary transition">Add</button>
      </div>
    </div>
  );
}