// components/sidebar.tsx
"use client";

import {
  CalendarDays,
  Home,
  LogOut,
  Moon,
  Search,
  Settings,
  ShoppingBasket,
  Sparkles,
  Sun,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { View } from "@/lib/types";

const items: Array<{ view: View; label: string; Icon: any }> = [
  { view: "home", label: "Home", Icon: Home },
  { view: "browse", label: "Explore", Icon: Search },
  { view: "planner", label: "Planner", Icon: CalendarDays },
  { view: "shopping", label: "Shopping", Icon: ShoppingBasket },
  { view: "meals", label: "Meals", Icon: UtensilsCrossed },
  { view: "surprise", label: "Surprise", Icon: Sparkles },
];

export function Sidebar({
  active,
  onNavigate,
  onClose,
  dark = false,
  onToggleTheme,
}: {
  active: View;
  onNavigate: (view: View) => void;
  mobileOpen?: boolean; // kept for compatibility (unused)
  onClose?: () => void;
  userEmail?: string;
  userName?: string;
  dark?: boolean;
  onToggleTheme?: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await createClient().auth.signOut();
      document.cookie = "chakula-last-active=; Max-Age=0; path=/";
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setLoggingOut(false);
    }
  }

  const go = (v: View) => {
    onNavigate(v);
    onClose?.();
  };

  // Active tab = same colour as the page + inverse curves (see .rail-tab-active in globals.css)
  const tab = (isActive: boolean) =>
    `relative ml-2 flex w-[calc(100%-0.5rem)] flex-col items-center gap-0.5 rounded-l-2xl py-2.5 text-[10px] font-semibold transition-colors ${
      isActive
        ? "rail-tab-active bg-background text-primary"
        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
    }`;

  return (
    <>
      {/* DESKTOP RAIL */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[88px] flex-col bg-rail md:flex">
        <button
          onClick={() => go("home")}
          aria-label="Chakula home"
          className="mx-auto mt-4 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition hover:scale-105"
        >
          <UtensilsCrossed className="size-5" strokeWidth={2.2} />
        </button>

        <nav
          aria-label="Main navigation"
          className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden py-5 [scrollbar-width:none]"
        >
          {items.map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => go(view)}
              className={tab(active === view)}
              aria-current={active === view ? "page" : undefined}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}

          <div className="mt-auto flex flex-col gap-2 pt-4">
            <button onClick={() => go("profile")} className={tab(active === "profile")}>
              <User className="size-5" />
              Profile
            </button>
            <button onClick={() => go("settings")} className={tab(active === "settings")}>
              <Settings className="size-5" />
              Settings
            </button>
            {onToggleTheme && (
              <button onClick={onToggleTheme} className={tab(false)}>
                {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
                {dark ? "Light" : "Dark"}
              </button>
            )}
            <button
              onClick={logout}
              disabled={loggingOut}
              className="ml-2 flex w-[calc(100%-0.5rem)] flex-col items-center gap-0.5 rounded-l-2xl py-2.5 text-[10px] font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <LogOut className="size-5" />
              {loggingOut ? "..." : "Log out"}
            </button>
          </div>
        </nav>
      </aside>

      {/* MOBILE BOTTOM BAR */}
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="mx-auto flex max-w-md items-end justify-around rounded-t-[1.75rem] border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.35)]">
          {items.slice(0, 5).map(({ view, label, Icon }) => {
            const isActive = active === view;
            return (
              <button
                key={view}
                onClick={() => go(view)}
                aria-current={isActive ? "page" : undefined}
                className="flex w-16 flex-col items-center gap-0.5"
              >
                <span
                  className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "-mt-7 size-12 bg-primary text-primary-foreground shadow-lg ring-[6px] ring-background"
                      : "size-8 text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}