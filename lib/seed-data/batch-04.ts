// lib/seed-data/batch-04.ts
// Batch 4: the rest of the catalogue (59 recipes). With batches 1-3 this makes 110.
// mk() fills in common defaults (Easy, Nationwide, not one-pot, no fridge, no tags).
// Costs are hand estimates for the WHOLE recipe (Nairobi prices, Oct 2026).

import { ing, type Audience, type SeedRecipeV2 } from "./recipe-v2";

type Req = Pick<
  SeedRecipeV2,
  | "id" | "name" | "swahili_name" | "description" | "category" | "meal_type"
  | "prep_time_minutes" | "cook_time_minutes" | "servings"
  | "cost_min_kes" | "cost_max_kes" | "audience" | "ingredients" | "instructions"
> &
  Partial<Pick<SeedRecipeV2, "difficulty" | "region" | "one_pot" | "needs_fridge" | "tags">>;

const mk = (o: Req): SeedRecipeV2 => ({
  difficulty: "Easy",
  region: "Nationwide",
  one_pot: false,
  needs_fridge: false,
  tags: [],
  ...o,
});

const CFT: Audience[] = ["comrade", "family", "traditional"];
const CF: Audience[] = ["comrade", "family"];
const FT: Audience[] = ["family", "traditional"];
const CS: Audience[] = ["comrade", "street"];
const ST: Audience[] = ["street", "family"];

const UGALI =
  "Make the ugali: boil the water, add the flour gradually while stirring, then cook and stir for 5 minutes until firm.";
const RICE =
  "Wash the rice, add 2 cups water and a pinch of salt, bring to the boil, cover and cook on low heat for 15 minutes.";
const WARM = "Warm the chapati on a hot pan for 30 seconds each side.";
const chapati = () => ing("Chapati", 4, "piece");
const salt = () => ing("Salt", null, "to_taste");
const oil = (n: number) => ing("Cooking oil", n, "tbsp");
const frying = () => ing("Cooking oil", 250, "ml", "250 ml for frying");
const tomOn = (t = 2) => [ing("Tomato", t, "piece"), ing("Onion", 1, "piece")];
const legumeSteps = (name: string, mins: string) => [
  `Wash the ${name} and boil in 3 cups water for ${mins} minutes until soft. Soaking overnight is faster.`,
  "Heat the oil and fry the chopped onion until golden, then add the chopped tomatoes and cook until saucy.",
  `Add the boiled ${name} with some liquid and salt. Simmer 10 minutes until thick.`,
];

export const batch04: SeedRecipeV2[] = [
  // ---------- Ugali + rice extras ----------
  mk({
    id: "ugali-nyama-choma", name: "Ugali & Nyama Choma", swahili_name: "Ugali na Nyama Choma",
    description: "Charcoal-grilled beef with kachumbari and hot ugali. The weekend plate.",
    category: "Ugali", meal_type: "Dinner", prep_time_minutes: 25, cook_time_minutes: 45, servings: 2,
    cost_min_kes: 310, cost_max_kes: 410, audience: ["family", "street", "traditional"], difficulty: "Medium",
    needs_fridge: true, tags: ["Weekend"],
    ingredients: [ing("Maize flour", 2, "cup", "2 vikombe"), ing("Water", 3, "cup"), ing("Beef", 400, "g"), ...tomOn(2), ing("Lemon", 1, "piece"), salt()],
    instructions: [
      "Cut the beef into chunks, rub with salt and half the lemon juice and rest 20 minutes.",
      "Grill on glowing charcoal for 30 to 40 minutes, turning often, until cooked and charred at the edges.",
      "Make kachumbari: chop the tomatoes and onion, add salt and the rest of the lemon.",
      UGALI,
      "Chop the meat and serve with the ugali and kachumbari.",
    ],
  }),
  mk({
    id: "egg-fried-rice", name: "Egg Fried Rice", swahili_name: "Wali wa Mayai",
    description: "Rice stir-fried with eggs and vegetables. Best made with leftover rice.",
    category: "Rice", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 15, servings: 2,
    cost_min_kes: 130, cost_max_kes: 180, audience: CF, one_pot: true, tags: ["One-pot", "Quick", "Bachelor-friendly"],
    ingredients: [ing("Cooked rice", 3, "cup", "3 vikombe, cold"), ing("Eggs", 3, "piece"), ing("Carrot", 1, "piece"), ing("Onion", 1, "piece"), oil(3), ing("Soy sauce", 1, "tbsp", undefined, true), salt()],
    instructions: [
      "If the rice is fresh, spread it out to cool and dry for 15 minutes. Dry rice fries better.",
      "Heat 1 tbsp oil and scramble the beaten eggs until just set. Remove.",
      "Fry the chopped onion and grated carrot in the remaining oil for 3 minutes.",
      "Add the rice, salt and soy sauce (if using) and stir-fry on high heat for 4 minutes.",
      "Mix in the eggs and serve hot.",
    ],
  }),
  mk({
    id: "biryani", name: "Biryani", swahili_name: "Biriani",
    description: "Coastal layered rice with spiced beef, potatoes and caramelised onions.",
    category: "Rice", meal_type: "Lunch", prep_time_minutes: 25, cook_time_minutes: 70, servings: 3,
    cost_min_kes: 270, cost_max_kes: 370, audience: FT, region: "Coast", difficulty: "Medium",
    needs_fridge: true, tags: ["Weekend"],
    ingredients: [ing("Rice", 1.5, "cup"), ing("Beef", 250, "g"), ing("Onion", 2, "piece"), ing("Tomato", 2, "piece"), ing("Potatoes", 1, "piece"), ing("Garam masala", 1, "tbsp"), ing("Garlic", 3, "clove"), ing("Yoghurt", 0.25, "cup", "1/4 cup", true), oil(4), salt()],
    instructions: [
      "Cut the beef and potato into cubes. Marinate the beef with garlic, garam masala, yoghurt (if using) and salt for 20 minutes.",
      "Fry the sliced onions in the oil for 10 minutes until deep brown. Take out half for the top.",
      "Add the beef and tomatoes to the pot, cover and cook 30 minutes until tender, adding the potato for the last 10.",
      "Boil the rice in salted water for 8 minutes until half-cooked and drain.",
      "Spread half the rice over the beef, then the rest. Top with the fried onions, cover tightly and steam on very low heat for 20 minutes.",
    ],
  }),

  // ---------- Chapati meals ----------
  mk({
    id: "chapati-maharagwe", name: "Chapati & Beans", swahili_name: "Chapati na Maharagwe",
    description: "Warm chapati with beans stewed in tomato and onion. A Kenyan classic.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 75, servings: 2,
    cost_min_kes: 130, cost_max_kes: 190, audience: CFT, tags: ["Batch-cook"],
    ingredients: [chapati(), ing("Beans", 0.75, "cup", "3/4 cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("beans", "60 to 90"), WARM, "Serve the beans with the chapati."],
  }),
  mk({
    id: "chapati-minji", name: "Chapati & Peas", swahili_name: "Chapati na Minji",
    description: "Soft chapati with thick peas stew.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 50, servings: 2,
    cost_min_kes: 130, cost_max_kes: 190, audience: CFT, tags: ["Batch-cook"],
    ingredients: [chapati(), ing("Dried peas", 0.75, "cup", "3/4 cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("peas", "30 to 40"), WARM, "Serve the peas with the chapati."],
  }),
  mk({
    id: "chapati-kamande", name: "Chapati & Lentils", swahili_name: "Chapati na Kamande",
    description: "Chapati with lentils that cook without soaking. Fast and protein-rich.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 5, cook_time_minutes: 35, servings: 2,
    cost_min_kes: 135, cost_max_kes: 195, audience: CF, tags: ["Quick", "Protein-rich"],
    ingredients: [chapati(), ing("Lentils", 0.75, "cup", "3/4 cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("lentils", "20 to 25"), WARM, "Serve the lentils with the chapati."],
  }),
  mk({
    id: "chapati-kunde", name: "Chapati & Cowpeas", swahili_name: "Chapati na Kunde",
    description: "Chapati with cowpeas simmered in a tomato sauce.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 60, servings: 2,
    cost_min_kes: 130, cost_max_kes: 190, audience: CFT, tags: ["Batch-cook"],
    ingredients: [chapati(), ing("Cowpeas", 0.75, "cup", "3/4 cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("cowpeas", "40 to 50"), WARM, "Serve the cowpeas with the chapati."],
  }),
  mk({
    id: "chapati-mayai", name: "Chapati & Eggs", swahili_name: "Chapati na Mayai",
    description: "Scrambled eggs with tomato and onion, scooped with warm chapati.",
    category: "Chapati", meal_type: "Breakfast", prep_time_minutes: 5, cook_time_minutes: 10, servings: 2,
    cost_min_kes: 130, cost_max_kes: 200, audience: CS, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [chapati(), ing("Eggs", 3, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 1, "piece"), oil(2), salt()],
    instructions: [
      "Heat the oil and fry the chopped onion until soft. Add the chopped tomato and cook 2 minutes.",
      "Beat the eggs with salt, pour in and stir gently until just set.",
      WARM,
      "Serve the eggs with the chapati.",
    ],
  }),
  mk({
    id: "chapati-sukuma", name: "Chapati & Sukuma", swahili_name: "Chapati na Sukuma Wiki",
    description: "Cheap and filling: chapati with garlicky sukuma wiki.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 12, servings: 2,
    cost_min_kes: 125, cost_max_kes: 185, audience: CF, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [chapati(), ing("Sukuma wiki", 1, "bunch"), ...tomOn(2), oil(2), salt()],
    instructions: [
      "Wash the sukuma, remove the thick stems and slice thinly.",
      "Heat the oil, fry the onion until golden, then the tomatoes until saucy.",
      "Add the sukuma and salt, cover and cook 5 to 7 minutes.",
      WARM,
    ],
  }),
  mk({
    id: "chapati-nyama", name: "Chapati & Beef Stew", swahili_name: "Chapati na Nyama",
    description: "Tender beef in thick gravy with warm chapati.",
    category: "Chapati", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 55, servings: 2,
    cost_min_kes: 230, cost_max_kes: 330, audience: FT, needs_fridge: true,
    ingredients: [chapati(), ing("Beef", 250, "g"), ...tomOn(2), oil(2), ing("Garlic", 2, "clove", undefined, true), salt()],
    instructions: [
      "Cut the beef into cubes. Boil in 2 cups water with salt for 30 to 40 minutes until tender.",
      "Fry the chopped onion (and garlic) in the oil until golden, then add the tomatoes and cook until saucy.",
      "Add the beef with its stock and simmer 10 minutes until the gravy thickens.",
      WARM,
    ],
  }),

  // ---------- Githeri and legumes ----------
  mk({
    id: "fried-githeri", name: "Fried Githeri", swahili_name: "Githeri ya Kukaanga",
    description: "Githeri fried with potatoes, tomato and onion until it browns at the edges.",
    category: "Beans", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 100, servings: 4,
    cost_min_kes: 110, cost_max_kes: 170, audience: CFT, region: "Central", one_pot: true, tags: ["One-pot", "Batch-cook", "Leftover-friendly"],
    ingredients: [ing("Dried maize", 1, "cup"), ing("Beans", 1, "cup"), ing("Potatoes", 2, "piece"), ...tomOn(2), oil(3), salt()],
    instructions: [
      "Boil the maize and beans together for 60 to 90 minutes until soft (soak overnight if you can).",
      "Add the diced potatoes for the last 15 minutes and drain most of the water.",
      "Heat the oil and fry the chopped onion until golden, then the tomatoes until saucy.",
      "Add the githeri and salt and fry on medium heat for 8 to 10 minutes, stirring, until browned at the edges.",
    ],
  }),
  mk({
    id: "njahi", name: "Njahi", swahili_name: "Njahi",
    description: "Black beans cooked soft and mashed, a Kikuyu comfort food for ugali or mukimo.",
    category: "Beans", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 100, servings: 3,
    cost_min_kes: 100, cost_max_kes: 150, audience: FT, region: "Central", tags: ["Batch-cook"],
    ingredients: [ing("Njahi", 1, "cup", "1 cup black beans"), ...tomOn(1), oil(2), salt()],
    instructions: [
      "Sort and wash the njahi. Soak overnight, then boil in 4 cups water for 80 to 100 minutes until very soft.",
      "Heat the oil and fry the chopped onion until golden, then the tomato until saucy.",
      "Add the njahi with some liquid and salt, and mash lightly.",
      "Simmer 10 minutes until thick. Serve with ugali or mukimo.",
    ],
  }),
  mk({
    id: "ndengu-stew", name: "Ndengu Stew", swahili_name: "Ndengu",
    description: "Green grams in a tomato and onion sauce. Eat with chapati, rice or ugali.",
    category: "Ndengu", meal_type: "Lunch", prep_time_minutes: 10, cook_time_minutes: 55, servings: 3,
    cost_min_kes: 80, cost_max_kes: 120, audience: CFT, tags: ["Batch-cook", "Leftover-friendly"],
    ingredients: [ing("Ndengu", 1, "cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("ndengu", "35 to 45"), "Serve with chapati, rice or ugali."],
  }),
  mk({
    id: "kamande-stew", name: "Lentil Stew", swahili_name: "Kamande",
    description: "Lentils simmered in tomato and onion. No soaking, ready in 30 minutes.",
    category: "Beans", meal_type: "Lunch", prep_time_minutes: 5, cook_time_minutes: 35, servings: 3,
    cost_min_kes: 90, cost_max_kes: 130, audience: CF, tags: ["Quick", "Protein-rich"],
    ingredients: [ing("Lentils", 1, "cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("lentils", "20 to 25"), "Serve with chapati, rice or ugali."],
  }),
  mk({
    id: "minji-stew", name: "Peas Stew", swahili_name: "Minji",
    description: "Dried peas in a thick tomato sauce, one of the cheapest proteins.",
    category: "Beans", meal_type: "Lunch", prep_time_minutes: 10, cook_time_minutes: 50, servings: 3,
    cost_min_kes: 75, cost_max_kes: 110, audience: CFT, tags: ["Batch-cook"],
    ingredients: [ing("Dried peas", 1, "cup"), ...tomOn(2), oil(2), salt()],
    instructions: [...legumeSteps("peas", "30 to 40"), "Serve with chapati, rice or ugali."],
  }),
  mk({
    id: "nyoyo", name: "Nyoyo", swahili_name: "Nyoyo",
    description: "Luo-style maize and beans boiled together until soft, simple and filling.",
    category: "Beans", meal_type: "Lunch", prep_time_minutes: 10, cook_time_minutes: 100, servings: 4,
    cost_min_kes: 70, cost_max_kes: 100, audience: ["family", "traditional"], region: "Nyanza", one_pot: true, tags: ["One-pot", "Batch-cook"],
    ingredients: [ing("Dried maize", 1, "cup"), ing("Beans", 1, "cup"), ing("Onion", 1, "piece"), oil(1), salt()],
    instructions: [
      "Sort and wash the maize and beans. Soak overnight if possible.",
      "Boil together in plenty of water for 80 to 100 minutes, adding hot water when needed, until both are very soft.",
      "Add the chopped onion, oil and salt and simmer 10 minutes.",
      "Serve hot as a meal on its own.",
    ],
  }),

  // ---------- Mukimo / potatoes / roots ----------
  mk({
    id: "mukimo-nyama", name: "Mukimo & Beef Stew", swahili_name: "Mukimo na Nyama",
    description: "Green mukimo with a beef stew on top. The full Central Kenya plate.",
    category: "Potatoes", meal_type: "Dinner", prep_time_minutes: 20, cook_time_minutes: 70, servings: 3,
    cost_min_kes: 295, cost_max_kes: 415, audience: FT, region: "Central", needs_fridge: true, tags: ["Weekend"],
    ingredients: [ing("Beef", 300, "g"), ing("Potatoes", 500, "g", "4 medium"), ing("Boiled maize", 1, "cup"), ing("Peas", 0.5, "cup", "1/2 cup"), ing("Sukuma wiki", 1, "bunch"), ...tomOn(2), oil(3), salt()],
    instructions: [
      "Boil the beef cubes in 2 cups water with salt for 40 minutes until tender.",
      "Fry the chopped onion in the oil, add the tomatoes and cook until saucy. Add the beef with its stock and simmer 10 minutes.",
      "Boil the potatoes with the peas and maize for 20 minutes, adding the chopped sukuma for the last 3.",
      "Drain, keeping 1/2 cup water, and mash everything roughly together.",
      "Serve the mukimo with the beef stew.",
    ],
  }),
  mk({
    id: "chips-kuku", name: "Chips Kuku", swahili_name: "Chips Kuku",
    description: "Golden chips with fried chicken and kachumbari. A Nairobi street classic.",
    category: "Potatoes", meal_type: "Dinner", prep_time_minutes: 20, cook_time_minutes: 40, servings: 2,
    cost_min_kes: 340, cost_max_kes: 450, audience: ST, region: "Nairobi", needs_fridge: true,
    ingredients: [ing("Potatoes", 500, "g", "4 medium"), ing("Chicken", 400, "g", "4 pieces"), frying(), ...tomOn(1), ing("Salt", null, "to_taste")],
    instructions: [
      "Boil the chicken in salted water for 20 minutes until almost cooked, then drain and pat dry.",
      "Fry the chicken in hot oil for 8 to 10 minutes until golden and crisp. Remove.",
      "Peel and cut the potatoes into sticks, dry them well and fry in the same oil in batches for 8 minutes until golden.",
      "Make kachumbari with the chopped tomato, onion and salt.",
      "Serve the chicken and chips with kachumbari and tomato sauce.",
    ],
  }),
  mk({
    id: "chips-masala", name: "Chips Masala", swahili_name: "Chips Masala",
    description: "Crisp chips tossed in a spicy tomato masala sauce.",
    category: "Potatoes", meal_type: "Snack", prep_time_minutes: 15, cook_time_minutes: 30, servings: 2,
    cost_min_kes: 150, cost_max_kes: 210, audience: ST, region: "Coast",
    ingredients: [ing("Potatoes", 500, "g", "4 medium"), frying(), ing("Tomato", 2, "piece"), ing("Onion", 1, "piece"), ing("Garlic", 2, "clove"), ing("Chili powder", 1, "tsp"), ing("Dhania", 1, "bunch", "a small handful", true), salt()],
    instructions: [
      "Peel the potatoes, cut into sticks, dry well and fry in hot oil for 8 to 10 minutes until golden. Drain.",
      "In a pan with 2 tbsp of the oil fry the chopped onion and garlic until soft.",
      "Add the chopped tomatoes, chili powder and salt and cook 6 minutes into a thick sauce.",
      "Toss the chips in the sauce for 1 minute and sprinkle with dhania.",
    ],
  }),
  mk({
    id: "viazi-na-mayai", name: "Potato & Egg Stew", swahili_name: "Viazi na Mayai",
    description: "Potatoes simmered in tomato sauce with boiled eggs.",
    category: "Potatoes", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 30, servings: 3,
    cost_min_kes: 115, cost_max_kes: 160, audience: CF, one_pot: true, tags: ["One-pot", "Bachelor-friendly"],
    ingredients: [ing("Potatoes", 500, "g", "4 medium"), ing("Eggs", 3, "piece"), ...tomOn(2), oil(2), salt()],
    instructions: [
      "Boil the eggs for 10 minutes, cool and peel. Peel the potatoes and cut into chunks.",
      "Heat the oil and fry the chopped onion until golden, then add the tomatoes and cook until saucy.",
      "Add the potatoes, salt and 1 1/2 cups water. Cover and simmer 15 minutes until soft.",
      "Add the eggs and simmer 3 more minutes. Serve with ugali or rice.",
    ],
  }),
  mk({
    id: "viazi-vilivyopondwa", name: "Mashed Potatoes & Stew", swahili_name: "Viazi Vilivyopondwa na Nyama",
    description: "Creamy mashed potatoes with a simple beef stew.",
    category: "Potatoes", meal_type: "Dinner", prep_time_minutes: 15, cook_time_minutes: 50, servings: 2,
    cost_min_kes: 220, cost_max_kes: 290, audience: FT, needs_fridge: true,
    ingredients: [ing("Potatoes", 500, "g", "4 medium"), ing("Beef", 250, "g"), ...tomOn(2), oil(2), ing("Milk", 0.25, "cup", "1/4 cup"), salt()],
    instructions: [
      "Boil the beef cubes in 2 cups water with salt for 30 to 40 minutes until tender.",
      "Fry the chopped onion in the oil, add the tomatoes and cook until saucy. Add the beef with its stock and simmer 10 minutes.",
      "Boil the peeled potatoes in salted water for 20 minutes until soft and drain.",
      "Mash with the warm milk and a little salt until smooth.",
      "Serve the mash with the stew on top.",
    ],
  }),
  mk({
    id: "muhogo-wa-kukaanga", name: "Fried Cassava", swahili_name: "Muhogo wa Kukaanga",
    description: "Cassava boiled then fried crisp, with chilli and lemon.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 15, cook_time_minutes: 40, servings: 2,
    cost_min_kes: 100, cost_max_kes: 150, audience: ST, region: "Coast",
    ingredients: [ing("Cassava", 500, "g"), frying(), ing("Chili powder", 0.5, "tsp", "1/2 tsp"), ing("Lemon", 1, "piece"), salt()],
    instructions: [
      "Peel the cassava, remove the woody centre and cut into thick sticks.",
      "Boil in salted water for 15 to 20 minutes until just tender, then drain and dry well.",
      "Fry in hot oil for 6 to 8 minutes until golden and crisp.",
      "Sprinkle with salt, chili powder and lemon juice and serve hot.",
    ],
  }),
  mk({
    id: "nduma", name: "Boiled Arrowroots", swahili_name: "Nduma",
    description: "Boiled arrowroots with a pinch of salt. Eat with tea or kachumbari.",
    category: "Potatoes", meal_type: "Breakfast", prep_time_minutes: 5, cook_time_minutes: 40, servings: 2,
    cost_min_kes: 45, cost_max_kes: 80, audience: CFT, one_pot: true, tags: ["One-pot", "Bachelor-friendly"],
    ingredients: [ing("Arrow roots", 500, "g"), ing("Water", 4, "cup"), ing("Salt", 0.5, "tsp", "1/2 tsp")],
    instructions: [
      "Wash the arrowroots and boil in salted water with the skins on for 30 to 40 minutes until a fork goes in easily.",
      "Drain, let them cool a few minutes and peel.",
      "Serve with tea, kachumbari or a stew.",
    ],
  }),
  mk({
    id: "viazi-vitamu", name: "Sweet Potatoes & Chai", swahili_name: "Viazi Vitamu na Chai",
    description: "Boiled sweet potatoes with a cup of hot chai. A cheap, filling breakfast.",
    category: "Breakfast", meal_type: "Breakfast", prep_time_minutes: 5, cook_time_minutes: 30, servings: 2,
    cost_min_kes: 60, cost_max_kes: 90, audience: CFT, one_pot: false, tags: ["Bachelor-friendly"],
    ingredients: [ing("Sweet potatoes", 500, "g"), ing("Water", 4, "cup"), ing("Tea leaves", 2, "tsp"), ing("Milk", 1, "cup"), ing("Sugar", 2, "tsp")],
    instructions: [
      "Wash the sweet potatoes and boil in water for 20 to 25 minutes until soft.",
      "While they boil, make the chai: bring 1 cup water and the milk to the boil, add the tea leaves and simmer 3 minutes. Add sugar and strain.",
      "Peel the sweet potatoes if you like and serve with the chai.",
    ],
  }),
  mk({
    id: "ndizi-kaanga", name: "Fried Ripe Bananas", swahili_name: "Ndizi Kaanga",
    description: "Ripe bananas fried until caramelised. Sweet, simple, 10 minutes.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 3, cook_time_minutes: 8, servings: 2,
    cost_min_kes: 90, cost_max_kes: 150, audience: CF, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Ripe bananas", 3, "piece"), oil(3), ing("Sugar", 1, "tsp", undefined, true)],
    instructions: [
      "Peel the bananas and cut in half lengthways or into thick slices.",
      "Heat the oil on medium heat.",
      "Fry the bananas 2 to 3 minutes per side until golden brown. Sprinkle with sugar if you like and serve warm.",
    ],
  }),
  mk({
    id: "matoke-nyama", name: "Matoke & Beef", swahili_name: "Matoke na Nyama",
    description: "Green bananas and beef stewed together in one pot.",
    category: "Main Dish", meal_type: "Dinner", prep_time_minutes: 20, cook_time_minutes: 60, servings: 3,
    cost_min_kes: 265, cost_max_kes: 355, audience: FT, region: "Central", one_pot: true, needs_fridge: true, tags: ["One-pot"],
    ingredients: [ing("Matoke", 6, "piece", "6 green bananas"), ing("Beef", 300, "g"), ...tomOn(2), oil(2), salt()],
    instructions: [
      "Boil the beef cubes in 2 cups water with salt for 30 to 40 minutes until almost tender.",
      "Heat the oil in a big sufuria and fry the chopped onion, then the tomatoes until saucy.",
      "Add the beef with its stock and the peeled matoke cut into chunks.",
      "Cover and simmer 25 minutes until the matoke is soft. Serve hot.",
    ],
  }),

  // ---------- Eggs and quick ----------
  mk({
    id: "mayai-fry", name: "Fried Eggs", swahili_name: "Mayai Fry",
    description: "Eggs fried with onion and tomato in 5 minutes.",
    category: "Eggs", meal_type: "Breakfast", prep_time_minutes: 3, cook_time_minutes: 5, servings: 1,
    cost_min_kes: 70, cost_max_kes: 95, audience: CS, one_pot: true, tags: ["One-pot", "Quick", "Bachelor-friendly"],
    ingredients: [ing("Eggs", 3, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 1, "piece"), oil(1), salt()],
    instructions: [
      "Heat the oil and fry the chopped onion until soft. Add the chopped tomato for 1 minute.",
      "Crack the eggs into the pan, add salt and cook until the whites are set.",
      "Serve with bread, chapati or ugali.",
    ],
  }),
  mk({
    id: "mayai-nyanya", name: "Egg & Tomato Stew", swahili_name: "Mayai na Nyanya",
    description: "Eggs poached in a spicy tomato sauce. Cheap, quick and full of protein.",
    category: "Eggs", meal_type: "Dinner", prep_time_minutes: 5, cook_time_minutes: 15, servings: 2,
    cost_min_kes: 125, cost_max_kes: 160, audience: CF, one_pot: true, tags: ["One-pot", "Quick", "Bachelor-friendly"],
    ingredients: [ing("Eggs", 4, "piece"), ing("Tomato", 4, "piece"), ing("Onion", 1, "piece"), oil(2), ing("Chili", 1, "piece", undefined, true), salt()],
    instructions: [
      "Heat the oil and fry the chopped onion (and chili) until soft.",
      "Add the chopped tomatoes and salt and cook 8 minutes until it becomes a thick sauce.",
      "Make 4 hollows in the sauce and crack an egg into each.",
      "Cover and cook on low heat 4 to 5 minutes until the whites are set. Serve with bread, chapati or ugali.",
    ],
  }),
  mk({
    id: "omelette", name: "Omelette", swahili_name: "Omeleti",
    description: "A soft omelette with onion, tomato and dhania.",
    category: "Eggs", meal_type: "Breakfast", prep_time_minutes: 4, cook_time_minutes: 5, servings: 1,
    cost_min_kes: 75, cost_max_kes: 100, audience: CS, one_pot: true, tags: ["One-pot", "Quick", "Bachelor-friendly"],
    ingredients: [ing("Eggs", 3, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 0.5, "piece", "1/2"), ing("Dhania", 1, "bunch", "a few leaves", true), oil(1), salt()],
    instructions: [
      "Beat the eggs with salt, the finely chopped onion, tomato and dhania.",
      "Heat the oil in a pan and pour in the mixture.",
      "Cook on medium heat 2 to 3 minutes until set, then fold or flip and cook 1 minute more.",
    ],
  }),
  mk({
    id: "egg-sandwich", name: "Egg Sandwich", swahili_name: "Sandwich ya Mayai",
    description: "Boiled egg, tomato and onion between slices of bread. Good for taking along.",
    category: "Quick Meals", meal_type: "Snack", prep_time_minutes: 5, cook_time_minutes: 10, servings: 2,
    cost_min_kes: 70, cost_max_kes: 105, audience: CS, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Bread", 4, "piece", "4 slices"), ing("Eggs", 2, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 0.5, "piece", "1/2"), ing("Mayonnaise", 1, "tbsp", undefined, true), salt()],
    instructions: [
      "Boil the eggs for 10 minutes, cool and peel.",
      "Mash the eggs with salt, the finely chopped onion and mayonnaise if using.",
      "Spread on 2 slices, add tomato slices and cover with the other slices.",
    ],
  }),
  mk({
    id: "smokie-pasua", name: "Smokie Pasua", swahili_name: "Smokie Pasua",
    description: "Smokie split open and stuffed with kachumbari. Nairobi street food.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 5, cook_time_minutes: 8, servings: 1,
    cost_min_kes: 90, cost_max_kes: 140, audience: CS, region: "Nairobi", tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Smokie", 2, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 0.5, "piece", "1/2"), ing("Dhania", 1, "bunch", "a few leaves", true), ing("Chili sauce", 1, "tbsp", undefined, true), salt()],
    instructions: [
      "Warm the smokies in a pan or on the jiko for 5 to 8 minutes until hot and lightly browned.",
      "Chop the tomato, onion and dhania finely and mix with salt.",
      "Split the smokies lengthways, stuff with the kachumbari and top with chili sauce.",
    ],
  }),
  mk({
    id: "bread-eggs", name: "Bread & Eggs", swahili_name: "Mkate na Mayai",
    description: "Bread dipped in seasoned egg and fried golden. Cheap and quick.",
    category: "Eggs", meal_type: "Breakfast", prep_time_minutes: 5, cook_time_minutes: 10, servings: 2,
    cost_min_kes: 95, cost_max_kes: 125, audience: CS, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Bread", 4, "piece", "4 slices"), ing("Eggs", 3, "piece"), ing("Onion", 0.5, "piece", "1/2"), ing("Tomato", 1, "piece"), oil(2), salt()],
    instructions: [
      "Beat the eggs with salt, the chopped onion and tomato.",
      "Dip each bread slice in the egg mixture until soaked.",
      "Fry in hot oil 2 to 3 minutes per side until golden. Serve with chai.",
    ],
  }),

  // ---------- Pasta and noodles ----------
  mk({
    id: "spaghetti-nyanya", name: "Spaghetti & Tomato", swahili_name: "Spaghetti na Nyanya",
    description: "Spaghetti in a simple fresh tomato and onion sauce.",
    category: "Pasta", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 110, cost_max_kes: 150, audience: CF, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Spaghetti", 250, "g"), ing("Tomato", 3, "piece"), ing("Onion", 1, "piece"), ing("Garlic", 2, "clove", undefined, true), oil(2), salt()],
    instructions: [
      "Boil the spaghetti in salted water for 8 to 10 minutes and drain.",
      "Heat the oil and fry the chopped onion (and garlic) until soft.",
      "Add the chopped tomatoes and salt and cook 8 minutes into a thick sauce.",
      "Mix the spaghetti into the sauce and serve.",
    ],
  }),
  mk({
    id: "spaghetti-mayai", name: "Spaghetti & Eggs", swahili_name: "Spaghetti na Mayai",
    description: "Spaghetti tossed with scrambled eggs, onion and tomato.",
    category: "Pasta", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 18, servings: 2,
    cost_min_kes: 110, cost_max_kes: 150, audience: CS, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Spaghetti", 250, "g"), ing("Eggs", 2, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 1, "piece"), oil(2), salt()],
    instructions: [
      "Boil the spaghetti in salted water for 8 to 10 minutes and drain.",
      "Fry the chopped onion and tomato in the oil for 4 minutes.",
      "Push to one side, scramble the beaten eggs in the pan, then mix everything with the spaghetti.",
      "Season with salt and serve hot.",
    ],
  }),
  mk({
    id: "macaroni-mince", name: "Macaroni & Mince", swahili_name: "Macaroni na Nyama ya Kusaga",
    description: "Macaroni in a savory minced beef and tomato sauce.",
    category: "Pasta", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 30, servings: 3,
    cost_min_kes: 195, cost_max_kes: 260, audience: CF, needs_fridge: true,
    ingredients: [ing("Macaroni", 250, "g"), ing("Beef mince", 200, "g"), ...tomOn(2), ing("Garlic", 2, "clove", undefined, true), oil(2), salt()],
    instructions: [
      "Boil the macaroni in salted water for 8 to 10 minutes and drain.",
      "Fry the chopped onion (and garlic) in the oil, then add the mince and cook 8 minutes until browned.",
      "Add the chopped tomatoes and salt and simmer 8 minutes.",
      "Mix in the macaroni and cook 2 more minutes.",
    ],
  }),
  mk({
    id: "indomie-mayai", name: "Indomie & Egg", swahili_name: "Indomie na Yai",
    description: "Instant noodles upgraded with an egg and fresh vegetables. Ready in 8 minutes.",
    category: "Pasta", meal_type: "Dinner", prep_time_minutes: 3, cook_time_minutes: 8, servings: 2,
    cost_min_kes: 90, cost_max_kes: 130, audience: CS, one_pot: true, tags: ["One-pot", "Quick", "Bachelor-friendly"],
    ingredients: [ing("Noodles", 2, "piece", "2 packets"), ing("Eggs", 2, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 0.5, "piece", "1/2")],
    instructions: [
      "Boil the noodles in water for 2 minutes, then drain most of the water.",
      "Add the seasoning from the packets, the chopped onion and tomato.",
      "Crack in the eggs and stir on low heat for 2 to 3 minutes until set. Serve hot.",
    ],
  }),

  // ---------- Breakfast ----------
  mk({
    id: "uji-wa-mahindi", name: "Maize Uji", swahili_name: "Uji wa Mahindi",
    description: "Smooth maize porridge with sugar and lemon. The cheapest breakfast there is.",
    category: "Breakfast", meal_type: "Breakfast", prep_time_minutes: 3, cook_time_minutes: 15, servings: 2,
    cost_min_kes: 20, cost_max_kes: 40, audience: CFT, one_pot: true, tags: ["One-pot", "Bachelor-friendly", "Quick"],
    ingredients: [ing("Maize flour", 0.5, "cup", "1/2 cup"), ing("Water", 3, "cup"), ing("Sugar", 2, "tbsp"), ing("Lemon", 0.5, "piece", "1/2", true)],
    instructions: [
      "Mix the flour with 1 cup cold water into a smooth paste.",
      "Boil the remaining 2 cups water, then pour in the paste while stirring.",
      "Cook on low heat 10 to 15 minutes, stirring often, until thick and smooth.",
      "Add sugar and lemon juice and serve hot.",
    ],
  }),
  mk({
    id: "chapati-chai", name: "Chapati & Chai", swahili_name: "Chapati na Chai",
    description: "Two warm chapati and a cup of milky chai. A proper Kenyan breakfast.",
    category: "Breakfast", meal_type: "Breakfast", prep_time_minutes: 3, cook_time_minutes: 10, servings: 1,
    cost_min_kes: 55, cost_max_kes: 90, audience: CFT, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Chapati", 2, "piece"), ing("Water", 0.5, "cup", "1/2 cup"), ing("Milk", 0.5, "cup", "1/2 cup"), ing("Tea leaves", 1, "tsp"), ing("Sugar", 1, "tsp")],
    instructions: [
      "Bring the water and milk to the boil, add the tea leaves and simmer 3 minutes.",
      "Add sugar and strain into a cup.",
      "Warm the chapati on a pan and serve with the chai.",
    ],
  }),
  mk({
    id: "mkate-wa-mayai", name: "Mkate wa Mayai", swahili_name: "Mkate wa Mayai",
    description: "Thin dough wrapped around spiced mince and egg, then pan-fried. A Swahili street favourite.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 40, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 130, cost_max_kes: 180, audience: ST, region: "Coast", difficulty: "Medium", needs_fridge: true,
    ingredients: [ing("Wheat flour", 1, "cup"), ing("Beef mince", 100, "g"), ing("Eggs", 2, "piece"), ing("Onion", 1, "piece"), ing("Curry powder", 0.5, "tsp", "1/2 tsp"), oil(4), salt()],
    instructions: [
      "Make a soft dough from the flour, a pinch of salt, 1 tbsp oil and water. Rest 20 minutes, then divide into 2 balls.",
      "Fry the chopped onion and mince with the curry powder and salt for 8 minutes until dry. Cool, then mix in the beaten eggs.",
      "Roll each ball very thin into a square. Put half the filling in the middle and fold the edges over to make a parcel.",
      "Fry the parcels in the remaining oil for 3 to 4 minutes per side until golden and the egg is cooked. Cut and serve with chili sauce.",
    ],
  }),

  // ---------- Street and choma ----------
  mk({
    id: "mutura", name: "Mutura", swahili_name: "Mutura",
    description: "Kenyan sausage of stuffed intestine and minced meat, boiled then grilled.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 60, cook_time_minutes: 60, servings: 4,
    cost_min_kes: 300, cost_max_kes: 450, audience: ["street", "traditional"], difficulty: "Medium", needs_fridge: true,
    ingredients: [ing("Goat intestines", 500, "g"), ing("Beef mince", 250, "g"), ing("Onion", 2, "piece"), ing("Garlic", 3, "clove"), ing("Cooking oil", 2, "tbsp"), ing("Black pepper", 1, "tsp"), salt()],
    instructions: [
      "Wash the intestines very thoroughly inside and out with salt and lemon or vinegar, in several changes of water.",
      "Mix the mince with chopped onion, garlic, pepper and salt, then fry 5 minutes.",
      "Stuff the intestines loosely with the mixture and tie both ends.",
      "Boil in salted water for 40 minutes, then grill on charcoal 10 to 15 minutes until browned.",
      "Slice and serve with kachumbari.",
    ],
  }),
  mk({
    id: "mishkaki", name: "Mishkaki", swahili_name: "Mishkaki",
    description: "Marinated beef cubes on skewers, grilled over charcoal.",
    category: "Snack", meal_type: "Dinner", prep_time_minutes: 90, cook_time_minutes: 20, servings: 3,
    cost_min_kes: 270, cost_max_kes: 360, audience: ST, region: "Coast", needs_fridge: true,
    ingredients: [ing("Beef", 400, "g"), ing("Garlic", 4, "clove"), ing("Lemon", 1, "piece"), ing("Pilau masala", 1, "tsp"), oil(2), salt()],
    instructions: [
      "Cut the beef into 3 cm cubes. Mix with crushed garlic, lemon juice, pilau masala, oil and salt. Marinate at least 1 hour.",
      "Thread the cubes onto skewers.",
      "Grill over hot charcoal for 12 to 15 minutes, turning often, until browned and cooked through.",
      "Serve with kachumbari or chapati.",
    ],
  }),
  mk({
    id: "mahindi-choma", name: "Roast Maize", swahili_name: "Mahindi Choma",
    description: "Maize cobs roasted over charcoal and rubbed with lemon, salt and chili.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 5, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 100, cost_max_kes: 170, audience: ST, tags: ["Quick"],
    ingredients: [ing("Maize cobs", 4, "piece"), ing("Lemon", 1, "piece"), ing("Chili powder", 0.5, "tsp", "1/2 tsp"), ing("Salt", 0.5, "tsp", "1/2 tsp")],
    instructions: [
      "Remove the husks and silk from the maize.",
      "Roast over hot charcoal for 15 to 20 minutes, turning often, until golden with charred spots.",
      "Mix the salt and chili powder, dip half a lemon in it and rub it over the hot cobs.",
    ],
  }),
  mk({
    id: "mahindi-ya-kuchemsha", name: "Boiled Maize", swahili_name: "Mahindi ya Kuchemsha",
    description: "Cobs boiled in salted water until sweet and tender.",
    category: "Snack", meal_type: "Snack", prep_time_minutes: 5, cook_time_minutes: 30, servings: 2,
    cost_min_kes: 80, cost_max_kes: 150, audience: CFT, one_pot: true, tags: ["One-pot", "Bachelor-friendly"],
    ingredients: [ing("Maize cobs", 4, "piece"), ing("Water", 6, "cup"), ing("Salt", 1, "tsp")],
    instructions: [
      "Remove the husks and silk from the maize.",
      "Boil in the salted water for 20 to 30 minutes until the kernels are tender.",
      "Drain and serve hot, with salt or a squeeze of lemon.",
    ],
  }),
  mk({
    id: "fish-fry", name: "Fish Fry", swahili_name: "Samaki wa Kukaanga",
    description: "Whole tilapia fried crisp, with lemon and kachumbari.",
    category: "Seafood", meal_type: "Dinner", prep_time_minutes: 15, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 195, cost_max_kes: 285, audience: ST, needs_fridge: true, tags: ["Protein-rich"],
    ingredients: [ing("Tilapia", 1, "piece", "1 medium fish"), oil(4), ing("Lemon", 1, "piece"), ing("Tomato", 1, "piece"), ing("Onion", 0.5, "piece", "1/2"), salt()],
    instructions: [
      "Clean the fish, make 2 to 3 slits on each side and rub with salt and lemon juice. Rest 10 minutes.",
      "Pat dry and fry in hot oil for 7 to 8 minutes on each side until golden and crisp.",
      "Make kachumbari with the chopped tomato and onion.",
      "Serve the fish with kachumbari, ugali or chips.",
    ],
  }),

  // ---------- Proteins ----------
  mk({
    id: "mince-stew", name: "Mince Stew", swahili_name: "Nyama ya Kusaga",
    description: "Minced beef simmered with potato and tomato. Quick and goes with anything.",
    category: "Beef", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 30, servings: 3,
    cost_min_kes: 190, cost_max_kes: 250, audience: CF, needs_fridge: true, tags: ["Quick"],
    ingredients: [ing("Beef mince", 250, "g"), ing("Potatoes", 1, "piece"), ...tomOn(2), ing("Garlic", 2, "clove", undefined, true), oil(2), salt()],
    instructions: [
      "Heat the oil and fry the chopped onion (and garlic) until golden.",
      "Add the mince and cook 8 minutes, breaking up lumps, until browned.",
      "Add the chopped tomatoes, diced potato, salt and 1 cup water.",
      "Cover and simmer 15 minutes until the potato is soft. Serve with ugali, rice or chapati.",
    ],
  }),
  mk({
    id: "samaki-wa-kupaka", name: "Samaki wa Kupaka", swahili_name: "Samaki wa Kupaka",
    description: "Coastal fried fish coated in a spicy coconut sauce.",
    category: "Seafood", meal_type: "Lunch", prep_time_minutes: 20, cook_time_minutes: 25, servings: 2,
    cost_min_kes: 245, cost_max_kes: 350, audience: FT, region: "Coast", difficulty: "Medium", needs_fridge: true,
    ingredients: [ing("Tilapia", 1, "piece", "1 medium fish"), ing("Coconut milk", 0.5, "cup", "1/2 cup"), ing("Tomato", 1, "piece"), ing("Chili powder", 1, "tsp"), ing("Turmeric", 0.5, "tsp", "1/2 tsp"), ing("Lemon", 1, "piece"), oil(4), salt()],
    instructions: [
      "Clean the fish, slit both sides and rub with salt, turmeric and lemon juice. Rest 15 minutes.",
      "Fry in hot oil 6 to 7 minutes per side until golden. Remove.",
      "In a clean pan combine the coconut milk, grated tomato, chili powder and salt. Simmer 8 minutes until thick.",
      "Coat the fish in the sauce, simmer 2 minutes, and serve with rice or chapati.",
    ],
  }),
  mk({
    id: "mbuzi-stew", name: "Goat Stew", swahili_name: "Mchuzi wa Mbuzi",
    description: "Goat meat slow-cooked until tender in a rich onion and tomato gravy.",
    category: "Meat", meal_type: "Dinner", prep_time_minutes: 15, cook_time_minutes: 100, servings: 4,
    cost_min_kes: 360, cost_max_kes: 470, audience: FT, needs_fridge: true, tags: ["Weekend"],
    ingredients: [ing("Goat meat", 500, "g"), ing("Onion", 2, "piece"), ing("Tomato", 2, "piece"), ing("Garlic", 3, "clove"), oil(3), salt()],
    instructions: [
      "Wash the goat meat and boil in 3 cups water with salt for 60 to 80 minutes until tender (a pressure cooker takes about 30).",
      "Fry the sliced onions and garlic in the oil until golden.",
      "Add the chopped tomatoes and cook until saucy.",
      "Add the meat with its stock and simmer 15 minutes until the gravy is thick. Serve with ugali or chapati.",
    ],
  }),
  mk({
    id: "sausage-fry", name: "Sausage Fry", swahili_name: "Soseji ya Kukaanga",
    description: "Sausages fried with onion and tomato. Ready in 15 minutes.",
    category: "Quick Meals", meal_type: "Dinner", prep_time_minutes: 5, cook_time_minutes: 15, servings: 2,
    cost_min_kes: 180, cost_max_kes: 270, audience: CS, needs_fridge: true, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Sausage", 3, "piece"), ...tomOn(1), oil(2), salt()],
    instructions: [
      "Slice the sausages.",
      "Heat the oil and fry the sausages for 5 minutes until browned.",
      "Add the chopped onion and tomato and cook 5 more minutes. Serve with ugali, bread or chips.",
    ],
  }),

  // ---------- Veg and sides ----------
  mk({
    id: "sukuma-wiki", name: "Sukuma Wiki", swahili_name: "Sukuma Wiki",
    description: "The everyday greens with tomato and onion. Goes with everything.",
    category: "Side Dish", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 12, servings: 2,
    cost_min_kes: 60, cost_max_kes: 100, audience: CFT, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Sukuma wiki", 1, "bunch"), ...tomOn(2), oil(2), salt()],
    instructions: [
      "Wash the sukuma, remove the thick stems and slice thinly.",
      "Heat the oil and fry the onion until golden, then the tomatoes until saucy.",
      "Add the sukuma and salt, cover and cook 5 to 7 minutes. Keep it green.",
    ],
  }),
  mk({
    id: "cabbage-fry", name: "Fried Cabbage", swahili_name: "Kabichi ya Kukaanga",
    description: "Crisp-tender cabbage with carrot, tomato and onion.",
    category: "Side Dish", meal_type: "Dinner", prep_time_minutes: 8, cook_time_minutes: 12, servings: 3,
    cost_min_kes: 55, cost_max_kes: 95, audience: CFT, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Cabbage", 0.5, "head", "1/2 head"), ing("Carrot", 1, "piece"), ...tomOn(1), oil(2), salt()],
    instructions: [
      "Shred the cabbage finely and grate the carrot.",
      "Fry the onion in the oil until soft, then add the chopped tomato.",
      "Add the cabbage, carrot and salt and cook uncovered 5 to 6 minutes. It should stay a little crunchy.",
    ],
  }),
  mk({
    id: "saget", name: "Saget", swahili_name: "Saget",
    description: "Spider plant leaves cooked with milk, a Rift Valley and Western favourite.",
    category: "Side Dish", meal_type: "Dinner", prep_time_minutes: 10, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 70, cost_max_kes: 110, audience: FT, region: "Rift Valley", tags: ["Bachelor-friendly"],
    ingredients: [ing("Saget", 1, "bunch"), ...tomOn(1), oil(2), ing("Milk", 0.25, "cup", "1/4 cup", true), salt()],
    instructions: [
      "Pick and wash the leaves. Boil 5 minutes and drain to reduce the bitterness, then chop.",
      "Fry the onion in the oil until golden, then add the tomato until saucy.",
      "Add the saget and salt and cook covered 8 minutes. Stir in the milk if using. Serve with ugali.",
    ],
  }),
  mk({
    id: "pilipili-sauce", name: "Pilipili Sauce", swahili_name: "Pilipili ya Kukaanga",
    description: "A fresh chilli and tomato sauce for chips, nyama choma and mandazi.",
    category: "Side Dish", meal_type: "Snack", prep_time_minutes: 10, cook_time_minutes: 10, servings: 6,
    cost_min_kes: 70, cost_max_kes: 110, audience: ["family", "street"], tags: ["Quick"],
    ingredients: [ing("Chili", 5, "piece"), ing("Tomato", 3, "piece"), ing("Onion", 1, "piece"), ing("Garlic", 2, "clove"), ing("Lemon", 1, "piece"), oil(1), salt()],
    instructions: [
      "Chop the chilies, tomatoes, onion and garlic.",
      "Heat the oil and cook everything with salt for 8 minutes until soft and thick.",
      "Blend or mash, add lemon juice and cool. Keeps 3 days in the fridge.",
    ],
  }),

  // ---------- Modern but simple ----------
  mk({
    id: "beef-burger", name: "Beef Burger", swahili_name: "Burger ya Nyama",
    description: "Home-style burger with a juicy mince patty. Cheaper and better than takeaway.",
    category: "Quick Meals", meal_type: "Dinner", prep_time_minutes: 15, cook_time_minutes: 15, servings: 2,
    cost_min_kes: 220, cost_max_kes: 300, audience: CS, needs_fridge: true,
    ingredients: [ing("Burger buns", 2, "piece"), ing("Beef mince", 200, "g"), ing("Egg", 1, "piece"), ing("Onion", 1, "piece"), ing("Tomato", 1, "piece"), ing("Cabbage", 50, "g", "a handful"), oil(1), salt()],
    instructions: [
      "Mix the mince with half the grated onion, the egg and salt. Shape into 2 patties.",
      "Fry in the oil for 5 to 6 minutes per side until cooked through.",
      "Toast the buns lightly on a dry pan.",
      "Fill each bun with a patty, sliced tomato, onion rings, shredded cabbage and a squeeze of tomato sauce.",
    ],
  }),
  mk({
    id: "chicken-shawarma", name: "Chicken Shawarma", swahili_name: "Shawarma ya Kuku",
    description: "Spiced chicken wrapped in chapati with cabbage and garlic sauce.",
    category: "Quick Meals", meal_type: "Dinner", prep_time_minutes: 20, cook_time_minutes: 20, servings: 2,
    cost_min_kes: 220, cost_max_kes: 310, audience: CS, difficulty: "Medium", needs_fridge: true,
    ingredients: [ing("Chicken breast", 300, "g"), ing("Chapati", 2, "piece"), ing("Cabbage", 50, "g", "a handful"), ing("Garlic", 2, "clove"), ing("Lemon", 1, "piece"), ing("Curry powder", 1, "tsp"), ing("Mayonnaise", 2, "tbsp"), oil(2), salt()],
    instructions: [
      "Slice the chicken thinly and marinate with 1 crushed garlic clove, curry powder, lemon juice and salt for 15 minutes.",
      "Fry the chicken in the oil for 8 to 10 minutes until cooked and browned.",
      "Mix the mayonnaise with the other crushed garlic clove and a little lemon juice.",
      "Spread the sauce on the warm chapati, add shredded cabbage and chicken, roll tightly and toast the roll lightly on a pan.",
    ],
  }),
  mk({
    id: "home-pizza", name: "Home Pizza", swahili_name: "Pizza ya Nyumbani",
    description: "Pizza cooked in a frying pan with no oven needed.",
    category: "Quick Meals", meal_type: "Dinner", prep_time_minutes: 90, cook_time_minutes: 25, servings: 3,
    cost_min_kes: 280, cost_max_kes: 380, audience: ["family", "comrade"], difficulty: "Medium", needs_fridge: true,
    ingredients: [ing("Wheat flour", 2, "cup"), ing("Yeast", 1, "tsp"), ing("Tomato", 2, "piece"), ing("Onion", 1, "piece"), ing("Green pepper", 1, "piece"), ing("Cheese", 100, "g"), oil(2), salt()],
    instructions: [
      "Mix the flour, yeast, salt, 1 tbsp oil and about 1/2 cup warm water into a soft dough. Knead 5 minutes and rest 1 hour.",
      "Cook the chopped tomatoes with a pinch of salt for 8 minutes into a thick sauce.",
      "Roll the dough into a thin circle and cook on a lightly oiled pan on low heat, covered, for 4 minutes until the bottom is golden.",
      "Flip, spread with the sauce, and top with sliced onion, green pepper and grated cheese.",
      "Cover and cook on low heat 6 to 8 minutes until the cheese melts and the base is crisp.",
    ],
  }),
  mk({
    id: "fruit-salad", name: "Fruit Salad", swahili_name: "Saladi ya Matunda",
    description: "Fresh mango, banana and orange with a squeeze of lemon.",
    category: "Dessert", meal_type: "Snack", prep_time_minutes: 10, cook_time_minutes: 0, servings: 3,
    cost_min_kes: 110, cost_max_kes: 190, audience: CF, tags: ["Quick"],
    ingredients: [ing("Mango", 1, "piece"), ing("Ripe bananas", 2, "piece"), ing("Orange", 2, "piece"), ing("Lemon", 0.5, "piece", "1/2", true)],
    instructions: [
      "Peel the mango, bananas and oranges and cut into bite-size pieces.",
      "Mix in a bowl with the orange juice that runs out.",
      "Add a squeeze of lemon (keeps the bananas from browning) and serve chilled if you can.",
    ],
  }),
  mk({
    id: "embe-smoothie", name: "Mango Smoothie", swahili_name: "Smoothie ya Embe",
    description: "Thick and creamy mango smoothie with milk.",
    category: "Beverage", meal_type: "Snack", prep_time_minutes: 5, cook_time_minutes: 0, servings: 2,
    cost_min_kes: 100, cost_max_kes: 165, audience: CF, tags: ["Quick"],
    ingredients: [ing("Mango", 2, "piece"), ing("Milk", 1, "cup"), ing("Sugar", 1, "tsp", undefined, true)],
    instructions: [
      "Peel the mangoes and cut the flesh from the seed.",
      "Blend with the cold milk (and sugar if the mango is not very sweet) until smooth.",
      "Serve immediately.",
    ],
  }),
  mk({
    id: "ndizi-smoothie", name: "Banana Smoothie", swahili_name: "Smoothie ya Ndizi",
    description: "Cheap, filling banana and milk smoothie. Good for breakfast on the go.",
    category: "Beverage", meal_type: "Breakfast", prep_time_minutes: 5, cook_time_minutes: 0, servings: 2,
    cost_min_kes: 80, cost_max_kes: 150, audience: CF, tags: ["Quick", "Bachelor-friendly"],
    ingredients: [ing("Ripe bananas", 3, "piece"), ing("Milk", 1, "cup"), ing("Sugar", 1, "tsp", undefined, true)],
    instructions: [
      "Peel the bananas and break them into pieces.",
      "Blend with the cold milk (and sugar if you like) until smooth.",
      "Serve immediately.",
    ],
  }),
  mk({
    id: "passion-juice", name: "Passion Juice", swahili_name: "Juisi ya Pasheni",
    description: "Fresh, tangy passion fruit juice. Sweet, cold and cheap.",
    category: "Beverage", meal_type: "Snack", prep_time_minutes: 10, cook_time_minutes: 0, servings: 3,
    cost_min_kes: 50, cost_max_kes: 100, audience: CFT, tags: ["Quick"],
    ingredients: [ing("Passion fruit", 6, "piece"), ing("Sugar", 4, "tbsp"), ing("Water", 3, "cup")],
    instructions: [
      "Scoop the pulp from the passion fruits into a jug.",
      "Add the sugar and water and stir until the sugar dissolves.",
      "Strain out the seeds if you like and serve cold.",
    ],
  }),
];