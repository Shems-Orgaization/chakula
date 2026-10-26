// components/views/profile.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MESSAGES, authErrorMessage, dbErrorMessage } from "@/lib/messages";
import { Captcha, captchaEnabled } from "@/components/auth-shell";
import {
  Save, Mail, Calendar, Heart, UtensilsCrossed, ShoppingBag,
  Loader2, Lock, Eye, EyeOff, Check, Leaf, AlertCircle
} from "lucide-react";

function initialsFrom(name: string, email: string) {
  const source = (name || "").trim() || email || "";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "C";
}

function FormMessage({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role={type === "error" ? "alert" : "status"}
      className={`mt-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
        type === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-green-500/30 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
      }`}
    >
      {type === "success" && <Check className="size-4 shrink-0" />}
      {type === "error" && <AlertCircle className="size-4 shrink-0" />}
      {children}
    </p>
  );
}

export function ProfileComponent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [stats, setStats] = useState({ favorites: 0, cooked: 0, pantryItems: 0, mealPlans: 0 });
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // ===== PASSWORD CHANGE =====
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  
  // Captcha State
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      
      setUser(user);
      setDisplayName(user.user_metadata?.display_name || "");
      setDietaryPrefs(user.user_metadata?.dietary_preferences || []);
      setAllergies(user.user_metadata?.allergies || []);

      const { data: profile } = await supabase.from("profiles").select("display_name, created_at").eq("id", user.id).single();
      if (profile) {
        setDisplayName(profile.display_name || user.user_metadata?.display_name || "");
        setMemberSince(profile.created_at);
      }

      const { data: prefs } = await supabase.from("user_preferences").select("favorites, history, pantry").eq("user_id", user.id).single();
      if (prefs) {
        setStats({ favorites: prefs.favorites?.length || 0, cooked: prefs.history?.length || 0, pantryItems: prefs.pantry?.length || 0, mealPlans: 0 });
      }

      const { count: planCount } = await supabase.from("user_meal_plans").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      setStats((prev) => ({ ...prev, mealPlans: planCount || 0 }));
    } catch (error) {
      toast.error(MESSAGES.network.generic);
    } finally { 
      setLoading(false); 
    }
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      
      const { error: authError } = await supabase.auth.updateUser({ 
        data: { display_name: displayName } 
      });
      
      if (authError) {
        toast.error(authErrorMessage(authError));
        return;
      }

      const { error: dbError } = await supabase.from("profiles").upsert({ 
        id: user.id, 
        display_name: displayName, 
        updated_at: new Date().toISOString() 
      });

      if (dbError) {
        toast.error(dbErrorMessage(dbError));
        return;
      }

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(MESSAGES.network.generic);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPasswordError(null); 
    setPasswordSuccess(null);
    
    if (!currentPassword || !newPassword || !confirmPassword) return setPasswordError("Please fill in all three fields.");
    if (newPassword.length < 8) return setPasswordError(MESSAGES.auth.passwordTooShort);
    if (newPassword !== confirmPassword) return setPasswordError(MESSAGES.auth.passwordMismatch);
    if (newPassword === currentPassword) return setPasswordError("New password must be different from the current one.");
    if (captchaEnabled && !captchaToken) return setPasswordError("Please wait for the security check to finish, then try again.");

    setPasswordSaving(true);
    try {
      const supabase = createClient();
      
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: user.email, 
        password: currentPassword,
        options: { captchaToken: captchaToken ?? undefined }
      });
      
      // Token works only once
      setCaptchaToken(null);
      setCaptchaReset((n) => n + 1);

      if (signInError) { 
        setPasswordError(
          signInError.code === "invalid_credentials"
            ? MESSAGES.auth.currentPasswordIncorrect
            : authErrorMessage(signInError),
        ); 
        return; 
      }
      
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (updateError) { 
        setPasswordError(authErrorMessage(updateError)); 
        return; 
      }

      setPasswordSuccess("Password updated successfully.");
      toast.success("Password updated successfully.");
      setCurrentPassword(""); 
      setNewPassword(""); 
      setConfirmPassword(""); 
      setTimeout(() => { setShowPasswordForm(false); setPasswordSuccess(null); }, 4000);
    } catch (err: any) { 
      setPasswordError(MESSAGES.network.generic); 
    } finally { 
      setPasswordSaving(false); 
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-accent" /></div>;

  const joined = memberSince ? new Date(memberSince).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow text-accent">Your account</p>
        <h1 className="section-title mt-3">Karibu, {displayName || "friend"}.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">This is where your Chakula details live.</p>
      </div>

      {/* PROFILE CARD */}
      <div className="panel flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-border/60 bg-card">
        <div className="flex flex-col gap-6 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-2xl text-accent-foreground">
            {initialsFrom(displayName, user?.email || "")}
          </div>
          <div className="min-w-0 flex-1">
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="w-full max-w-xs border-b-2 border-transparent bg-transparent font-serif text-2xl outline-none transition-colors hover:border-border focus:border-accent" />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="size-4" /> {user?.email}</span>
              {joined && <span className="flex items-center gap-1.5"><Calendar className="size-4" /> Member since {joined}</span>}
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="primary-button shrink-0 flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {/* Dietary Profile Display */}
        <div className="border-b border-border pb-6">
          <p className="eyebrow mb-4">Dietary Profile</p>
          <div className="flex flex-col sm:flex-row gap-6">
             <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2"><Leaf className="size-4" /> Preferences</div>
                <div className="flex flex-wrap gap-2">
                  {dietaryPrefs.length ? dietaryPrefs.map(p => <span key={p} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">{p}</span>) : <span className="text-sm text-muted-foreground">None set</span>}
                </div>
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2"><AlertCircle className="size-4 text-destructive" /> Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {allergies.length ? allergies.map(a => <span key={a} className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-sm font-medium">{a}</span>) : <span className="text-sm text-muted-foreground">None set</span>}
                </div>
             </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">Your kitchen so far</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Heart} label="Favorites" value={stats.favorites} />
            <StatCard icon={UtensilsCrossed} label="Cooked" value={stats.cooked} />
            <StatCard icon={ShoppingBag} label="Pantry" value={stats.pantryItems} />
            <StatCard icon={Calendar} label="Plans" value={stats.mealPlans} />
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="panel p-6 sm:p-8 rounded-2xl border border-border/60 bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-accent"><Lock className="size-4" /></span>
            <div><h2 className="font-serif text-xl">Password</h2><p className="text-sm text-muted-foreground">Keep your account secure.</p></div>
          </div>
          {!showPasswordForm && <button onClick={() => setShowPasswordForm(true)} className="shrink-0 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-secondary">Change password</button>}
        </div>

        {showPasswordForm && (
          <div className="mt-5 flex flex-col gap-4">
            <PasswordField label="Current password" value={currentPassword} setValue={setCurrentPassword} show={showCurrent} setShow={setShowCurrent} autoComplete="current-password" />
            <PasswordField label="New password" value={newPassword} setValue={setNewPassword} show={showNew} setShow={setShowNew} autoComplete="new-password" />
            <PasswordField label="Confirm new password" value={confirmPassword} setValue={setConfirmPassword} show={showConfirm} setShow={setShowConfirm} autoComplete="new-password" />
            
            <Captcha onToken={setCaptchaToken} resetKey={captchaReset} />

            {passwordError && <FormMessage type="error">{passwordError}</FormMessage>}
            {passwordSuccess && <FormMessage type="success">{passwordSuccess}</FormMessage>}
            
            <div className="flex gap-2 mt-2">
              <button onClick={changePassword} disabled={passwordSaving} className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60">
                {passwordSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Update
              </button>
              <button onClick={() => setShowPasswordForm(false)} className="rounded-xl border border-border px-5 py-2.5 font-semibold hover:bg-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, setValue, show, setShow, autoComplete }: any) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-2">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => setValue(e.target.value)} autoComplete={autoComplete} className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 outline-none focus:border-accent" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
      </div>
    </label>
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