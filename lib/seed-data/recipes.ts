// lib/seed-data/recipes.ts
// COMPLETE - All 71 Recipes with Unsplash Images

// Helper function for Unsplash images
const unsplash = (id: string) => 
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export interface SeedRecipe {
  id: string;
  name: string;
  description: string;
  category: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  difficulty: "Easy" | "Medium";
  total_time_minutes: number;
  cost_min_kes: number;
  cost_max_kes: number;
  servings: number;
  image_url: string | null;
  image_alt: string | null;
  dietary_tags: string[];
  tags: string[];
  ingredients: { name: string; amount: string }[];
  instructions: string[];
}

export const recipes: SeedRecipe[] = [
  // ==================== TRADITIONAL KENYAN (15) ====================
  {
    id: "ugali-sukuma-wiki",
    name: "Ugali & Sukuma Wiki",
    description: "The dependable Kenyan classic: firm ugali with garlicky, tender sukuma wiki greens.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 70,
    cost_max_kes: 130,
    servings: 4,
    image_url: unsplash("1547592180-85f173990554"),
    image_alt: "Ugali served with sukuma wiki greens",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["staple", "traditional", "one-pot", "budget-friendly"],
    ingredients: [
      { name: "Maize flour", amount: "2 cups" },
      { name: "Sukuma wiki", amount: "1 large bunch (500g)" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash the sukuma wiki thoroughly, remove the stems, and chop the leaves finely.",
      "Finely chop the onion, crush the garlic, and dice the tomatoes.",
      "Heat oil in a sufuria over medium heat. Add onions and cook until soft and translucent (3-4 minutes).",
      "Add garlic and cook for 1 minute until fragrant, then add tomatoes and cook until they soften into a sauce (5 minutes).",
      "Add the chopped sukuma wiki gradually, stirring as it wilts. Season with salt.",
      "Cover and cook for 8-10 minutes until tender, stirring occasionally. Add a splash of water if needed.",
      "Meanwhile, bring 3 cups of water to a boil in another sufuria.",
      "Gradually add maize flour while stirring continuously with a wooden spoon to prevent lumps.",
      "Continue adding flour and stirring until the mixture becomes firm and pulls away from the sides.",
      "Reduce heat, cover, and cook for 5 minutes. Shape into a mound and serve hot with the sukuma wiki."
    ]
  },
  {
    id: "githeri",
    name: "Traditional Githeri",
    description: "A hearty mix of maize and beans, slow-cooked with vegetables. Kenya's original one-pot meal.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Medium",
    total_time_minutes: 45,
    cost_min_kes: 80,
    cost_max_kes: 140,
    servings: 6,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Traditional Githeri with maize and beans",
    dietary_tags: ["Vegetarian", "Gluten-Free", "High-Fiber"],
    tags: ["staple", "traditional", "one-pot", "protein-rich", "meal-prep"],
    ingredients: [
      { name: "Dried maize", amount: "2 cups" },
      { name: "Dried beans", amount: "1 cup" },
      { name: "Potatoes", amount: "2 medium" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Curry powder", amount: "1 tsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Dhania", amount: "a handful for garnish" }
    ],
    instructions: [
      "Soak the maize and beans separately overnight, or for at least 6 hours.",
      "Drain and rinse. In a large sufuria, boil the maize in plenty of water for 2 hours until tender.",
      "Add the beans and continue cooking for another 1 hour until both are soft. Drain and set aside.",
      "Chop the onion, dice tomatoes, and peel and cube the potatoes.",
      "Heat oil in a large pan. Sauté onion until soft (3 minutes).",
      "Add curry powder and cook for 1 minute, then add tomatoes and cook until saucy.",
      "Add the cooked maize and beans, potatoes, and enough water to cover.",
      "Season with salt, cover, and simmer for 20 minutes until potatoes are tender.",
      "Garnish with fresh dhania and serve hot."
    ]
  },
  {
    id: "mukimo",
    name: "Mukimo",
    description: "A rich, creamy mash of potatoes, beans, and corn. A favorite at Kenyan celebrations.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 60,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 4,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Mukimo - mashed potatoes with beans and corn",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["traditional", "festive", "hearty", "celebration"],
    ingredients: [
      { name: "Potatoes", amount: "6 large" },
      { name: "Maize kernels", amount: "1 cup" },
      { name: "Beans (cooked)", amount: "1 cup" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Dhania", amount: "for garnish" }
    ],
    instructions: [
      "Peel and cube the potatoes. Boil in salted water until tender (15-20 minutes).",
      "Meanwhile, fry the onion in oil until golden and set aside.",
      "Drain the potatoes and return to the sufuria. Add the cooked beans, corn, and fried onions.",
      "Mash everything together with a potato masher until smooth and well combined.",
      "Season with salt to taste and mix well.",
      "Serve hot, traditionally with a meat or vegetable stew."
    ]
  },
  {
    id: "irio",
    name: "Irio",
    description: "A Kikuyu staple: mashed potatoes with greens and beans. Comfort food at its finest.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 50,
    cost_min_kes: 90,
    cost_max_kes: 160,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Irio - mashed potatoes with greens",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["traditional", "kikuyu", "hearty", "comfort-food"],
    ingredients: [
      { name: "Potatoes", amount: "6 large" },
      { name: "Maize", amount: "1 cup" },
      { name: "Beans (cooked)", amount: "1 cup" },
      { name: "Pumpkin leaves or spinach", amount: "1 bunch" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel and cube potatoes, boil in salted water until soft (15-20 minutes).",
      "Cook the maize separately until soft (about 20 minutes if using fresh).",
      "Wash the greens, remove stems, and finely chop.",
      "In a pan, sauté onion in oil until golden, then add the greens and cook until wilted.",
      "Drain potatoes and return to pot. Add cooked maize, beans, and the greens.",
      "Mash thoroughly until well combined and smooth.",
      "Season with salt to taste. Serve hot with stew or meat."
    ]
  },
  {
    id: "matoke-stew",
    name: "Matoke Stew",
    description: "Green bananas simmered in a rich tomato sauce. A comforting meal from Western Kenya.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 35,
    cost_min_kes: 130,
    cost_max_kes: 220,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Matoke stew with green bananas",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["traditional", "one-pot", "western-kenya", "comfort-food"],
    ingredients: [
      { name: "Matoke", amount: "8 pieces" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Dhania", amount: "a handful" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel the matoke by cutting off both ends, making lengthwise slits, and removing the skin. Cut into chunks and place in water to prevent browning.",
      "Chop onion, crush garlic, dice tomatoes, and roughly chop dhania.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes), add garlic and cook 1 minute.",
      "Add tomatoes and cook until they form a sauce (5 minutes).",
      "Add the matoke chunks, season with salt, and add water until just covered.",
      "Cover and simmer for 20-25 minutes until matoke is tender.",
      "Garnish with dhania and serve hot with ugali or rice."
    ]
  },
  {
    id: "omena-ugali",
    name: "Omena & Ugali",
    description: "Silver cyprinid in a tomato-coconut sauce with ugali. A protein-packed favorite from Lake Victoria.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 160,
    cost_max_kes: 260,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Omena fish served with ugali",
    dietary_tags: ["Gluten-Free", "High-Protein"],
    tags: ["traditional", "protein-rich", "lake-victoria", "fish"],
    ingredients: [
      { name: "Omena", amount: "250g" },
      { name: "Maize flour", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Coconut milk", amount: "1/2 cup" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Clean the omena: rinse thoroughly and remove any debris.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add the omena and stir well. Add coconut milk and 1/2 cup water.",
      "Season with salt, cover, and simmer for 10-12 minutes until the fish is cooked.",
      "Meanwhile, prepare ugali by bringing 3 cups water to a boil.",
      "Gradually add maize flour while stirring continuously until firm.",
      "Serve the omena stew hot with the ugali."
    ]
  },
  {
    id: "pilau",
    name: "Classic Kenyan Pilau",
    description: "Fragrant spiced rice with tender meat. A celebratory dish for gatherings.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 50,
    cost_min_kes: 280,
    cost_max_kes: 420,
    servings: 6,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Kenyan pilau rice with meat",
    dietary_tags: ["High-Protein"],
    tags: ["traditional", "festive", "celebration", "swahili"],
    ingredients: [
      { name: "Rice", amount: "2 cups" },
      { name: "Beef or chicken", amount: "300g" },
      { name: "Onion", amount: "2 large" },
      { name: "Pilau masala", amount: "2 tsp" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Ginger", amount: "1 inch" },
      { name: "Cooking oil", amount: "3 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash the rice and soak for 30 minutes. Drain and set aside.",
      "Chop onions, crush garlic, and grate ginger. Cut meat into bite-sized pieces.",
      "Heat oil in a large sufuria. Add onions and cook until golden brown (5-6 minutes).",
      "Add garlic and ginger, cook for 1 minute, then add the meat.",
      "Cook meat until browned (5-7 minutes). Add pilau masala and salt, stir well.",
      "Add the rice and stir to coat in the spices (2 minutes).",
      "Add 4 cups of hot water, bring to a boil, then reduce heat to low.",
      "Cover and cook for 15-20 minutes until rice is tender and water is absorbed.",
      "Fluff with a fork and serve hot."
    ]
  },
  {
    id: "kuku-paka",
    name: "Kuku Paka",
    description: "Tender chicken in a rich coconut curry. A coastal Kenyan favorite with Swahili influences.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 55,
    cost_min_kes: 350,
    cost_max_kes: 520,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Kuku Paka - chicken in coconut curry",
    dietary_tags: ["High-Protein"],
    tags: ["traditional", "coastal", "swahili", "curry", "coconut"],
    ingredients: [
      { name: "Chicken", amount: "500g" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Onion", amount: "2 large" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Ginger", amount: "1 inch" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Dhania", amount: "for garnish" }
    ],
    instructions: [
      "Chop onions, crush garlic, grate ginger, and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onions until soft (3 minutes).",
      "Add garlic and ginger, cook for 1 minute.",
      "Add chicken and brown on all sides (5-7 minutes).",
      "Add curry powder and cook for 1 minute until fragrant.",
      "Add tomatoes and cook until soft (5 minutes).",
      "Add coconut milk and 1/2 cup water, season with salt.",
      "Cover and simmer for 20-25 minutes until chicken is cooked through.",
      "Garnish with dhania and serve with rice or chapati."
    ]
  },
  {
    id: "nyama-choma",
    name: "Nyama Choma",
    description: "Perfectly grilled meat seasoned simply, served with kachumbari and ugali. The quintessential Kenyan social meal.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 60,
    cost_min_kes: 400,
    cost_max_kes: 600,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Nyama Choma - grilled meat with kachumbari",
    dietary_tags: ["High-Protein", "Gluten-Free"],
    tags: ["traditional", "grilled", "social", "meat", "party"],
    ingredients: [
      { name: "Goat or beef meat", amount: "600g" },
      { name: "Salt", amount: "to taste" },
      { name: "Black pepper", amount: "1 tsp" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Dhania", amount: "a handful" },
      { name: "Lemon juice", amount: "1 tbsp" }
    ],
    instructions: [
      "Cut meat into large pieces and season with salt and pepper.",
      "If using an oven, preheat to 200°C. If grilling, prepare your charcoal grill.",
      "For oven: Place meat on a rack and roast for 45-60 minutes, turning occasionally.",
      "For grill: Cook over medium heat, turning often, until well-browned and cooked through.",
      "While meat cooks, prepare kachumbari: dice tomatoes and onion, chop dhania.",
      "Mix kachumbari ingredients with lemon juice and salt.",
      "Serve the nyama choma hot with kachumbari and ugali."
    ]
  },
  {
    id: "fish-ugali",
    name: "Fish & Ugali",
    description: "Whole fish in a tomato-onion sauce served with ugali. A staple in lakeside communities.",
    category: "Traditional",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 40,
    cost_min_kes: 300,
    cost_max_kes: 450,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Whole fish served with ugali",
    dietary_tags: ["High-Protein", "Gluten-Free"],
    tags: ["traditional", "fish", "lake-victoria", "staple"],
    ingredients: [
      { name: "Whole fish", amount: "1 large (600g)" },
      { name: "Maize flour", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "3 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Dhania", amount: "for garnish" }
    ],
    instructions: [
      "Clean the fish, remove scales and gut it. Make slits on both sides.",
      "Rub with salt and half the oil. Set aside.",
      "Chop onion and dice tomatoes.",
      "Heat remaining oil in a sufuria. Fry the fish for 3-4 minutes on each side until golden. Remove and set aside.",
      "In the same oil, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes). Add 1 cup water and salt.",
      "Return fish to the sauce, cover, and simmer for 8-10 minutes.",
      "Meanwhile, prepare ugali with 3 cups water and maize flour.",
      "Garnish fish with dhania and serve with ugali."
    ]
  },
  {
    id: "managu",
    name: "Managu",
    description: "A nutritious traditional vegetable, cooked simply with onions and tomatoes.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 60,
    cost_max_kes: 110,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Managu - African nightshade greens",
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Calorie"],
    tags: ["traditional", "vegetable", "nutritious"],
    ingredients: [
      { name: "Managu", amount: "1 large bunch" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash managu thoroughly, remove tough stems, and chop roughly.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until soft and saucy (5 minutes).",
      "Add the managu, season with salt, and stir well.",
      "Cover and cook for 5-7 minutes until wilted but still bright green.",
      "Serve hot with ugali or as a side dish."
    ]
  },
  {
    id: "terere",
    name: "Terere",
    description: "Nutritious amaranth leaves cooked with tomatoes and onions. Packed with iron and vitamins.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 60,
    cost_max_kes: 110,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Terere - amaranth greens",
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Calorie"],
    tags: ["traditional", "vegetable", "nutritious", "iron-rich"],
    ingredients: [
      { name: "Terere", amount: "1 large bunch" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash terere thoroughly and remove tough stems.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until soft (5 minutes).",
      "Add terere, season with salt, and stir well.",
      "Cook for 5-7 minutes until tender. Serve hot."
    ]
  },
  {
    id: "mrenda",
    name: "Mrenda",
    description: "A slimy, delicious vegetable from the coast. Jute leaves cooked with onions and tomatoes.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 70,
    cost_max_kes: 120,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Mrenda - jute leaves",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["traditional", "coastal", "vegetable"],
    ingredients: [
      { name: "Mrenda", amount: "1 large bunch" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Baking soda", amount: "1/2 tsp (optional)" }
    ],
    instructions: [
      "Wash mrenda and remove tough stems. Chop into small pieces.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until soft (5 minutes).",
      "Add mrenda, salt, and baking soda if using.",
      "Cook for 10-12 minutes until tender, stirring occasionally.",
      "Serve hot with ugali."
    ]
  },
  {
    id: "kunde",
    name: "Kunde",
    description: "Cowpea leaves cooked in a flavorful tomato-onion sauce. A protein-rich vegetable from Eastern Kenya.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 70,
    cost_max_kes: 120,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Kunde - cowpea leaves",
    dietary_tags: ["Vegetarian", "Gluten-Free", "High-Fiber"],
    tags: ["traditional", "vegetable", "protein-rich"],
    ingredients: [
      { name: "Kunde", amount: "1 large bunch" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Peanut butter", amount: "1 tbsp (optional)" }
    ],
    instructions: [
      "Wash kunde thoroughly, remove tough stems, and chop finely.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until soft (5 minutes).",
      "Add kunde, season with salt, and stir well.",
      "If using peanut butter, add it with 1/4 cup water and stir to combine.",
      "Cover and cook for 8-10 minutes until tender.",
      "Serve hot with ugali or rice."
    ]
  },
  {
    id: "ndengu-rice",
    name: "Ndengu & Rice",
    description: "Green grams in a rich tomato stew served over fluffy rice. A nutritious, protein-packed meal.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Medium",
    total_time_minutes: 40,
    cost_min_kes: 120,
    cost_max_kes: 210,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Ndengu stew with rice",
    dietary_tags: ["Vegetarian", "High-Protein", "Gluten-Free"],
    tags: ["traditional", "protein-rich", "legume", "one-pot"],
    ingredients: [
      { name: "Ndengu", amount: "2 cups" },
      { name: "Rice", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Coconut milk", amount: "1/2 cup" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash ndengu and boil in salted water until tender (20-25 minutes). Drain and set aside.",
      "Cook rice according to package instructions.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add cooked ndengu, coconut milk, and 1/2 cup water.",
      "Season with salt, cover, and simmer for 10 minutes.",
      "Serve hot with the rice."
    ]
  },
  {
    id: "beans-rice",
    name: "Beans & Rice",
    description: "A filling, budget-friendly meal of beans in tomato sauce over rice. Simple and satisfying.",
    category: "Traditional",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 35,
    cost_min_kes: 100,
    cost_max_kes: 170,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Beans stew with rice",
    dietary_tags: ["Vegetarian", "High-Fiber", "High-Protein", "Gluten-Free"],
    tags: ["traditional", "budget-friendly", "protein-rich", "meal-prep"],
    ingredients: [
      { name: "Dried beans", amount: "2 cups" },
      { name: "Rice", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Soak beans overnight, drain, and boil in salted water until soft (1-1.5 hours).",
      "Cook rice according to package instructions.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add cooked beans and 1/2 cup water. Season with salt.",
      "Simmer for 10 minutes. Serve hot with rice."
    ]
  },

  // ==================== STREET FOOD (10) ====================
  {
    id: "chips-mayai",
    name: "Chips Mayai",
    description: "Street-side classic: crispy fries bound together with eggs. The ultimate Nairobi street food.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 80,
    cost_max_kes: 150,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Chips Mayai - chips with eggs",
    dietary_tags: ["High-Protein"],
    tags: ["street-food", "nairobi", "popular", "quick"],
    ingredients: [
      { name: "Potatoes", amount: "3 medium" },
      { name: "Eggs", amount: "3" },
      { name: "Onion", amount: "1 small" },
      { name: "Cooking oil", amount: "for frying" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel and cut potatoes into french fries. Rinse and pat dry.",
      "Heat oil in a sufuria and fry potatoes until golden and crispy (5-7 minutes). Drain.",
      "Beat eggs in a bowl, season with salt, and finely chop the onion.",
      "In a separate pan, heat 2 tbsp oil. Add onion and cook until soft.",
      "Add the fried chips and pour the beaten eggs over them.",
      "Cook until the eggs are set, flip if desired, and cook the other side.",
      "Serve hot with kachumbari and tomato sauce."
    ]
  },
  {
    id: "smokie",
    name: "Smokie",
    description: "Grilled smokie sausage with fresh kachumbari and spicy sauce. A Kenyan street food classic.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Smokie with kachumbari",
    dietary_tags: ["High-Protein"],
    tags: ["street-food", "snack", "popular", "quick"],
    ingredients: [
      { name: "Smokie sausages", amount: "4 pieces" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Dhania", amount: "a handful" },
      { name: "Lemon juice", amount: "1 tbsp" },
      { name: "Chili sauce", amount: "to taste" }
    ],
    instructions: [
      "Grill or fry the smokies over medium heat until browned and cooked through (5-6 minutes).",
      "Dice tomatoes and onion, chop dhania for the kachumbari.",
      "Mix kachumbari with lemon juice and salt.",
      "Serve smokies hot with kachumbari and chili sauce."
    ]
  },
  {
    id: "samosa",
    name: "Kenyan Samosa",
    description: "Crispy, triangular pastries filled with spiced meat or vegetables. A favorite at parties and tea time.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Medium",
    total_time_minutes: 45,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 4,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Kenyan samosas",
    dietary_tags: [],
    tags: ["street-food", "snack", "party", "party-food"],
    ingredients: [
      { name: "Samosa wrappers", amount: "12 pieces" },
      { name: "Ground meat", amount: "300g" },
      { name: "Onion", amount: "1 medium" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Ginger", amount: "1 inch" },
      { name: "Cumin", amount: "1 tsp" },
      { name: "Coriander", amount: "1 tsp" },
      { name: "Cooking oil", amount: "for frying" }
    ],
    instructions: [
      "Finely chop onion, crush garlic, and grate ginger.",
      "Heat 2 tbsp oil in a pan, sauté onion until soft.",
      "Add garlic and ginger, cook 1 minute, then add ground meat.",
      "Cook until browned, add spices and salt. Cook until dry. Set aside to cool.",
      "Fill samosa wrappers with the meat mixture and fold into triangles.",
      "Heat oil and deep fry samosas until golden and crispy (3-4 minutes).",
      "Drain on paper towel and serve hot."
    ]
  },
  {
    id: "bhajia",
    name: "Bhajia",
    description: "Spiced potato and onion fritters, crispy on the outside and soft inside. A popular street snack.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 90,
    cost_max_kes: 160,
    servings: 3,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Bhajia fritters",
    dietary_tags: ["Vegetarian"],
    tags: ["street-food", "snack", "coastal", "fritters"],
    ingredients: [
      { name: "Potatoes", amount: "4 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Gram flour", amount: "1 cup" },
      { name: "Chili powder", amount: "1 tsp" },
      { name: "Turmeric", amount: "1/2 tsp" },
      { name: "Cooking oil", amount: "for frying" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel and thinly slice potatoes and onion.",
      "Mix gram flour with chili powder, turmeric, and salt. Add water to make a thick batter.",
      "Dip potato and onion slices in the batter, coating well.",
      "Heat oil in a sufuria and fry the fritters until golden and crispy (3-4 minutes).",
      "Drain on paper towel and serve hot with chili sauce."
    ]
  },
  {
    id: "mutura",
    name: "Mutura",
    description: "A traditional grilled sausage made from blood and meat, packed with spices. A road-side grill favorite.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Medium",
    total_time_minutes: 40,
    cost_min_kes: 150,
    cost_max_kes: 250,
    servings: 3,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Mutura - African blood sausage",
    dietary_tags: ["High-Protein"],
    tags: ["street-food", "traditional", "grilled", "sausage"],
    ingredients: [
      { name: "Beef or goat meat", amount: "300g" },
      { name: "Blood (optional)", amount: "1/2 cup" },
      { name: "Onion", amount: "1 medium" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Chili", amount: "2 pieces" },
      { name: "Salt", amount: "to taste" },
      { name: "Sausage casings", amount: "as needed" }
    ],
    instructions: [
      "Mince the meat finely with onion, garlic, and chili.",
      "Mix in the blood if using, season with salt and spices.",
      "Stuff the mixture into sausage casings, forming links.",
      "Grill over charcoal or in a pan until cooked through (15-20 minutes).",
      "Serve hot with kachumbari and chili sauce."
    ]
  },
  {
    id: "roasted-maize",
    name: "Roasted Maize",
    description: "Perfectly charred maize on the cob, roasted over an open flame. A simple, nostalgic street snack.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 50,
    cost_max_kes: 100,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Roasted maize on the cob",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["street-food", "snack", "simple"],
    ingredients: [
      { name: "Maize", amount: "4 pieces" },
      { name: "Salt", amount: "to taste" },
      { name: "Chili powder", amount: "optional" }
    ],
    instructions: [
      "Remove husks and silk from the maize.",
      "If using an oven: Roast at 200°C for 15-20 minutes, turning occasionally.",
      "If using charcoal: Place on the grill and roast until charred in spots.",
      "Serve hot with salt and optional chili powder."
    ]
  },
  {
    id: "viazi-karai",
    name: "Viazi Karai",
    description: "Spiced potato balls fried to golden perfection. A Mombasa street food favorite.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 80,
    cost_max_kes: 140,
    servings: 3,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Viazi Karai - spiced potatoes",
    dietary_tags: ["Vegetarian"],
    tags: ["street-food", "coastal", "snack", "mombasa"],
    ingredients: [
      { name: "Potatoes", amount: "4 medium" },
      { name: "Gram flour", amount: "1 cup" },
      { name: "Cumin", amount: "1 tsp" },
      { name: "Chili powder", amount: "1 tsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Cooking oil", amount: "for frying" }
    ],
    instructions: [
      "Boil potatoes until tender, peel and mash them.",
      "Add cumin, chili powder, and salt. Mix well.",
      "Form small balls from the potato mixture.",
      "Mix gram flour with water to make a thick batter.",
      "Dip potato balls in batter and deep fry until golden (3-4 minutes).",
      "Serve hot with chutney."
    ]
  },
  {
    id: "boiled-eggs",
    name: "Boiled Eggs with Kachumbari",
    description: "Hard-boiled eggs served with fresh kachumbari and salt. A healthy, protein-packed street snack.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 60,
    cost_max_kes: 120,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Boiled eggs with kachumbari",
    dietary_tags: ["Vegetarian", "Gluten-Free", "High-Protein"],
    tags: ["street-food", "snack", "healthy", "protein", "quick"],
    ingredients: [
      { name: "Eggs", amount: "4" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Dhania", amount: "a handful" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Place eggs in a pot, cover with water, and bring to a boil.",
      "Cook for 10 minutes for hard-boiled. Drain and cool in cold water.",
      "Peel the eggs and cut in half or quarter.",
      "Prepare kachumbari with diced tomatoes, onions, and dhania.",
      "Serve eggs with kachumbari and a sprinkle of salt."
    ]
  },
  {
    id: "sausage-roll",
    name: "Kenyan Sausage Roll",
    description: "Puff pastry wrapped around a savory sausage, baked until golden. A popular bakery choice.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 4,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Kenyan sausage rolls",
    dietary_tags: ["High-Protein"],
    tags: ["street-food", "snack", "bakery", "popular"],
    ingredients: [
      { name: "Puff pastry", amount: "1 sheet" },
      { name: "Sausage meat", amount: "250g" },
      { name: "Onion", amount: "1 small" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Salt", amount: "to taste" },
      { name: "Egg", amount: "1 (for brushing)" }
    ],
    instructions: [
      "Finely chop onion and garlic, mix with sausage meat and salt.",
      "Roll puff pastry sheet into a rectangle.",
      "Form the meat mixture into a log and place on the pastry.",
      "Roll the pastry around the meat, sealing the edges.",
      "Cut into smaller sausage rolls, brush with beaten egg.",
      "Bake at 200°C for 15-20 minutes until golden and puffed."
    ]
  },
  {
    id: "kachumbari",
    name: "Kachumbari",
    description: "Fresh tomato and onion salad with coriander and lemon juice. The quintessential Kenyan side dish.",
    category: "Street Food",
    meal_type: "Snack",
    difficulty: "Easy",
    total_time_minutes: 10,
    cost_min_kes: 50,
    cost_max_kes: 90,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Kachumbari salad",
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Calorie"],
    tags: ["street-food", "salad", "fresh", "side-dish"],
    ingredients: [
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 medium" },
      { name: "Dhania", amount: "a handful" },
      { name: "Lemon juice", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Chili", amount: "1 piece (optional)" }
    ],
    instructions: [
      "Dice tomatoes and onion finely.",
      "Chop dhania and chili if using.",
      "Mix all ingredients in a bowl.",
      "Add lemon juice and salt to taste.",
      "Serve immediately as a side dish."
    ]
  },

  // ==================== BREAKFAST (10) ====================
  {
    id: "chapati-tea",
    name: "Chapati & Chai",
    description: "Soft, layered chapati served with milky spiced tea. The perfect Kenyan breakfast.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Medium",
    total_time_minutes: 45,
    cost_min_kes: 90,
    cost_max_kes: 170,
    servings: 3,
    image_url: unsplash("1551024506-0bccd828d307"),
    image_alt: "Chapati with chai tea",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "traditional", "staple", "chai"],
    ingredients: [
      { name: "Chapati flour", amount: "2 cups" },
      { name: "Warm water", amount: "1 cup" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "1 tsp" },
      { name: "Milk", amount: "2 cups" },
      { name: "Tea leaves", amount: "2 tsp" },
      { name: "Sugar", amount: "to taste" },
      { name: "Ginger", amount: "1 inch" }
    ],
    instructions: [
      "Mix flour, salt, and oil in a bowl. Gradually add warm water to form a soft dough.",
      "Knead for 5 minutes until smooth, cover, and rest for 20 minutes.",
      "Divide dough into small balls and roll each into a thin circle.",
      "Cook on a hot pan, brushing with oil, until golden spots appear on both sides.",
      "For chai: Bring milk and water (1:1) to a boil with ginger.",
      "Add tea leaves and simmer for 2-3 minutes.",
      "Strain, add sugar, and serve with hot chapati."
    ]
  },
  {
    id: "mandazi-tea",
    name: "Mandazi & Chai",
    description: "Pillowy, slightly sweet mandazi with milky spiced tea. A coastal breakfast favorite.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 90,
    cost_max_kes: 170,
    servings: 4,
    image_url: unsplash("1551024506-0bccd828d307"),
    image_alt: "Mandazi with tea",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "coastal", "donuts", "sweet", "chai"],
    ingredients: [
      { name: "Wheat flour", amount: "2 cups" },
      { name: "Sugar", amount: "2 tbsp" },
      { name: "Baking powder", amount: "1 tsp" },
      { name: "Cardamom", amount: "1/2 tsp" },
      { name: "Milk", amount: "1/2 cup" },
      { name: "Cooking oil", amount: "for frying" }
    ],
    instructions: [
      "Mix flour, sugar, baking powder, and cardamom in a bowl.",
      "Add milk and knead into a soft dough.",
      "Let the dough rest for 15 minutes.",
      "Roll out the dough and cut into triangles.",
      "Heat oil in a sufuria and deep fry mandazi until golden brown (3-4 minutes).",
      "Drain on paper towel and serve with hot chai."
    ]
  },
  {
    id: "uji",
    name: "Uji",
    description: "A nourishing porridge made from millet or sorghum. A traditional breakfast that's comforting and nutritious.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 60,
    cost_max_kes: 120,
    servings: 2,
    image_url: unsplash("1551024506-0bccd828d307"),
    image_alt: "Uji - Kenyan porridge",
    dietary_tags: ["Vegetarian", "Gluten-Free", "Dairy-Free"],
    tags: ["breakfast", "traditional", "porridge", "comfort", "nutritious"],
    ingredients: [
      { name: "Millet flour", amount: "1 cup" },
      { name: "Water", amount: "3 cups" },
      { name: "Sugar", amount: "to taste" },
      { name: "Milk", amount: "1/2 cup (optional)" }
    ],
    instructions: [
      "Mix millet flour with 1/2 cup cold water to make a smooth paste.",
      "Bring 2.5 cups water to a boil in a sufuria.",
      "Gradually add the paste while stirring continuously.",
      "Reduce heat and simmer for 5-7 minutes, stirring occasionally.",
      "Add sugar and milk if using. Serve warm."
    ]
  },
  {
    id: "bread-eggs",
    name: "Bread & Eggs",
    description: "Classic fried eggs with toasted bread. A quick, simple breakfast that never fails.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 10,
    cost_min_kes: 50,
    cost_max_kes: 100,
    servings: 2,
    image_url: unsplash("1525351484163-7529414344d8"),
    image_alt: "Bread and eggs",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "quick", "simple", "classic"],
    ingredients: [
      { name: "Bread", amount: "4 slices" },
      { name: "Eggs", amount: "2" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Toast bread slices until golden.",
      "Heat oil in a pan and fry the eggs to your preference.",
      "Season with salt.",
      "Serve immediately with the toasted bread."
    ]
  },
  {
    id: "pancakes",
    name: "Pancakes",
    description: "Fluffy homemade pancakes, served with honey or jam. A weekend breakfast treat.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 80,
    cost_max_kes: 150,
    servings: 3,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Homemade pancakes",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "sweet", "weekend", "family"],
    ingredients: [
      { name: "Wheat flour", amount: "1.5 cups" },
      { name: "Milk", amount: "1 cup" },
      { name: "Egg", amount: "1" },
      { name: "Sugar", amount: "1 tbsp" },
      { name: "Baking powder", amount: "1 tsp" },
      { name: "Honey", amount: "for serving" }
    ],
    instructions: [
      "Mix flour, sugar, and baking powder in a bowl.",
      "Beat egg and milk together, add to dry ingredients.",
      "Mix to form a smooth batter.",
      "Heat a pan and pour a scoop of batter.",
      "Cook until bubbles form, flip, and cook the other side.",
      "Serve with honey or jam."
    ]
  },
  {
    id: "oatmeal-banana",
    name: "Banana Peanut Oats",
    description: "Creamy oats topped with banana and peanut butter. A filling, energy-packed breakfast.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 8,
    cost_min_kes: 70,
    cost_max_kes: 140,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Oatmeal with banana",
    dietary_tags: ["Vegetarian", "High-Fiber"],
    tags: ["breakfast", "healthy", "quick", "oats", "protein"],
    ingredients: [
      { name: "Oats", amount: "1 cup" },
      { name: "Banana", amount: "1 ripe" },
      { name: "Milk", amount: "1 cup" },
      { name: "Peanut butter", amount: "1 tbsp" }
    ],
    instructions: [
      "Bring milk to a boil in a small pot.",
      "Add oats and cook for 2-3 minutes until soft, stirring occasionally.",
      "Slice banana and stir into the oats with peanut butter.",
      "Serve warm."
    ]
  },
  {
    id: "sweet-potatoes",
    name: "Boiled Sweet Potatoes",
    description: "Sweet potatoes boiled until tender and served with chai. A wholesome, traditional breakfast.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 60,
    cost_max_kes: 120,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Boiled sweet potatoes",
    dietary_tags: ["Vegetarian", "Gluten-Free", "High-Fiber"],
    tags: ["breakfast", "traditional", "healthy", "potato"],
    ingredients: [
      { name: "Sweet potatoes", amount: "4 medium" },
      { name: "Salt", amount: "to taste" },
      { name: "Chai", amount: "for serving" }
    ],
    instructions: [
      "Peel and cut sweet potatoes into chunks.",
      "Place in a sufuria, cover with water, and add salt.",
      "Boil for 15-20 minutes until tender.",
      "Drain and serve hot with chai."
    ]
  },
  {
    id: "arrow-roots",
    name: "Arrow Roots",
    description: "Boiled arrow roots served with chai. A popular breakfast in western Kenya.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 70,
    cost_max_kes: 130,
    servings: 2,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Boiled arrow roots",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["breakfast", "traditional", "western-kenya"],
    ingredients: [
      { name: "Arrow roots", amount: "6 pieces" },
      { name: "Salt", amount: "to taste" },
      { name: "Chai", amount: "for serving" }
    ],
    instructions: [
      "Scrub arrow roots clean, peel if desired.",
      "Place in a sufuria with water and salt.",
      "Boil for 20-25 minutes until tender.",
      "Drain and serve hot with chai."
    ]
  },
  {
    id: "porridge",
    name: "Plain Porridge",
    description: "Smooth, comforting porridge made from wheat or maize. A gentle start to the day.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 12,
    cost_min_kes: 50,
    cost_max_kes: 100,
    servings: 2,
    image_url: unsplash("1551024506-0bccd828d307"),
    image_alt: "Plain porridge",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "comfort", "simple"],
    ingredients: [
      { name: "Porridge flour", amount: "1 cup" },
      { name: "Water", amount: "3 cups" },
      { name: "Sugar", amount: "to taste" },
      { name: "Milk", amount: "optional" }
    ],
    instructions: [
      "Mix porridge flour with 1/2 cup cold water.",
      "Bring 2.5 cups water to a boil.",
      "Gradually add the paste while stirring.",
      "Cook for 5 minutes, add sugar and milk if using.",
      "Serve warm."
    ]
  },
  {
    id: "eggs-bread",
    name: "Scrambled Eggs on Toast",
    description: "Perfectly scrambled eggs served on buttered toast. A classic breakfast done right.",
    category: "Breakfast",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 10,
    cost_min_kes: 60,
    cost_max_kes: 120,
    servings: 2,
    image_url: unsplash("1525351484163-7529414344d8"),
    image_alt: "Scrambled eggs on toast",
    dietary_tags: ["Vegetarian"],
    tags: ["breakfast", "quick", "classic", "eggs"],
    ingredients: [
      { name: "Bread", amount: "4 slices" },
      { name: "Eggs", amount: "3" },
      { name: "Butter", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Toast bread slices and spread with butter.",
      "Beat eggs in a bowl with salt.",
      "Melt butter in a pan over low heat.",
      "Add eggs and cook slowly, stirring constantly, until just set.",
      "Serve immediately on the toast."
    ]
  },

  // ==================== LUNCH/DINNER (15) ====================
  {
    id: "beef-stew-rice",
    name: "Beef Stew & Rice",
    description: "Hearty beef stew in a rich tomato sauce, served over fluffy rice. Comfort food for family dinners.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 55,
    cost_min_kes: 300,
    cost_max_kes: 480,
    servings: 4,
    image_url: unsplash("1547592180-85f173990554"),
    image_alt: "Beef stew with rice",
    dietary_tags: ["High-Protein"],
    tags: ["lunch", "dinner", "hearty", "family", "stew"],
    ingredients: [
      { name: "Beef", amount: "300g" },
      { name: "Rice", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Carrot", amount: "2 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Cut beef into small pieces. Chop onion, dice tomatoes and carrots.",
      "Heat oil in a sufuria, brown the beef on all sides (5-7 minutes). Remove and set aside.",
      "In the same oil, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy. Return the beef.",
      "Add carrots, 1/2 cup water, and salt.",
      "Cover and simmer for 25-30 minutes until beef is tender.",
      "Cook rice separately. Serve stew over rice."
    ]
  },
  {
    id: "chicken-stew",
    name: "Simple Chicken Stew",
    description: "Tender chicken in a rich onion and tomato gravy. A meal that brings the family together.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 48,
    cost_min_kes: 320,
    cost_max_kes: 520,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Chicken stew",
    dietary_tags: ["High-Protein"],
    tags: ["lunch", "dinner", "chicken", "family", "stew"],
    ingredients: [
      { name: "Chicken", amount: "500g" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "2 large" },
      { name: "Potatoes", amount: "3 medium" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop onions and dice tomatoes. Peel and cut potatoes into chunks.",
      "Heat oil in a sufuria. Sauté onion until soft (3 minutes).",
      "Add chicken and brown on all sides (5-7 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add potatoes, 1 cup water, and salt.",
      "Cover and simmer for 25-30 minutes until chicken and potatoes are tender.",
      "Serve hot with rice or ugali."
    ]
  },
  {
    id: "egg-fried-rice",
    name: "Egg Fried Rice",
    description: "Quick wok-style rice with eggs, vegetables, and soy sauce. Perfect for busy evenings.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 80,
    cost_max_kes: 160,
    servings: 3,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Egg fried rice",
    dietary_tags: ["Vegetarian"],
    tags: ["quick", "one-pot", "leftover-friendly", "rice", "eggs"],
    ingredients: [
      { name: "Leftover rice", amount: "2 cups" },
      { name: "Eggs", amount: "2" },
      { name: "Carrot", amount: "1 medium" },
      { name: "Spring onion", amount: "2 stalks" },
      { name: "Soy sauce", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Beat eggs in a bowl. Dice carrot and chop spring onion.",
      "Heat oil in a large pan, scramble the eggs and remove.",
      "Add carrot and stir-fry for 2 minutes.",
      "Add rice and soy sauce, stir-fry for 3-4 minutes.",
      "Return eggs and add spring onion. Serve hot."
    ]
  },
  {
    id: "tomato-pasta",
    name: "Tomato Garlic Pasta",
    description: "A simple pasta with a rich tomato and garlic sauce. Quick, satisfying, and made from pantry staples.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 22,
    cost_min_kes: 100,
    cost_max_kes: 190,
    servings: 3,
    image_url: unsplash("1473093295043-cdd812d0e601"),
    image_alt: "Tomato garlic pasta",
    dietary_tags: ["Vegetarian"],
    tags: ["pasta", "quick", "vegetarian", "pantry", "dinner"],
    ingredients: [
      { name: "Pasta", amount: "250g" },
      { name: "Tomatoes", amount: "4 medium" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Dhania", amount: "a handful" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Cook pasta according to package instructions. Drain and set aside.",
      "Chop tomatoes and crush garlic.",
      "Heat oil in a pan, sauté garlic for 1 minute.",
      "Add tomatoes and cook until they form a sauce (5-7 minutes).",
      "Season with salt, add cooked pasta, and toss well.",
      "Garnish with dhania and serve hot."
    ]
  },
  {
    id: "vegetable-curry-rice",
    name: "Vegetable Curry & Rice",
    description: "A fragrant coconut curry filled with mixed vegetables. A healthy, satisfying vegetarian meal.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 150,
    cost_max_kes: 250,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Vegetable curry with rice",
    dietary_tags: ["Vegetarian", "Dairy-Free", "High-Fiber"],
    tags: ["curry", "vegetarian", "healthy", "coconut", "rice"],
    ingredients: [
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Rice", amount: "2 cups" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop onion and crush garlic.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic and curry powder, cook for 1 minute.",
      "Add vegetables and cook for 5 minutes.",
      "Add coconut milk and 1/2 cup water. Season with salt.",
      "Simmer for 10-12 minutes until vegetables are tender.",
      "Cook rice separately. Serve curry over rice."
    ]
  },
  {
    id: "spaghetti-bolognese",
    name: "Spaghetti Bolognese",
    description: "A classic beef and tomato pasta sauce, simplified for a Kenyan kitchen. A family favorite.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 40,
    cost_min_kes: 250,
    cost_max_kes: 400,
    servings: 4,
    image_url: unsplash("1473093295043-cdd812d0e601"),
    image_alt: "Spaghetti bolognese",
    dietary_tags: ["High-Protein"],
    tags: ["pasta", "beef", "family", "classic", "dinner"],
    ingredients: [
      { name: "Spaghetti", amount: "250g" },
      { name: "Ground beef", amount: "300g" },
      { name: "Tomatoes", amount: "4 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Cook spaghetti according to package instructions.",
      "Chop onion, crush garlic, and dice tomatoes.",
      "Heat oil in a pan, cook onion until soft (3 minutes).",
      "Add garlic and ground beef, cook until browned (5 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Season with salt, simmer for 10 minutes.",
      "Serve sauce over spaghetti."
    ]
  },
  {
    id: "chicken-charcoal",
    name: "Charcoal-Grilled Chicken",
    description: "Chicken marinated in herbs and grilled over charcoal. A backyard favorite for special occasions.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 50,
    cost_min_kes: 350,
    cost_max_kes: 550,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Grilled chicken",
    dietary_tags: ["High-Protein", "Gluten-Free"],
    tags: ["grilled", "chicken", "barbecue", "special", "dinner"],
    ingredients: [
      { name: "Chicken", amount: "600g" },
      { name: "Lemon juice", amount: "2 tbsp" },
      { name: "Garlic", amount: "4 cloves" },
      { name: "Ginger", amount: "1 inch" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Mix lemon juice, crushed garlic, grated ginger, oil, and salt.",
      "Marinate chicken for at least 1 hour (preferably overnight).",
      "Prepare charcoal grill.",
      "Grill chicken over medium heat for 15-20 minutes, turning often.",
      "Cook until juices run clear and skin is crispy.",
      "Serve with kachumbari and ugali."
    ]
  },
  {
    id: "fish-curry",
    name: "Fish Curry",
    description: "Fish simmered in a fragrant coconut curry sauce. A coastal dish bursting with flavor.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 280,
    cost_max_kes: 450,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Fish curry",
    dietary_tags: ["High-Protein", "Gluten-Free"],
    tags: ["fish", "curry", "coastal", "coconut", "dinner"],
    ingredients: [
      { name: "Fish fillets", amount: "400g" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Onion", amount: "1 large" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop onion, crush garlic, and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic and curry powder, cook 1 minute.",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add coconut milk and 1/2 cup water. Season with salt.",
      "Add fish and simmer gently for 8-10 minutes.",
      "Serve hot with rice."
    ]
  },
  {
    id: "lentil-soup",
    name: "Lentil Soup",
    description: "A hearty, nutritious lentil soup with vegetables. Affordable and packed with protein and fiber.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Lentil soup",
    dietary_tags: ["Vegetarian", "High-Protein", "High-Fiber", "Gluten-Free"],
    tags: ["soup", "lentils", "healthy", "budget-friendly", "winter"],
    ingredients: [
      { name: "Red lentils", amount: "2 cups" },
      { name: "Carrots", amount: "2 medium" },
      { name: "Celery", amount: "2 stalks" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Wash lentils and drain. Chop carrots, celery, onion, and garlic.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic, carrots, and celery, cook 3 minutes.",
      "Add lentils and 4 cups water. Season with salt.",
      "Bring to a boil, reduce heat, and simmer for 20 minutes.",
      "Blend if desired for a smooth soup. Serve hot with bread."
    ]
  },
  {
    id: "beef-curry-rice",
    name: "Beef Curry & Rice",
    description: "Tender beef in a rich, spiced curry sauce. A warming meal for cold evenings.",
    category: "Lunch/Dinner",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 50,
    cost_min_kes: 320,
    cost_max_kes: 500,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Beef curry with rice",
    dietary_tags: ["High-Protein"],
    tags: ["curry", "beef", "hearty", "dinner", "rice"],
    ingredients: [
      { name: "Beef", amount: "300g" },
      { name: "Rice", amount: "2 cups" },
      { name: "Onion", amount: "2 large" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Cut beef into cubes. Chop onion, dice tomatoes, crush garlic.",
      "Heat oil in a sufuria, brown the beef (5 minutes). Remove.",
      "Sauté onion until soft (3 minutes), add garlic.",
      "Add curry powder and cook 1 minute, then add tomatoes.",
      "Return beef, add 1 cup water, cover and simmer for 25-30 minutes.",
      "Cook rice separately. Serve curry over rice."
    ]
  },
  {
    id: "cabbage-potatoes",
    name: "Cabbage & Potatoes",
    description: "Tender cabbage cooked with potatoes in a tomato sauce. A simple, comforting vegetable dish.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 80,
    cost_max_kes: 150,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Cabbage and potatoes",
    dietary_tags: ["Vegetarian", "Gluten-Free"],
    tags: ["vegetable", "simple", "healthy", "side-dish", "lunch"],
    ingredients: [
      { name: "Cabbage", amount: "1 medium" },
      { name: "Potatoes", amount: "3 medium" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop cabbage, peel and cut potatoes into chunks, chop onion, dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add cabbage and potatoes, season with salt.",
      "Add 1/2 cup water, cover and cook for 15 minutes until potatoes are tender.",
      "Serve hot with ugali or rice."
    ]
  },
  {
    id: "mixed-vegetable-stew",
    name: "Mixed Vegetable Stew",
    description: "A colorful, nutritious stew packed with seasonal vegetables. Healthy and delicious.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Mixed vegetable stew",
    dietary_tags: ["Vegetarian", "Gluten-Free", "High-Fiber", "Low-Calorie"],
    tags: ["vegetable", "healthy", "colorful", "stew", "lunch"],
    ingredients: [
      { name: "Mixed vegetables", amount: "4 cups" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop onion, crush garlic, and dice tomatoes.",
      "Prepare vegetables: slice carrots, cut beans and broccoli.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic and tomatoes, cook until saucy (5 minutes).",
      "Add all vegetables and 1 cup water. Season with salt.",
      "Cover and simmer for 10-12 minutes until vegetables are tender.",
      "Serve hot."
    ]
  },
  {
    id: "potato-egg-sauce",
    name: "Potato & Egg Sauce",
    description: "Crispy potatoes in a tomato-egg sauce. A simple, filling meal perfect for any time of day.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 28,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 3,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Potato and egg sauce",
    dietary_tags: ["Vegetarian", "High-Protein"],
    tags: ["potato", "egg", "simple", "hearty", "lunch"],
    ingredients: [
      { name: "Potatoes", amount: "4 medium" },
      { name: "Eggs", amount: "3" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel and cube potatoes. Chop onion and dice tomatoes.",
      "Heat oil in a sufuria, fry potatoes until lightly browned.",
      "Remove potatoes, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Return potatoes, add 1/2 cup water, and season with salt.",
      "Crack eggs over the sauce, cover and cook until eggs are set.",
      "Serve hot."
    ]
  },
  {
    id: "rice-beans-coconut",
    name: "Coconut Rice & Beans",
    description: "Fragrant coconut rice served with saucy beans. A coastal-inspired meal that's pure comfort.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 130,
    cost_max_kes: 220,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Coconut rice with beans",
    dietary_tags: ["Vegetarian", "High-Fiber", "High-Protein"],
    tags: ["coconut", "rice", "beans", "coastal", "lunch", "comfort"],
    ingredients: [
      { name: "Rice", amount: "2 cups" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Beans (cooked)", amount: "2 cups" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Cook rice with coconut milk and 1.5 cups water.",
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add cooked beans and 1/2 cup water. Season with salt.",
      "Simmer for 5 minutes. Serve over coconut rice."
    ]
  },
  {
    id: "meat-pie",
    name: "Kenyan Meat Pie",
    description: "Flaky pastry filled with spiced ground meat. A handheld meal perfect for lunch boxes.",
    category: "Lunch/Dinner",
    meal_type: "Lunch",
    difficulty: "Medium",
    total_time_minutes: 45,
    cost_min_kes: 150,
    cost_max_kes: 250,
    servings: 4,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Kenyan meat pies",
    dietary_tags: ["High-Protein"],
    tags: ["pie", "meat", "handheld", "lunch", "pastry"],
    ingredients: [
      { name: "Puff pastry", amount: "1 sheet" },
      { name: "Ground beef", amount: "250g" },
      { name: "Onion", amount: "1 medium" },
      { name: "Carrot", amount: "1 medium" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Finely chop onion, grate carrot, and crush garlic.",
      "Heat oil in a pan, cook onion until soft (3 minutes).",
      "Add garlic, carrot, and ground beef. Cook until browned.",
      "Season with salt and set aside to cool.",
      "Roll puff pastry and cut into 4 squares.",
      "Place meat mixture in center of each, fold and seal edges.",
      "Bake at 200°C for 15-20 minutes until golden."
    ]
  },

  // ==================== VEGETARIAN (10) ====================
  {
    id: "vegetable-chapati",
    name: "Vegetable Chapati Wrap",
    description: "Chapati rolled around spiced vegetables. A portable, satisfying vegetarian meal.",
    category: "Vegetarian",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Vegetable chapati wrap",
    dietary_tags: ["Vegetarian", "High-Fiber"],
    tags: ["vegetarian", "chapati", "wrap", "healthy", "lunch"],
    ingredients: [
      { name: "Chapati", amount: "2 pieces" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Onion", amount: "1 medium" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop onion, crush garlic, and prepare vegetables.",
      "Heat oil in a pan, sauté onion until soft (3 minutes).",
      "Add garlic and vegetables, cook until tender (5 minutes).",
      "Season with salt. Place mixture on chapati and roll.",
      "Serve warm."
    ]
  },
  {
    id: "vegetable-samosa",
    name: "Vegetable Samosa",
    description: "Crispy samosas filled with spiced potatoes and peas. A perfect vegetarian snack.",
    category: "Vegetarian",
    meal_type: "Snack",
    difficulty: "Medium",
    total_time_minutes: 40,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 4,
    image_url: unsplash("1518977676601-b53f82aba655"),
    image_alt: "Vegetable samosas",
    dietary_tags: ["Vegetarian"],
    tags: ["vegetarian", "snack", "samosa", "party", "crispy"],
    ingredients: [
      { name: "Samosa wrappers", amount: "12 pieces" },
      { name: "Potatoes", amount: "3 medium" },
      { name: "Peas", amount: "1/2 cup" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cumin", amount: "1 tsp" },
      { name: "Cooking oil", amount: "for frying" }
    ],
    instructions: [
      "Boil and mash potatoes. Finely chop onion.",
      "Heat oil in a pan, cook onion until soft (3 minutes).",
      "Add cumin, peas, and mashed potatoes. Cook for 5 minutes.",
      "Fill samosa wrappers with the mixture and fold.",
      "Deep fry until golden and crispy (3-4 minutes).",
      "Drain and serve hot."
    ]
  },
  {
    id: "vegetable-pilau",
    name: "Vegetable Pilau",
    description: "Spiced rice with vegetables and chickpeas. A colorful, meat-free version of the classic pilau.",
    category: "Vegetarian",
    meal_type: "Lunch",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 150,
    cost_max_kes: 250,
    servings: 4,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Vegetable pilau",
    dietary_tags: ["Vegetarian", "High-Fiber"],
    tags: ["vegetarian", "pilau", "rice", "spiced", "lunch"],
    ingredients: [
      { name: "Rice", amount: "2 cups" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Chickpeas", amount: "1 cup" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Pilau masala", amount: "2 tsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop onion, crush garlic, and prepare vegetables.",
      "Heat oil in a sufuria, cook onion until golden (5 minutes).",
      "Add garlic and pilau masala, cook 1 minute.",
      "Add vegetables and chickpeas, cook 2 minutes.",
      "Add rice and 4 cups water. Season with salt.",
      "Bring to boil, reduce heat, cover, and cook for 15 minutes.",
      "Fluff and serve hot."
    ]
  },
  {
    id: "lentil-curry-rice",
    name: "Lentil Curry & Rice",
    description: "A warming lentil curry with coconut milk and spices. Comforting, healthy, and affordable.",
    category: "Vegetarian",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 130,
    cost_max_kes: 220,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Lentil curry with rice",
    dietary_tags: ["Vegetarian", "High-Protein", "High-Fiber", "Dairy-Free"],
    tags: ["lentil", "curry", "vegetarian", "healthy", "dinner", "budget"],
    ingredients: [
      { name: "Red lentils", amount: "2 cups" },
      { name: "Rice", amount: "2 cups" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Wash lentils and drain. Chop onion and crush garlic.",
      "Cook rice according to package instructions.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic and curry powder, cook 1 minute.",
      "Add lentils, coconut milk, and 2 cups water.",
      "Season with salt, bring to boil, and simmer for 15 minutes.",
      "Serve curry over rice."
    ]
  },
  {
    id: "bean-burgers",
    name: "Bean & Vegetable Burgers",
    description: "Homemade burgers made from beans and vegetables. A healthy, satisfying meal that's full of flavor.",
    category: "Vegetarian",
    meal_type: "Lunch",
    difficulty: "Medium",
    total_time_minutes: 30,
    cost_min_kes: 140,
    cost_max_kes: 220,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Bean and vegetable burgers",
    dietary_tags: ["Vegetarian", "High-Fiber", "High-Protein"],
    tags: ["burger", "beans", "vegetarian", "healthy", "lunch"],
    ingredients: [
      { name: "Beans (cooked)", amount: "2 cups" },
      { name: "Breadcrumbs", amount: "1 cup" },
      { name: "Onion", amount: "1 small" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Burger buns", amount: "4 pieces" }
    ],
    instructions: [
      "Mash the beans in a bowl. Finely chop onion and crush garlic.",
      "Mix beans with onion, garlic, breadcrumbs, and salt.",
      "Form mixture into 4 patties.",
      "Heat oil in a pan and cook patties for 4-5 minutes on each side until golden.",
      "Serve in burger buns with your favorite toppings."
    ]
  },
  {
    id: "vegetable-stir-fry",
    name: "Vegetable Stir-Fry",
    description: "A colorful stir-fry of fresh vegetables in a light sauce. Quick, healthy, and full of flavor.",
    category: "Vegetarian",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Vegetable stir-fry",
    dietary_tags: ["Vegetarian", "Gluten-Free", "Low-Calorie", "Vegan"],
    tags: ["vegetarian", "stir-fry", "healthy", "quick", "lunch", "vegan"],
    ingredients: [
      { name: "Broccoli", amount: "1 cup" },
      { name: "Bell peppers", amount: "2" },
      { name: "Carrots", amount: "2" },
      { name: "Onion", amount: "1 medium" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Soy sauce", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop vegetables into bite-sized pieces. Crush garlic.",
      "Heat oil in a large pan or wok.",
      "Add garlic and cook for 30 seconds.",
      "Add vegetables and stir-fry for 5-7 minutes until tender-crisp.",
      "Add soy sauce and cook for 1 minute.",
      "Serve hot with rice or noodles."
    ]
  },
  {
    id: "pumpkin-stew",
    name: "Pumpkin & Bean Stew",
    description: "Sweet pumpkin in a savory tomato stew with beans. A unique, satisfying vegetarian meal.",
    category: "Vegetarian",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 35,
    cost_min_kes: 130,
    cost_max_kes: 210,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Pumpkin and bean stew",
    dietary_tags: ["Vegetarian", "High-Fiber", "High-Protein"],
    tags: ["pumpkin", "beans", "stew", "vegetarian", "comfort", "dinner"],
    ingredients: [
      { name: "Pumpkin", amount: "500g" },
      { name: "Beans (cooked)", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Peel and cube pumpkin. Chop onion and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add pumpkin, beans, and 1 cup water.",
      "Season with salt, cover, and cook for 20 minutes until pumpkin is tender.",
      "Serve hot with rice or ugali."
    ]
  },
  {
    id: "mushroom-stroganoff",
    name: "Mushroom Stroganoff",
    description: "A creamy mushroom sauce served over pasta or rice. A rich, satisfying vegetarian meal.",
    category: "Vegetarian",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 150,
    cost_max_kes: 240,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Mushroom stroganoff",
    dietary_tags: ["Vegetarian"],
    tags: ["mushroom", "vegetarian", "creamy", "pasta", "dinner"],
    ingredients: [
      { name: "Mushrooms", amount: "400g" },
      { name: "Onion", amount: "1 medium" },
      { name: "Garlic", amount: "2 cloves" },
      { name: "Cream", amount: "1/2 cup" },
      { name: "Pasta or rice", amount: "for serving" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Slice mushrooms, chop onion, and crush garlic.",
      "Heat oil in a pan, sauté onion until soft (3 minutes).",
      "Add garlic and mushrooms, cook until mushrooms release liquid and brown.",
      "Add cream and season with salt. Simmer for 5 minutes.",
      "Serve over pasta or rice."
    ]
  },
  {
    id: "chickpea-curry",
    name: "Chickpea Curry",
    description: "A flavorful coconut curry with chickpeas and tomatoes. Healthy, protein-packed, and delicious.",
    category: "Vegetarian",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 140,
    cost_max_kes: 220,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Chickpea curry",
    dietary_tags: ["Vegetarian", "High-Protein", "High-Fiber", "Dairy-Free"],
    tags: ["chickpea", "curry", "vegetarian", "healthy", "lunch", "coconut"],
    ingredients: [
      { name: "Chickpeas (cooked)", amount: "2 cups" },
      { name: "Coconut milk", amount: "1 cup" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Curry powder", amount: "1 tbsp" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop onion, crush garlic, and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add garlic and curry powder, cook 1 minute.",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add chickpeas, coconut milk, and 1/2 cup water.",
      "Season with salt, simmer for 10 minutes. Serve with rice."
    ]
  },
  {
    id: "vegetable-lasagna",
    name: "Vegetable Lasagna",
    description: "A hearty vegetable lasagna with layers of vegetables, cheese, and pasta. Comfort food at its best.",
    category: "Vegetarian",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 50,
    cost_min_kes: 180,
    cost_max_kes: 300,
    servings: 6,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Vegetable lasagna",
    dietary_tags: ["Vegetarian"],
    tags: ["vegetarian", "lasagna", "pasta", "cheesy", "comfort", "dinner"],
    ingredients: [
      { name: "Lasagna sheets", amount: "9 pieces" },
      { name: "Zucchini", amount: "2" },
      { name: "Bell peppers", amount: "2" },
      { name: "Tomatoes", amount: "4 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Garlic", amount: "3 cloves" },
      { name: "Cheese", amount: "1 cup" },
      { name: "Cooking oil", amount: "2 tbsp" }
    ],
    instructions: [
      "Chop all vegetables and crush garlic.",
      "Heat oil in a pan, cook onion until soft (3 minutes).",
      "Add garlic and other vegetables, cook until tender.",
      "Add tomatoes and cook into a sauce.",
      "In a baking dish, layer: sauce, lasagna sheets, cheese.",
      "Repeat layers and top with cheese.",
      "Bake at 180°C for 30-35 minutes until golden."
    ]
  },

  // ==================== HIGH-PROTEIN (10) ====================
  {
    id: "grilled-chicken-breast",
    name: "Grilled Chicken Breast with Vegetables",
    description: "Lean grilled chicken breast served with a side of grilled vegetables. A high-protein, low-carb meal.",
    category: "High-Protein",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 350,
    cost_max_kes: 550,
    servings: 2,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Grilled chicken breast with vegetables",
    dietary_tags: ["High-Protein", "Gluten-Free", "Low-Carb"],
    tags: ["high-protein", "chicken", "grilled", "healthy", "low-carb", "dinner"],
    ingredients: [
      { name: "Chicken breast", amount: "2 pieces" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Pepper", amount: "to taste" }
    ],
    instructions: [
      "Season chicken breasts with salt and pepper.",
      "Heat a grill pan or grill to medium-high heat.",
      "Grill chicken for 6-7 minutes on each side until cooked through.",
      "Meanwhile, toss vegetables with oil, salt, and pepper.",
      "Grill vegetables alongside chicken until tender (5-6 minutes).",
      "Serve hot."
    ]
  },
  {
    id: "egg-whites-omelet",
    name: "Egg White Omelet with Vegetables",
    description: "A protein-packed egg white omelet loaded with vegetables. Perfect for a healthy breakfast.",
    category: "High-Protein",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 15,
    cost_min_kes: 100,
    cost_max_kes: 180,
    servings: 2,
    image_url: unsplash("1525351484163-7529414344d8"),
    image_alt: "Egg white omelet with vegetables",
    dietary_tags: ["High-Protein", "Vegetarian", "Gluten-Free", "Low-Calorie"],
    tags: ["high-protein", "omelet", "eggs", "healthy", "breakfast"],
    ingredients: [
      { name: "Egg whites", amount: "6" },
      { name: "Spinach", amount: "1 cup" },
      { name: "Bell peppers", amount: "1 medium" },
      { name: "Onion", amount: "1 small" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop onion, bell pepper, and spinach.",
      "Heat oil in a non-stick pan, sauté onion and peppers until soft.",
      "Add spinach and cook until wilted.",
      "Pour egg whites over vegetables, season with salt.",
      "Cook until set, fold, and serve."
    ]
  },
  {
    id: "tuna-sandwich",
    name: "Tuna & Avocado Sandwich",
    description: "Protein-rich tuna mixed with creamy avocado on whole grain bread. A quick, healthy lunch.",
    category: "High-Protein",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 10,
    cost_min_kes: 180,
    cost_max_kes: 300,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Tuna and avocado sandwich",
    dietary_tags: ["High-Protein"],
    tags: ["high-protein", "tuna", "sandwich", "healthy", "quick", "lunch"],
    ingredients: [
      { name: "Canned tuna", amount: "1 can (in water)" },
      { name: "Avocado", amount: "1 medium" },
      { name: "Whole grain bread", amount: "4 slices" },
      { name: "Lemon juice", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Drain tuna and flake into a bowl.",
      "Mash avocado and add to tuna with lemon juice and salt.",
      "Mix well and spread on bread slices.",
      "Serve immediately."
    ]
  },
  {
    id: "protein-smoothie",
    name: "Kenyan Protein Smoothie",
    description: "A high-protein smoothie with local ingredients: bananas, groundnuts, and yoghurt.",
    category: "High-Protein",
    meal_type: "Breakfast",
    difficulty: "Easy",
    total_time_minutes: 5,
    cost_min_kes: 90,
    cost_max_kes: 160,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Protein smoothie",
    dietary_tags: ["High-Protein", "Vegetarian", "Gluten-Free"],
    tags: ["high-protein", "smoothie", "breakfast", "quick", "healthy"],
    ingredients: [
      { name: "Banana", amount: "2 ripe" },
      { name: "Peanut butter", amount: "2 tbsp" },
      { name: "Yoghurt", amount: "1 cup" },
      { name: "Milk", amount: "1 cup" },
      { name: "Honey", amount: "optional" }
    ],
    instructions: [
      "Peel bananas and break into chunks.",
      "Place all ingredients in a blender.",
      "Blend until smooth and creamy.",
      "Pour into glasses and serve immediately."
    ]
  },
  {
    id: "beans-ugali-protein",
    name: "Beans & Ugali (High-Protein)",
    description: "A classic meal with a protein focus: beans in a tomato sauce served with ugali.",
    category: "High-Protein",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 30,
    cost_min_kes: 120,
    cost_max_kes: 200,
    servings: 4,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Beans and ugali",
    dietary_tags: ["High-Protein", "Vegetarian", "Gluten-Free"],
    tags: ["high-protein", "beans", "ugali", "traditional", "dinner"],
    ingredients: [
      { name: "Beans (cooked)", amount: "3 cups" },
      { name: "Maize flour", amount: "2 cups" },
      { name: "Tomatoes", amount: "3 medium" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Chop onion and dice tomatoes.",
      "Heat oil in a sufuria, sauté onion until soft (3 minutes).",
      "Add tomatoes and cook until saucy (5 minutes).",
      "Add beans and 1/2 cup water, season with salt.",
      "Simmer for 5 minutes.",
      "Prepare ugali: boil 3 cups water, add maize flour gradually while stirring.",
      "Serve beans with ugali."
    ]
  },
  {
    id: "chicken-salad",
    name: "Grilled Chicken Salad",
    description: "A fresh, high-protein salad with grilled chicken, greens, and a light dressing.",
    category: "High-Protein",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 300,
    cost_max_kes: 500,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Grilled chicken salad",
    dietary_tags: ["High-Protein", "Gluten-Free", "Low-Carb"],
    tags: ["high-protein", "chicken", "salad", "healthy", "light", "lunch"],
    ingredients: [
      { name: "Chicken breast", amount: "1 piece" },
      { name: "Mixed greens", amount: "4 cups" },
      { name: "Tomatoes", amount: "2 medium" },
      { name: "Olive oil", amount: "2 tbsp" },
      { name: "Lemon juice", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Season chicken breast with salt and grill until cooked through.",
      "Let rest, then slice thinly.",
      "In a bowl, toss greens and diced tomatoes.",
      "Whisk olive oil and lemon juice for dressing.",
      "Top greens with chicken, drizzle with dressing, and serve."
    ]
  },
  {
    id: "fish-protein",
    name: "Pan-Seared Fish",
    description: "Crispy-skinned fish fillet served with vegetables. A high-protein, omega-3-rich meal.",
    category: "High-Protein",
    meal_type: "Dinner",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 280,
    cost_max_kes: 450,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Pan-seared fish with vegetables",
    dietary_tags: ["High-Protein", "Gluten-Free", "Low-Carb"],
    tags: ["high-protein", "fish", "seared", "healthy", "dinner"],
    ingredients: [
      { name: "Fish fillet", amount: "2 pieces" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Pepper", amount: "to taste" }
    ],
    instructions: [
      "Season fish with salt and pepper on both sides.",
      "Heat oil in a pan over medium-high heat.",
      "Pan-sear fish for 3-4 minutes on each side until golden and cooked.",
      "Meanwhile, steam or sauté the vegetables.",
      "Serve fish with vegetables."
    ]
  },
  {
    id: "protein-bowl",
    name: "High-Protein Bowl",
    description: "A bowl of protein-packed foods: eggs, beans, and vegetables. Perfect for athletes.",
    category: "High-Protein",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 20,
    cost_min_kes: 150,
    cost_max_kes: 250,
    servings: 2,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "High-protein bowl",
    dietary_tags: ["High-Protein", "Vegetarian", "Gluten-Free"],
    tags: ["high-protein", "bowl", "healthy", "meal-prep", "athlete"],
    ingredients: [
      { name: "Eggs", amount: "4" },
      { name: "Beans (cooked)", amount: "1 cup" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Boil eggs for 10 minutes, cool, peel, and quarter.",
      "Heat oil in a pan, sauté vegetables until tender.",
      "Add beans and cook for 3 minutes.",
      "Divide vegetables and beans between bowls.",
      "Top with boiled eggs and serve."
    ]
  },
  {
    id: "beef-protein",
    name: "Beef & Vegetable Skewers",
    description: "Grilled beef skewers with colorful vegetables. A high-protein, fun meal for sharing.",
    category: "High-Protein",
    meal_type: "Dinner",
    difficulty: "Medium",
    total_time_minutes: 35,
    cost_min_kes: 350,
    cost_max_kes: 550,
    servings: 3,
    image_url: unsplash("1512058564366-18510be2db19"),
    image_alt: "Beef and vegetable skewers",
    dietary_tags: ["High-Protein", "Gluten-Free"],
    tags: ["high-protein", "beef", "skewers", "grilled", "dinner"],
    ingredients: [
      { name: "Beef", amount: "300g" },
      { name: "Bell peppers", amount: "3" },
      { name: "Onion", amount: "1 large" },
      { name: "Cooking oil", amount: "2 tbsp" },
      { name: "Salt", amount: "to taste" },
      { name: "Pepper", amount: "to taste" }
    ],
    instructions: [
      "Cut beef and vegetables into chunks.",
      "Thread onto skewers, alternating meat and vegetables.",
      "Season with salt and pepper.",
      "Grill over medium-high heat for 8-10 minutes, turning often.",
      "Serve hot."
    ]
  },
  {
    id: "quinoa-beans",
    name: "Quinoa & Beans",
    description: "A superfood bowl of quinoa and beans, packed with complete protein. Perfect for health-conscious eaters.",
    category: "High-Protein",
    meal_type: "Lunch",
    difficulty: "Easy",
    total_time_minutes: 25,
    cost_min_kes: 200,
    cost_max_kes: 350,
    servings: 3,
    image_url: unsplash("1512621776951-a57141f2eefd"),
    image_alt: "Quinoa and beans",
    dietary_tags: ["High-Protein", "Vegetarian", "Gluten-Free"],
    tags: ["high-protein", "quinoa", "beans", "superfood", "healthy", "lunch"],
    ingredients: [
      { name: "Quinoa", amount: "1 cup" },
      { name: "Beans (cooked)", amount: "2 cups" },
      { name: "Mixed vegetables", amount: "2 cups" },
      { name: "Onion", amount: "1 medium" },
      { name: "Cooking oil", amount: "1 tbsp" },
      { name: "Salt", amount: "to taste" }
    ],
    instructions: [
      "Cook quinoa according to package instructions.",
      "Chop onion and prepare vegetables.",
      "Heat oil in a pan, sauté onion until soft (3 minutes).",
      "Add vegetables and cook for 5 minutes.",
      "Add beans and cook for 3 minutes.",
      "Combine with quinoa, season with salt, and serve."
    ]
  }
];

// Helper to get total count
export const totalRecipes = recipes.length; // 71