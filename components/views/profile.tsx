"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Save,
  Mail,
  Calendar,
  Heart,
  UtensilsCrossed,
  ShoppingBag,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function initialsFrom(name: string, email: string) {
  const source = (name || "").trim() || email || "";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "C";
}

export function ProfileComponent() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [stats, setStats] = useState({ favorites: 0, cooked: 0, pantryItems: 0, mealPlans: 0 });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setDisplayName(user.user_metadata?.display_name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, created_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || user.user_metadata?.display_name || "");
        setMemberSince(profile.created_at);
      }

      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("favorites, history, pantry")
        .eq("user_id", user.id)
        .single();

      if (prefs) {
        setStats({
          favorites: prefs.favorites?.length || 0,
          cooked: prefs.history?.length || 0,
          pantryItems: prefs.pantry?.length || 0,
          mealPlans: 0,
        });
      }

      const { count: planCount } = await supabase
        .from("user_meal_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats((prev) => ({ ...prev, mealPlans: planCount || 0 }));
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  const joined = memberSince
    ? new Date(memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow text-accent">Your account</p>
        <h1 className="section-title mt-3">Karibu, {displayName || "friend"}.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          This is where your Chakula details live.
        </p>
      </div>

      <div className="panel flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-border/60 bg-card">
        <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-2xl text-accent-foreground">
            {initialsFrom(displayName, user?.email || "")}
          </div>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              aria-label="Display name"
              className="w-full max-w-xs border-b-2 border-transparent bg-transparent font-serif text-2xl outline-none transition-colors hover:border-border focus:border-accent"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-4" /> {user?.email}
              </span>
              {joined && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" /> Member since {joined}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="primary-button shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>

        <div>
          <p className="eyebrow">Your kitchen so far</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Heart} label="Favorites" value={stats.favorites} />
            <StatCard icon={UtensilsCrossed} label="Cooked" value={stats.cooked} />
            <StatCard icon={ShoppingBag} label="Pantry items" value={stats.pantryItems} />
            <StatCard icon={Calendar} label="Meal plans" value={stats.mealPlans} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLink onClick={() => router.push("/settings")} title="Settings" text="Dietary preferences, allergies & reminders" />
        <QuickLink onClick={() => router.push("/meals")} title="My meals" text="Everything you've saved and cooked" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-secondary p-4 text-center">
      <Icon className="mx-auto size-5 text-accent" />
      <p className="mt-2 font-serif text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickLink({ onClick, title, text }: any) {
  return (
    <button
      onClick={onClick}
      className="panel flex items-center justify-between p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg rounded-2xl border border-border/60 bg-card"
    >
      <span>
        <strong className="block font-serif text-lg">{title}</strong>
        <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
      </span>
      <ArrowLeft className="size-4 rotate-180 text-muted-foreground" />
    </button>
  );
}