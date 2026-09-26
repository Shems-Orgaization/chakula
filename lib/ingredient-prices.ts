// lib/ingredient-prices.ts
// Approximate Kenyan market prices (KES) — updated Sep 2026
// Format: [price_min, price_max, unit]
// User can override; these are just smart defaults.

export interface PriceEstimate {
  min: number;
  max: number;
  unit: string;
  typical: number;
}

const PRICE_MAP: Record<string, [number, number, string]> = {
  // ========== PRODUCE (Vegetables & Fruits) ==========
  "tomatoes": [80, 120, "kg"],
  "tomato": [80, 120, "kg"],
  "onions": [80, 120, "kg"],
  "onion": [80, 120, "kg"],
  "potatoes": [60, 100, "kg"],
  "potato": [60, 100, "kg"],
  "carrots": [60, 90, "kg"],
  "carrot": [60, 90, "kg"],
  "cabbage": [30, 60, "head"],
  "sukuma wiki": [20, 40, "bunch"],
  "kale": [20, 40, "bunch"],
  "spinach": [20, 40, "bunch"],
  "managu": [30, 50, "bunch"],
  "terere": [30, 50, "bunch"],
  "mrenda": [30, 60, "bunch"],
  "kunde": [30, 50, "bunch"],
  "matoke": [100, 150, "bunch"],
  "banana": [20, 40, "each"],
  "bananas": [20, 40, "each"],
  "mango": [40, 70, "each"],
  "mangoes": [40, 70, "each"],
  "avocado": [30, 60, "each"],
  "lemon": [10, 20, "each"],
  "lime": [10, 20, "each"],
  "garlic": [10, 20, "clove"],
  "ginger": [20, 40, "piece"],
  "dhania": [10, 20, "bunch"],
  "cilantro": [10, 20, "bunch"],
  "green pepper": [20, 40, "each"],
  "bell pepper": [40, 80, "each"],
  "chili": [10, 20, "piece"],
  "cucumber": [30, 50, "each"],
  "lettuce": [40, 70, "head"],
  "broccoli": [80, 150, "head"],
  "zucchini": [40, 70, "each"],
  "pumpkin": [100, 200, "kg"],
  "corn": [30, 60, "each"],
  "maize": [30, 60, "each"],
  "sweet potato": [50, 80, "kg"],
  "arrow roots": [80, 150, "kg"],
  "nduma": [80, 150, "kg"],
  "peas": [100, 150, "kg"],
  "green beans": [80, 120, "kg"],

  // ========== MEAT & FISH ==========
  "beef": [500, 700, "kg"],
  "chicken": [500, 700, "kg"],
  "kuku": [500, 700, "kg"],
  "goat": [600, 800, "kg"],
  "goat meat": [600, 800, "kg"],
  "pork": [450, 650, "kg"],
  "fish": [400, 600, "kg"],
  "tilapia": [400, 600, "kg"],
  "omena": [400, 600, "kg"],
  "sausage": [50, 80, "piece"],
  "smokie": [30, 50, "piece"],
  "mutura": [100, 200, "kg"],
  "mince": [500, 700, "kg"],
  "ground beef": [500, 700, "kg"],
  "prawn": [800, 1200, "kg"],
  "shrimp": [800, 1200, "kg"],

  // ========== DAIRY ==========
  "milk": [60, 90, "liter"],
  "fresh milk": [60, 90, "liter"],
  "cream": [100, 150, "250ml"],
  "yogurt": [100, 150, "500ml"],
  "yoghurt": [100, 150, "500ml"],
  "cheese": [400, 600, "250g"],
  "butter": [250, 350, "250g"],
  "ghee": [500, 700, "500g"],
  "eggs": [15, 20, "each"],
  "egg": [15, 20, "each"],

  // ========== PANTRY / GRAINS ==========
  "rice": [150, 250, "kg"],
  "basmati rice": [200, 350, "kg"],
  "maize flour": [120, 180, "2kg"],
  "unga": [120, 180, "2kg"],
  "wheat flour": [100, 150, "kg"],
  "all-purpose flour": [100, 150, "kg"],
  "pasta": [100, 150, "500g"],
  "spaghetti": [100, 150, "500g"],
  "macaroni": [100, 150, "500g"],
  "noodles": [50, 80, "pack"],
  "bread": [50, 70, "loaf"],
  "oats": [150, 250, "500g"],
  "quinoa": [400, 600, "500g"],
  "beans": [100, 150, "kg"],
  "dried beans": [100, 150, "kg"],
  "ndengu": [150, 200, "kg"],
  "green grams": [150, 200, "kg"],
  "lentils": [180, 250, "kg"],
  "chickpeas": [180, 250, "kg"],
  "cooking oil": [250, 350, "liter"],
  "vegetable oil": [250, 350, "liter"],
  "olive oil": [600, 900, "500ml"],
  "sugar": [130, 180, "kg"],
  "honey": [400, 600, "500g"],
  "salt": [30, 50, "pack"],
  "coconut milk": [80, 130, "can"],
  "coconut": [50, 100, "each"],
  "peanut butter": [250, 400, "500g"],
  "groundnuts": [100, 200, "kg"],
  "peanuts": [100, 200, "kg"],

  // ========== SPICES & CONDIMENTS ==========
  "black pepper": [50, 100, "pack"],
  "curry powder": [30, 60, "pack"],
  "cumin": [50, 100, "pack"],
  "coriander": [50, 100, "pack"],
  "paprika": [50, 100, "pack"],
  "turmeric": [30, 60, "pack"],
  "pilau masala": [50, 100, "pack"],
  "garam masala": [50, 100, "pack"],
  "cinnamon": [50, 100, "pack"],
  "cardamom": [100, 200, "pack"],
  "chili powder": [30, 60, "pack"],
  "soy sauce": [80, 150, "bottle"],
  "vinegar": [60, 100, "bottle"],
  "tomato sauce": [80, 150, "bottle"],
  "tomato paste": [60, 100, "can"],

  // ========== BEVERAGES ==========
  "tea": [50, 100, "pack"],
  "tea leaves": [50, 100, "pack"],
  "coffee": [200, 400, "pack"],
  "milo": [200, 350, "pack"],
  "cocoa": [200, 350, "pack"],

  // ========== OTHER ==========
  "breadcrumbs": [80, 120, "pack"],
  "puff pastry": [200, 300, "pack"],
  "samosa wrappers": [80, 150, "pack"],
};

/**
 * Look up approximate price for an ingredient
 */
export function getEstimatedPrice(ingredientName: string): PriceEstimate {
  const normalized = ingredientName
    .toLowerCase()
    .trim()
    .replace(/s$/, ""); // Remove trailing 's' for plural matching

  // Try exact match
  if (PRICE_MAP[normalized]) {
    const [min, max, unit] = PRICE_MAP[normalized];
    return { min, max, unit, typical: Math.round((min + max) / 2) };
  }

  // Try partial match (e.g., "fresh tomatoes" → "tomatoes")
  for (const key of Object.keys(PRICE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const [min, max, unit] = PRICE_MAP[key];
      return { min, max, unit, typical: Math.round((min + max) / 2) };
    }
  }

  // Default fallback
  return { min: 50, max: 100, unit: "each", typical: 75 };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}