// components/topbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Moon, Search, Settings, ShoppingBag, Sparkles, Sun, User } from "lucide-react";
import { View } from "@/lib/types";
import { ReminderPopover } from "@/components/reminder-popover";
import { createClient } from "@/lib/supabase/client";
import { useAssistant } from "@/components/assistant-provider";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type TopbarProps = {
  view: View;
  shoppingCount: number;
  onShowNotice: (message: string) => void;
  onNavigate: (view: View) => void;
  onOpenMobileMenu?: () => void;
  userName?: string;
  dark?: boolean;
  onToggleTheme?: () => void;
};

const pageTitles: Record<string, string> = {
  home: "Chakula",
  browse: "Explore",
  pantry: "My Pantry",
  planner: "Meal Planner",
  meals: "My Meals",
  shopping: "Shopping List",
  surprise: "Surprise Me",
  detail: "Recipe Details",
  profile: "Profile",
  settings: "Settings",
};

export function Topbar({
  view,
  shoppingCount,
  onNavigate,
  userName,
  dark = false,
  onToggleTheme,
}: TopbarProps) {
  const router = useRouter();
  const { openAssistant } = useAssistant();
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadUser = async () => {
    const { data } = await createClient().auth.getUser();
    if (data.user) {
      setUser(data.user);
      setAvatarUrl(data.user.user_metadata?.avatar_url || null);
    }
  };

  useEffect(() => {
    loadUser();
    const handleDataChange = () => loadUser();
    window.addEventListener("chakula:data-changed", handleDataChange);
    return () => window.removeEventListener("chakula:data-changed", handleDataChange);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reminders");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount((data.history ?? []).filter((h: any) => !h.read).length);
      } catch {}
    })();
  }, [remindersOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  async function logout() {
    try {
      await createClient().auth.signOut();
      document.cookie = "chakula-last-active=; Max-Age=0; path=/";
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  const iconBtn =
    "relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground";
  const menuItem =
    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary";

  const initial = userName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:gap-5 sm:px-8 lg:px-10">
        <h1 className="shrink-0 font-serif text-2xl font-semibold tracking-tight text-primary sm:text-[28px]">
          {pageTitles[view] ?? "Chakula"}
        </h1>

        {/* Search pill (opens Explore) - Hidden on mobile */}
        <button
          type="button"
          onClick={() => onNavigate("browse")}
          className="mx-auto hidden h-11 w-full max-w-xl items-center gap-2.5 rounded-xl border border-primary/25 bg-secondary/60 px-4 text-sm text-muted-foreground transition hover:border-primary/50 sm:flex"
        >
          <Search className="size-4" />
          Search anything
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
          <button
            type="button"
            onClick={() => openAssistant()}
            aria-label="Ask Chakula"
            className="flex h-10 items-center gap-2 rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            <Sparkles className="size-[18px]" />
            <span className="hidden sm:inline">Ask Chakula</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setRemindersOpen((o) => !o)}
              className={iconBtn}
              aria-label="Meal reminders"
            >
              <Bell className="size-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-warm text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {remindersOpen && (
              <ReminderPopover
                onClose={() => setRemindersOpen(false)}
                onOpenPlanner={() => {
                  setRemindersOpen(false);
                  onNavigate("planner");
                }}
              />
            )}
          </div>

          {/* Shopping Cart - Hidden on mobile (moved to dropdown) */}
          <button
            type="button"
            onClick={() => onNavigate("shopping")}
            className={`${iconBtn} hidden sm:flex`}
            aria-label="Shopping list"
          >
            <ShoppingBag className="size-[18px]" />
            {shoppingCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {shoppingCount > 99 ? "99+" : shoppingCount}
              </span>
            )}
          </button>

          {/* Theme Toggle - Hidden on mobile (moved to dropdown) */}
          {onToggleTheme && (
            <button onClick={onToggleTheme} className={`${iconBtn} hidden sm:flex`} aria-label="Toggle theme">
              {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
          )}

          {/* Account Menu (Avatar + Dropdown) */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:ring-2 hover:ring-accent/50"
              aria-label="Account menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="size-full object-cover" />
              ) : (
                initial
              )}
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl">
                <button className={menuItem} onClick={() => { setMenuOpen(false); onNavigate("profile"); }}>
                  <span className="flex items-center gap-2.5"><User className="size-4" /> Profile</span>
                </button>
                <button className={menuItem} onClick={() => { setMenuOpen(false); onNavigate("settings"); }}>
                  <span className="flex items-center gap-2.5"><Settings className="size-4" /> Settings</span>
                </button>
                
                {/* Mobile-only actions */}
                <div className="sm:hidden">
                  <button className={menuItem} onClick={() => { setMenuOpen(false); onNavigate("shopping"); }}>
                    <span className="flex items-center gap-2.5"><ShoppingBag className="size-4" /> Shopping</span>
                    {shoppingCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                        {shoppingCount > 99 ? "99+" : shoppingCount}
                      </span>
                    )}
                  </button>
                  {onToggleTheme && (
                    <button className={menuItem} onClick={() => { setMenuOpen(false); onToggleTheme(); }}>
                      <span className="flex items-center gap-2.5">
                        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        {dark ? "Light mode" : "Dark mode"}
                      </span>
                    </button>
                  )}
                </div>

                <div className="my-1 border-t border-border" />
                <button className={`${menuItem} text-destructive hover:bg-destructive/10`} onClick={logout}>
                  <span className="flex items-center gap-2.5"><LogOut className="size-4" /> Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}