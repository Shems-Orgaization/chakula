"use client";

import {
  Bell,
  ShoppingBag,
} from "lucide-react";

import { View } from "@/lib/types";

type TopbarProps = {
  view: View;
  shoppingCount: number;
  onShowNotice: (message: string) => void;
  onNavigate: (view: View) => void;
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
}: TopbarProps) {
  const title =
    pageTitles[view] ?? "Modern Kenyan Dining";

  const subtitle =
    pageSubtitles[view] ??
    "Kenyan food, made easy.";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">

        {/* ========================================================== */}
        {/* PAGE TITLE                                                   */}
        {/* ========================================================== */}

        <div className="min-w-0">
          <h1 className="truncate font-serif text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-[22px]">
            {title}
          </h1>

          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-[13px]">
            {subtitle}
          </p>
        </div>

        {/* ========================================================== */}
        {/* ACTIONS                                                      */}
        {/* ========================================================== */}

        <div className="flex shrink-0 items-center">

          {/* Reminders */}
          <button
            type="button"
            onClick={() =>
              onShowNotice(
                "Meal reminders are on — we will keep you posted."
              )
            }
            className="group flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Meal reminders"
          >
            <Bell className="size-[17px]" />

            <span className="hidden sm:inline">
              Reminders
            </span>
          </button>

          {/* Vertical separator */}
          <span
            aria-hidden="true"
            className="mx-2 hidden h-6 w-px bg-border sm:block"
          />

          {/* Shopping list */}
          <button
            type="button"
            onClick={() => onNavigate("shopping")}
            className="group flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Shopping list"
          >
            <ShoppingBag className="size-[17px]" />

            <span className="hidden sm:inline">
              List
            </span>

            {shoppingCount > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {shoppingCount > 99
                  ? "99+"
                  : shoppingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}