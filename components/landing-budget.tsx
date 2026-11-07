// components/landing-budget.tsx
// Interactive budget preview. Tiles are buttons that stay on the page: nothing here links into the app.
"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock3, Wallet } from "lucide-react";

const TIERS = [
  {
    amount: 100,
    tone: "bg-highlight text-highlight-foreground",
    meals: [
      ["Uji", "KES 25–50", "18 min"],
      ["Rolex", "KES 60–95", "12 min"],
      ["Chapati", "KES 45–70", "45 min"],
    ],
  },
  {
    amount: 200,
    tone: "bg-primary text-primary-foreground",
    meals: [
      ["Ugali & Sukuma Wiki", "KES 65–110", "28 min"],
      ["Rice & Beans", "KES 90–140", "80 min"],
      ["Ugali & Omena", "KES 130–200", "35 min"],
    ],
  },
  {
    amount: 300,
    tone: "bg-secondary text-secondary-foreground",
    meals: [
      ["Chips Mayai", "KES 150–220", "30 min"],
      ["Ugali & Liver", "KES 160–230", "35 min"],
      ["Ugali & Beef Stew", "KES 220–300", "60 min"],
    ],
  },
  {
    amount: 500,
    tone: "bg-foreground text-background",
    meals: [
      ["Ugali & Fried Fish", "KES 230–320", "45 min"],
      ["Beef Pilau", "KES 250–340", "75 min"],
      ["Chicken Pilau", "KES 340–450", "75 min"],
    ],
  },
];

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function BudgetExplorer() {
  const [amount, setAmount] = useState(200);
  const tier = TIERS.find((t) => t.amount === amount) ?? TIERS[1];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
      <div role="tablist" aria-label="Choose a budget" className="grid grid-cols-2 gap-4">
        {TIERS.map((t) => {
          const active = t.amount === amount;
          return (
            <motion.button
              key={t.amount}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="budget-panel"
              onClick={() => setAmount(t.amount)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex min-h-[150px] flex-col justify-between rounded-3xl p-5 text-left transition-[opacity,box-shadow] sm:min-h-[190px] sm:p-6 ${t.tone} ${focus} ${
                active
                  ? "opacity-100 shadow-xl ring-4 ring-primary/35 ring-offset-2 ring-offset-background"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">Under</p>
                {active && (
                  <span className="flex size-6 items-center justify-center rounded-full bg-current/15">
                    <Check className="size-3.5" />
                  </span>
                )}
              </div>
              <div>
                <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">{t.amount}</p>
                <p className="mt-1 text-sm font-semibold opacity-80">KES</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div
        id="budget-panel"
        role="tabpanel"
        className="rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Meals you could make under
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">KES {amount}</p>
          </div>
          <span className="flex size-11 items-center justify-center rounded-full bg-highlight text-highlight-foreground">
            <Wallet className="size-5" />
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tier.amount}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-6 grid gap-3"
          >
            {tier.meals.map(([name, cost, time], i) => (
              <motion.li
                key={name}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3" />
                    {time}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">
                  {cost}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          A sample of what fits. Chakula shows every meal in your budget, with ingredients and steps.{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}