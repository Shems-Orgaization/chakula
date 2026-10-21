// lib/ingredient-prices.ts
// Approximate Kenyan market prices (KES) — updated for v2 Catalogue

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
};

export function getEstimatedPrice(ingredientName: string): PriceEstimate {
  const normalized = ingredientName.toLowerCase().trim().replace(/s$/, "");
  if (PRICE_MAP[normalized]) {
    const [min, max, unit] = PRICE_MAP[normalized];
    return { min, max, unit, typical: Math.round((min + max) / 2) };
  }
  for (const key of Object.keys(PRICE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const [min, max, unit] = PRICE_MAP[key];
      return { min, max, unit, typical: Math.round((min + max) / 2) };
    }
  }
  return { min: 20, max: 50, unit: "piece", typical: 35 };
}

export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}