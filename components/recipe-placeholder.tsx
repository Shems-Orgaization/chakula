// components/recipe-placeholder.tsx
import {
  Utensils, Salad, Beef, Soup, Cake, Coffee, Flame, Soup as SoupIcon,
  ChefHat, Wheat, Fish
} from "lucide-react";

interface RecipePlaceholderProps {
  name: string;
  category?: string;
  className?: string;
  showName?: boolean;
}

// Deterministic color from name — same recipe always gets same color
const GRADIENT_PALETTE = [
  { from: "from-orange-100", to: "to-orange-200", text: "text-orange-800", dark: "dark:from-orange-950/40 dark:to-orange-900/20 dark:text-orange-300", icon: "text-orange-600/60 dark:text-orange-400/60" },
  { from: "from-amber-100", to: "to-amber-200", text: "text-amber-800", dark: "dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-300", icon: "text-amber-600/60 dark:text-amber-400/60" },
  { from: "from-red-100", to: "to-red-200", text: "text-red-800", dark: "dark:from-red-950/40 dark:to-red-900/20 dark:text-red-300", icon: "text-red-600/60 dark:text-red-400/60" },
  { from: "from-rose-100", to: "to-rose-200", text: "text-rose-800", dark: "dark:from-rose-950/40 dark:to-rose-900/20 dark:text-rose-300", icon: "text-rose-600/60 dark:text-rose-400/60" },
  { from: "from-green-100", to: "to-emerald-200", text: "text-green-800", dark: "dark:from-green-950/40 dark:to-emerald-900/20 dark:text-green-300", icon: "text-green-600/60 dark:text-green-400/60" },
  { from: "from-teal-100", to: "to-teal-200", text: "text-teal-800", dark: "dark:from-teal-950/40 dark:to-teal-900/20 dark:text-teal-300", icon: "text-teal-600/60 dark:text-teal-400/60" },
  { from: "from-blue-100", to: "to-blue-200", text: "text-blue-800", dark: "dark:from-blue-950/40 dark:to-blue-900/20 dark:text-blue-300", icon: "text-blue-600/60 dark:text-blue-400/60" },
  { from: "from-purple-100", to: "to-purple-200", text: "text-purple-800", dark: "dark:from-purple-950/40 dark:to-purple-900/20 dark:text-purple-300", icon: "text-purple-600/60 dark:text-purple-400/60" },
  { from: "from-pink-100", to: "to-pink-200", text: "text-pink-800", dark: "dark:from-pink-950/40 dark:to-pink-900/20 dark:text-pink-300", icon: "text-pink-600/60 dark:text-pink-400/60" },
  { from: "from-yellow-100", to: "to-yellow-200", text: "text-yellow-800", dark: "dark:from-yellow-950/40 dark:to-yellow-900/20 dark:text-yellow-300", icon: "text-yellow-600/60 dark:text-yellow-400/60" },
];

// Category → icon map
const CATEGORY_ICON: Record<string, any> = {
  ugali: Wheat,
  rice: Utensils,
  chapati: ChefHat,
  breakfast: Coffee,
  beans: Soup,
  ndengu: Soup,
  matoke: Salad,
  omena: Fish,
  chicken: Beef,
  beef: Beef,
  eggs: Utensils,
  potatoes: Utensils,
  pasta: Utensils,
  vegetables: Salad,
  traditional: Utensils,
  "street food": Utensils,
  vegetarian: Salad,
  "high-protein": Beef,
  dessert: Cake,
  soup: SoupIcon,
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getIcon(name: string, category?: string) {
  const cat = (category || "").toLowerCase().trim();
  if (CATEGORY_ICON[cat]) return CATEGORY_ICON[cat];

  // Fallback: check name for keywords
  const n = name.toLowerCase();
  if (n.includes("fish") || n.includes("omena")) return Fish;
  if (n.includes("chicken")) return Beef;
  if (n.includes("beef") || n.includes("meat")) return Beef;
  if (n.includes("salad") || n.includes("veggie")) return Salad;
  if (n.includes("soup") || n.includes("stew")) return Soup;
  if (n.includes("cake") || n.includes("sweet")) return Cake;
  if (n.includes("coffee") || n.includes("chai") || n.includes("tea")) return Coffee;

  return Utensils;
}

export function RecipePlaceholder({
  name,
  category,
  className = "",
  showName = true,
}: RecipePlaceholderProps) {
  const hash = hashString(name);
  const palette = GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length];
  const Icon = getIcon(name, category);

  return (
    <div
      className={`relative flex aspect-[1.2] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${palette.from} ${palette.to} ${palette.dark} ${className}`}
    >
      {/* Subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "16px 16px",
        }}
      />

      <Icon className={`relative size-16 ${palette.icon}`} strokeWidth={1.5} />

      {showName && (
        <p className={`relative mt-3 max-w-[80%] text-center font-serif text-lg font-semibold leading-tight ${palette.text}`}>
          {name}
        </p>
      )}
    </div>
  );
}