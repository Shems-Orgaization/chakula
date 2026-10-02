// components/topbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ShoppingBag, Menu } from "lucide-react";
import { View } from "@/lib/types";
import { ReminderPopover } from "@/components/reminder-popover";

type TopbarProps = {
  view: View;
  shoppingCount: number;
  onShowNotice: (message: string) => void;
  onNavigate: (view: View) => void;
  onOpenMobileMenu?: () => void;
};

const pageTitles: Record<string, string> = {
  home: "Modern Kenyan Dining",
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

const pageSubtitles: Record<string, string> = {
  home: "Your kitchen, your way.",
  browse: "Discover something delicious.",
  pantry: "Everything you have on hand.",
  planner: "Plan your meals with ease.",
  meals: "Your saved and cooked meals.",
  shopping: "Everything you need to buy.",
  surprise: "Let Chakula choose for you.",
  detail: "Everything about this recipe.",
  profile: "Manage your personal information.",
  settings: "Make Chakula fit your table.",
};

export function Topbar({
  view,
  shoppingCount,
  onShowNotice,
  onNavigate,
  onOpenMobileMenu,
}: TopbarProps) {
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const reminderRef = useRef<HTMLDivElement>(null);

  const title = pageTitles[view] ?? "Modern Kenyan Dining";
  const subtitle = pageSubtitles[view] ?? "Kenyan food, made easy.";

  // Fetch unread reminder count
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/reminders");
        if (!res.ok) return;
        const data = await res.json();
        const unread = (data.history ?? []).filter((h: any) => !h.read).length;
        setUnreadCount(unread);
      } catch {
        // Silent fail
      }
    })();
  }, [remindersOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:gap-6 sm:px-8 lg:px-10">

        {/* ✅ Hamburger menu – visible only on mobile */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Page title */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-lg font-semibold tracking-[-0.025em] text-foreground sm:text-[22px]">
            {title}
          </h1>
          <p className="mt-0.5 hidden truncate text-xs text-muted-foreground sm:block sm:text-[13px]">
            {subtitle}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center">
          {/* Reminders */}
          <div ref={reminderRef} className="relative">
            <button
              type="button"
              onClick={() => setRemindersOpen(!remindersOpen)}
              className={`group flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium transition-colors sm:px-3 ${
                remindersOpen
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-label="Meal reminders"
            >
              <div className="relative">
                <Bell className="size-[17px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Reminders</span>
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

          {/* Divider */}
          <span
            aria-hidden="true"
            className="mx-2 hidden h-6 w-px bg-border sm:block"
          />

          {/* Shopping list */}
          <button
            type="button"
            onClick={() => onNavigate("shopping")}
            className="group flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-3"
            aria-label="Shopping list"
          >
            <ShoppingBag className="size-[17px]" />
            <span className="hidden sm:inline">List</span>
            {shoppingCount > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {shoppingCount > 99 ? "99+" : shoppingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}