"use client";

import {
  CalendarDays,
  Home,
  LogOut,
  Search,
  ShoppingBasket,
  Sparkles,
  User,
  UtensilsCrossed,
  X,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type View =
  | "home"
  | "surprise"
  | "browse"
  | "pantry"
  | "planner"
  | "meals"
  | "shopping"
  | "detail"
  | "profile"
  | "settings";

export function Sidebar({
  active,
  onNavigate,
  mobileOpen,
  onClose,
  userEmail,
  userName,
}: {
  active: View;
  onNavigate: (view: View) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
  userEmail?: string;
  userName?: string;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  // Save collapsed state to sessionStorage
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    sessionStorage.setItem("sidebar-collapsed", String(newState));
  };

  const items: Array<{ view: View; label: string; Icon: any }> = [
    { view: "home", label: "Home", Icon: Home },
    { view: "browse", label: "Explore", Icon: Search },
    { view: "planner", label: "Planner", Icon: CalendarDays },
    { view: "shopping", label: "Shopping", Icon: ShoppingBasket },
    { view: "meals", label: "My Meals", Icon: UtensilsCrossed },
  ];

  async function logout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[280px]";

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${sidebarWidth} flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className={`border-b border-border/60 px-3 py-4 ${collapsed ? "px-2" : "px-4"}`}>
          <div className="flex items-center justify-between">
            <button
              className={`flex items-center gap-3 text-left group ${collapsed ? "justify-center w-full" : ""}`}
              onClick={() => {
                onNavigate("home");
                onClose?.();
              }}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
                <UtensilsCrossed className="size-5" strokeWidth={2.2} />
              </span>
              {!collapsed && (
                <span>
                  <strong className="block font-serif text-[1.5rem] leading-none tracking-[-0.04em] text-accent">
                    chakula
                  </strong>
                  <span className="mt-1 block text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Kenyan food, made easy
                  </span>
                </span>
              )}
            </button>

            {/* Collapse toggle - desktop only */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex rounded-lg p-1.5 hover:bg-secondary transition-colors text-muted-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>

            {/* Mobile close */}
            <button
              className="md:hidden rounded-lg p-2 hover:bg-secondary transition-colors"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* User profile - FULL when expanded */}
        {!collapsed && (
          <div className="mx-3 mt-3 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/40 p-3 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {userName || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail || "user@email.com"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User avatar ONLY when collapsed */}
        {collapsed && (
          <div className="mx-auto mt-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-accent">
              <User className="size-5" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main navigation">
          <div className="space-y-1">
            {items.map(({ view, label, Icon }) => (
              <button
                key={view}
                onClick={() => {
                  onNavigate(view);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                  active === view
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                } ${collapsed ? "justify-center px-2" : ""}`}
                aria-current={active === view ? "page" : undefined}
                title={collapsed ? label : undefined}
              >
                <Icon className={`size-5 shrink-0 ${active === view ? "text-accent" : ""}`} />
                {!collapsed && label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-border/60" />

          {/* Profile & Settings */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate("profile");
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                active === "profile"
                  ? "bg-accent/10 text-accent shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
              aria-current={active === "profile" ? "page" : undefined}
              title={collapsed ? "Profile" : undefined}
            >
              <User className={`size-5 shrink-0 ${active === "profile" ? "text-accent" : ""}`} />
              {!collapsed && "Profile"}
            </button>
            <button
              onClick={() => {
                onNavigate("settings");
                onClose?.();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                active === "settings"
                  ? "bg-accent/10 text-accent shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
              aria-current={active === "settings" ? "page" : undefined}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className={`size-5 shrink-0 ${active === "settings" ? "text-accent" : ""}`} />
              {!collapsed && "Settings"}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className={`border-t border-border/60 px-2 py-3 space-y-1.5 ${collapsed ? "px-1" : ""}`}>
          <button
            onClick={() => {
              onNavigate("surprise");
              onClose?.();
            }}
            className={`flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-accent to-orange-500 px-3 py-2.5 text-left text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:scale-[1.02] ${
              collapsed ? "justify-center px-2" : ""
            }`}
            title={collapsed ? "Surprise me" : undefined}
          >
            <Sparkles className="size-5 shrink-0" />
            {!collapsed && "Surprise me"}
          </button>

          <button
            onClick={logout}
            disabled={loggingOut}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-60 ${
              collapsed ? "justify-center px-2" : ""
            }`}
            title={collapsed ? "Log out" : undefined}
          >
            <LogOut className="size-5 shrink-0" />
            {!collapsed && (loggingOut ? "Signing out…" : "Log out")}
          </button>
        </div>
      </aside>
    </>
  );
}