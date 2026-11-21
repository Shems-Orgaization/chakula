// components/views/profile.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { 
  Loader2, User as UserIcon, Mail, Shield, LogOut, Key, 
  CheckCircle2, AlertCircle, Camera, Eye, EyeOff,
  Trash2, CalendarDays, Utensils
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ProfileComponent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const saveProfile = async () => {
    const name = displayName.trim().slice(0, 60);
    if (!user) return;
    if (!name) {
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      data: { display_name: name },
    });

    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name,
      }, { onConflict: "id" });
      
      toast.success("Profile updated");
      window.dispatchEvent(new Event("chakula:data-changed"));
      router.refresh();
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!user?.email) return;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; 

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload image: " + uploadError.message);
      setSaving(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) {
      toast.error("Failed to save profile picture");
    } else {
      setAvatarUrl(publicUrl);
      toast.success("Profile picture updated");
      window.dispatchEvent(new Event("chakula:data-changed"));
      router.refresh();
    }
    setSaving(false);
  };

  const removeAvatar = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    
    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: null }
    });

    if (error) {
      toast.error("Failed to remove avatar");
    } else {
      setAvatarUrl(null);
      toast.success("Profile picture removed");
      window.dispatchEvent(new Event("chakula:data-changed"));
      router.refresh();
    }
    setSaving(false);
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      document.cookie = "chakula-last-active=; Max-Age=0; path=/";
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-KE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-8 pb-16 pt-4">
      <div>
        <p className="eyebrow">Your Account</p>
        <h1 className="section-title mt-3">Profile.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        {/* LEFT COLUMN - PROFILE CARD */}
        <div className="flex flex-col gap-6 contents lg:flex">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-accent/20 to-primary/10" />
            
            <div className="relative z-10 flex flex-col items-center mt-8">
              {/* Avatar Uploader */}
              <div className="group relative flex size-28 items-center justify-center rounded-full bg-background shadow-md ring-4 ring-background">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="size-full rounded-full object-cover" 
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-full bg-accent/10 text-accent">
                    <UserIcon className="size-12" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
                    title="Upload new photo"
                  >
                    <Camera className="size-5" />
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={removeAvatar}
                      className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500"
                      title="Remove photo"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User Info */}
              <h2 className="mt-4 font-serif text-2xl">{displayName || "No name set"}</h2>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Mail className="size-4" /> {user.email}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-border">
                <Shield className="size-3.5" /> 
                {user.app_metadata?.role === "admin" ? "Administrator" : "Member"}
              </div>

              {/* Meta */}
              <div className="mt-6 flex w-full flex-col gap-3 border-t border-border/50 pt-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Joined {memberSince}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Utensils className="size-4" />
                  Saved recipes & plans
                </div>
              </div>
            </div>
          </div>

          {/* DIETARY PROFILE */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dietary Profile</p>
              <Link href="/settings" className="text-xs font-semibold text-accent hover:underline">
                Edit
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.user_metadata?.dietary_preferences?.length || user.user_metadata?.allergies?.length ? (
                <>
                  {user.user_metadata.dietary_preferences?.map((d: string) => (
                    <span key={d} className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                      <CheckCircle2 className="size-3" /> {d}
                    </span>
                  ))}
                  {user.user_metadata.allergies?.map((a: string) => (
                    <span key={a} className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                      <AlertCircle className="size-3" /> {a}
                    </span>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No dietary preferences set.</p>
              )}
            </div>
          </div>

          {/* LOG OUT (Desktop only) */}
          <button
            onClick={logout}
            className="hidden lg:flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="size-5" />
            Log out
          </button>
        </div>

        {/* RIGHT COLUMN - FORMS */}
        <div className="flex flex-col gap-6">
          {/* PERSONAL DETAILS */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="flex items-center gap-2 font-serif text-xl border-b border-border pb-4 mb-6">
              <UserIcon className="size-5 text-accent" /> Personal Details
            </h3>
            <label className="block max-w-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Chef Amina"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </label>
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-xl bg-accent px-6 py-2.5 font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Name"}
              </button>
            </div>
          </div>

          {/* SECURITY */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="flex items-center gap-2 font-serif text-xl border-b border-border pb-4 mb-6">
              <Key className="size-5 text-accent" /> Security
            </h3>
            
            <div className="space-y-4 max-w-lg">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</span>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</span>
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={changePassword}
                disabled={saving || !newPassword || !confirmPassword}
                className="rounded-xl border border-border bg-background px-6 py-2.5 font-semibold transition hover:bg-secondary disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Update Password"}
              </button>
            </div>
          </div>
          
          {/* LOG OUT (Mobile only, absolute last item) */}
          <button
            onClick={logout}
            className="flex lg:hidden w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="size-5" />
            Log out
          </button>
          
        </div>
      </div>
    </div>
  );
}