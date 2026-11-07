// lib/landing-shared.ts
// Plain data shared by the landing page, navbar and hero (no JSX, safe on server and client).

/* ONE width for the navbar and every section, so everything lines up (Tailwind max-w-7xl = 80rem). */
export const WRAP = "mx-auto w-full max-w-[100rem] px-4";

export const NAV_LINKS = [
  { href: "#budget", label: "Budgets" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#meals", label: "Meals" },
  { href: "#faq", label: "FAQ" },
];

export const PREVIEW = [
  { name: "Ugali & Sukuma Wiki", cost: "KES 65–110", time: "28 min" },
  { name: "Rice & Beans", cost: "KES 90–140", time: "80 min" },
  { name: "Ugali & Omena", cost: "KES 130–200", time: "35 min" },
];