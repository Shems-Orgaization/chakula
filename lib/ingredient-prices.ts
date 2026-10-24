// lib/ingredient-prices.ts
// Approximate Kenyan market prices (KES) — updated for v2 Catalogue
// Format: [price_min, price_max, unit]
//
// This file does two jobs:
//   1. getEstimatedPrice(name)    → "what does this cost at the market?"
//   2. estimateRecipeCost(lines)  → turns recipe quantities (cups, tbsp, pieces)
//                                   into KES, so costs are computed, not guessed.

export interface PriceEstimate {
  min: number;
  max: number;
  unit: string;
  typical: number;
}

const PRICE_MAP: Record<string, [number, number, string]> = {
  // ========== PRODUCE ==========
  "tomato": [20, 30, "piece"],
  "tomatoes": [20, 30, "piece"],
  "onion": [15, 25, "piece"],
  "onions": [15, 25, "piece"],
  "potatoes": [60, 100, "kg"],
  "carrot": [15, 20, "piece"],
  "cabbage": [30, 60, "head"],
  "sukuma wiki": [20, 40, "bunch"],
  "kale": [20, 40, "bunch"],
  "spinach": [20, 40, "bunch"],
  "managu": [30, 50, "bunch"],
  "terere": [30, 50, "bunch"],
  "mrenda": [30, 60, "bunch"],
  "kunde": [30, 50, "bunch"],
  "saget": [20, 40, "bunch"],
  "matoke": [15, 25, "piece"],
  "banana": [20, 40, "piece"],
  "ripe bananas": [20, 40, "piece"],
  "mango": [40, 70, "piece"],
  "mangoes": [40, 70, "piece"],
  "avocado": [30, 60, "piece"],
  "lemon": [10, 20, "piece"],
  "lime": [10, 20, "piece"],
  "garlic": [10, 20, "clove"],
  "ginger": [20, 40, "piece"],
  "dhania": [10, 20, "bunch"],
  "cilantro": [10, 20, "bunch"],
  "green pepper": [20, 40, "piece"],
  "bell pepper": [40, 80, "piece"],
  "chili": [5, 10, "piece"],
  "cucumber": [30, 50, "piece"],
  "lettuce": [40, 70, "head"],
  "pumpkin": [100, 200, "kg"],
  "maize": [30, 60, "piece"],
  "maize cobs": [30, 60, "piece"],
  "dried maize": [100, 150, "kg"],
  "sweet potato": [50, 80, "kg"],
  "arrow roots": [80, 150, "kg"],
  "cassava": [60, 100, "kg"],
  "peas": [100, 150, "kg"],
  "green beans": [80, 120, "kg"],
  "passion fruit": [10, 20, "piece"],

  // ========== MEAT & FISH ==========
  "beef": [500, 700, "kg"],
  "chicken": [500, 700, "kg"],
  "kienyeji chicken": [700, 900, "kg"],
  "chicken breast": [600, 800, "kg"],
  "goat meat": [600, 800, "kg"],
  "goat intestines": [300, 500, "kg"],
  "beef liver": [400, 600, "kg"],
  "matumbo": [150, 250, "kg"],
  "beef mince": [500, 700, "kg"],
  "mince": [500, 700, "kg"],
  "fish": [400, 600, "kg"],
  "tilapia": [400, 600, "piece"],
  "omena": [300, 500, "kg"],
  "sausage": [40, 60, "piece"],
  "smokie": [30, 50, "piece"],

  // ========== DAIRY & EGGS ==========
  "milk": [60, 90, "liter"],
  "eggs": [15, 20, "piece"],
  "egg": [15, 20, "piece"],
  "coconut milk": [80, 130, "can"],

  // ========== PANTRY ==========
  "rice": [150, 250, "kg"],
  "basmati rice": [200, 350, "kg"],
  "maize flour": [120, 180, "2kg"],
  "wheat flour": [100, 150, "kg"],
  "spaghetti": [100, 150, "500g"],
  "macaroni": [100, 150, "500g"],
  "noodles": [50, 80, "pack"],
  "bread": [50, 70, "loaf"],
  "beans": [100, 150, "kg"],
  "dried beans": [100, 150, "kg"],
  "ndengu": [150, 200, "kg"],
  "lentils": [180, 250, "kg"],
  "cowpeas": [120, 180, "kg"],
  "pigeon peas": [120, 180, "kg"],
  "dried peas": [100, 150, "kg"],
  "njahi": [150, 200, "kg"],
  "gram flour": [100, 150, "kg"],
  "cooking oil": [250, 350, "liter"],
  "sugar": [130, 180, "kg"],
  "salt": [30, 50, "pack"],
  "tea leaves": [50, 100, "pack"],
  "coconut": [50, 100, "piece"],
  "yoghurt": [100, 150, "500ml"],
  "cheese": [400, 600, "250g"],
  "butter": [250, 350, "250g"],
  "burger buns": [30, 50, "piece"],
  "yeast": [50, 100, "pack"],
  "baking powder": [30, 60, "pack"],

  // ========== SPICES ==========
  "curry powder": [30, 60, "pack"],
  "pilau masala": [50, 100, "pack"],
  "garam masala": [50, 100, "pack"],
  "chili powder": [30, 60, "pack"],
  "turmeric": [30, 60, "pack"],
  "cardamom": [100, 200, "pack"],
  "soy sauce": [80, 150, "bottle"],
  "tomato sauce": [80, 150, "bottle"],
  "mayonnaise": [100, 150, "jar"],

  // ========== ADDED: used by the 110 recipes, missing from the table above ==========
  "orange": [15, 30, "piece"],
  "millet flour": [150, 220, "kg"],
  "chapati": [15, 25, "piece"],
  "chili sauce": [80, 150, "bottle"],
  "black pepper": [50, 100, "pack"],
  "boiled maize": [50, 70, "kg"], // cooked weight, cheaper per kg than dry maize
  "cooked rice": [60, 100, "kg"], // cooked weight
  "water": [0, 0, "liter"],
  "hot water": [0, 0, "liter"],
};

// ---------------------------------------------------------------------------
// Matching: turn "Ripe bananas" or "Kunde leaves" into the right PRICE_MAP key
// ---------------------------------------------------------------------------

const singular = (word: string): string => {
  if (word.length > 3 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.endsWith("oes")) return word.slice(0, -2); // tomatoes → tomato
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singular)
    .join(" ");

// Longest keys first, so "sweet potato" wins over "potato" and
// "kienyeji chicken" wins over "chicken".
const KEY_INDEX = Object.keys(PRICE_MAP)
  .map((key) => ({ key, norm: normalize(key) }))
  .sort((a, b) => b.norm.length - a.norm.length);

function findPriceKey(ingredientName: string): string | null {
  const name = normalize(ingredientName);
  if (!name) return null;

  const exact = KEY_INDEX.find((entry) => entry.norm === name);
  if (exact) return exact.key;

  // Whole-word containment only ("fresh tomatoes" → tomato), never a loose substring.
  const padded = ` ${name} `;
  const partial = KEY_INDEX.find((entry) => padded.includes(` ${entry.norm} `));
  return partial ? partial.key : null;
}

/** True when we have a real price for this ingredient (not the default guess). */
export function hasPrice(ingredientName: string): boolean {
  return findPriceKey(ingredientName) !== null;
}

/**
 * Look up approximate price for an ingredient
 */
export function getEstimatedPrice(ingredientName: string): PriceEstimate {
  const key = findPriceKey(ingredientName);
  if (key) {
    const [min, max, unit] = PRICE_MAP[key];
    return { min, max, unit, typical: Math.round((min + max) / 2) };
  }

  // Default fallback
  return { min: 20, max: 50, unit: "piece", typical: 35 };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

// ---------------------------------------------------------------------------
// Cost calculator
// ---------------------------------------------------------------------------
// Problem: prices are per kg / bunch / bottle, recipes use cups / tbsp / pieces.
// Solution: SPEC says how big a cup, a piece or a pack is for each ingredient.

interface Spec {
  cup?: number; // grams in one cup (ml for liquids)
  piece?: number; // grams in one piece, for items priced by weight
  perUnit?: number; // recipe pieces in one price unit (fingers per bunch, cloves per bulb, slices per loaf)
  unitG?: number; // grams in one price unit (a head of cabbage, a pack)
  unitMl?: number; // ml in one bottle or can
  tspPerPack?: number; // teaspoons in one pack of spice
}

const SPEC_SOURCE: Record<string, Spec> = {
  // flours and grains: grams per cup
  "maize flour": { cup: 130 },
  "unga": { cup: 130 },
  "wheat flour": { cup: 120 },
  "all-purpose flour": { cup: 120 },
  "millet flour": { cup: 120 },
  "gram flour": { cup: 100 },
  "rice": { cup: 190 },
  "basmati rice": { cup: 190 },
  "cooked rice": { cup: 160 },
  "beans": { cup: 190 },
  "dried beans": { cup: 190 },
  "ndengu": { cup: 200 },
  "green grams": { cup: 200 },
  "lentils": { cup: 200 },
  "chickpeas": { cup: 190 },
  "cowpeas": { cup: 190 },
  "pigeon peas": { cup: 190 },
  "dried peas": { cup: 200 },
  "njahi": { cup: 190 },
  "dried maize": { cup: 170 },
  "boiled maize": { cup: 150 },
  "peas": { cup: 150 },
  "sugar": { cup: 200 },
  "mayonnaise": { unitMl: 250 }, // priced per jar
  // weight of one piece
  "tomato": { piece: 100 },
  "onion": { piece: 100 },
  "potato": { piece: 150 },
  "carrot": { piece: 80 },
  "sweet potato": { piece: 250 },
  "tilapia": { piece: 450 },
  "fish": { piece: 450 },
  // price unit sizes
  "cabbage": { unitG: 1000 },
  "bread": { perUnit: 14 },
  "soy sauce": { unitMl: 250 },
  "vinegar": { unitMl: 250 },
  "chili sauce": { unitMl: 250 },
  "tomato sauce": { unitMl: 400 },
  "tomato paste": { unitMl: 70 },
  "coconut milk": { unitMl: 400 },
  // teaspoons per pack of spice (default 20)
  "salt": { tspPerPack: 150 },
  "tea leaves": { tspPerPack: 50 },
  "tea": { tspPerPack: 50 },
  "yeast": { tspPerPack: 3 },
  "baking powder": { tspPerPack: 3 },
};

const SPEC: Record<string, Spec> = {};
for (const [name, spec] of Object.entries(SPEC_SOURCE)) SPEC[normalize(name)] = spec;

const specFor = (key: string): Spec => SPEC[normalize(key)] ?? {};

type PriceBase =
  | { kind: "mass"; size: number } // size in grams
  | { kind: "volume"; size: number } // size in ml
  | { kind: "count"; label: string };

function parsePriceUnit(unit: string): PriceBase {
  const mass = unit.match(/^(\d+(?:\.\d+)?)?(kg|g)$/);
  if (mass) return { kind: "mass", size: Number(mass[1] ?? 1) * (mass[2] === "kg" ? 1000 : 1) };
  const volume = unit.match(/^(\d+(?:\.\d+)?)?(liter|litre|l|ml)$/);
  if (volume) return { kind: "volume", size: Number(volume[1] ?? 1) * (volume[2] === "ml" ? 1 : 1000) };
  return { kind: "count", label: unit };
}

/** What the recipe line weighs in grams, or null if we can't tell. */
function toGrams(unit: string, qty: number, spec: Spec): number | null {
  switch (unit) {
    case "g": return qty;
    case "kg": return qty * 1000;
    case "ml": return qty; // treat 1 ml ≈ 1 g
    case "l": return qty * 1000;
    case "cup": return qty * (spec.cup ?? 200);
    case "tbsp": return (qty * (spec.cup ?? 200)) / 16;
    case "tsp": return (qty * (spec.cup ?? 200)) / 48;
    case "piece": return qty * (spec.piece ?? 100);
    case "bunch": return qty * 100;
    case "head": return qty * (spec.unitG ?? 1000);
    case "clove": return qty * 5;
    default: return null;
  }
}

/** What the recipe line measures in ml, or null if we can't tell. */
function toMl(unit: string, qty: number): number | null {
  switch (unit) {
    case "ml": return qty;
    case "l": return qty * 1000;
    case "cup": return qty * 240;
    case "tbsp": return qty * 15;
    case "tsp": return qty * 5;
    case "g": return qty; // treat 1 g ≈ 1 ml
    default: return null;
  }
}

/** How many price units (kg, bunch, bottle...) the recipe line uses. */
function toPriceUnits(unit: string, qty: number, priceUnit: string, spec: Spec): number | null {
  const base = parsePriceUnit(priceUnit);

  if (base.kind === "mass") {
    const grams = toGrams(unit, qty, spec);
    return grams === null ? null : grams / base.size;
  }
  if (base.kind === "volume") {
    const ml = toMl(unit, qty);
    return ml === null ? null : ml / base.size;
  }

  // Count-priced: each, piece, clove, bulb, bunch, head, pack, bottle, can, loaf
  switch (unit) {
    case "piece":
    case "bunch":
    case "head":
    case "clove":
      return qty / (spec.perUnit ?? 1);
    case "g":
      if (spec.unitG) return qty / spec.unitG;
      return base.label === "pack" ? qty / 50 : null;
    case "tsp":
      return base.label === "pack" ? qty / (spec.tspPerPack ?? 20) : bottleShare(base.label, qty * 5, spec);
    case "tbsp":
      return base.label === "pack" ? (qty * 3) / (spec.tspPerPack ?? 20) : bottleShare(base.label, qty * 15, spec);
    case "cup":
      return bottleShare(base.label, qty * 240, spec);
    case "ml":
      return bottleShare(base.label, qty, spec);
    default:
      return null;
  }
}

function bottleShare(label: string, ml: number, spec: Spec): number | null {
  if (label === "bottle" || label === "jar") return ml / (spec.unitMl ?? 250);
  if (label === "can") return ml / (spec.unitMl ?? 400);
  return null;
}

export interface CostLine {
  name: string;
  qty: number | null;
  unit: string; // g, kg, ml, l, cup, tbsp, tsp, piece, bunch, head, clove, pinch, to_taste
  optional?: boolean;
}

export interface CostEstimate {
  min: number;
  max: number;
  /** Ingredients we had no price or no conversion for. Check these before trusting the total. */
  unpriced: string[];
}

/** Cost range for one ingredient line, or null when we can't price it. */
export function estimateIngredientCost(line: CostLine): { min: number; max: number } | null {
  const key = findPriceKey(line.name);
  if (!key) return null;

  if (line.unit === "to_taste" || line.unit === "pinch" || line.qty === null || line.qty === 0) {
    return { min: 0, max: 0 };
  }

  const [priceMin, priceMax, priceUnit] = PRICE_MAP[key];
  const units = toPriceUnits(line.unit, line.qty, priceUnit, specFor(key));
  if (units === null) return null;

  return { min: priceMin * units, max: priceMax * units };
}

/**
 * Cost of a whole recipe (all servings).
 * min = cheapest prices, optional ingredients left out.
 * max = dearest prices, optional ingredients included.
 */
export function estimateRecipeCost(lines: CostLine[]): CostEstimate {
  let min = 0;
  let max = 0;
  const unpriced: string[] = [];

  for (const line of lines) {
    const cost = estimateIngredientCost(line);
    if (!cost) {
      unpriced.push(line.name);
      continue;
    }
    if (!line.optional) min += cost.min;
    max += cost.max;
  }

  return { min: Math.round(min), max: Math.round(max), unpriced };
}