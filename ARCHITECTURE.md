# Chakula — System Documentation

## 1. Product overview

Chakula is a Kenyan food decision app. It helps an authenticated user decide what to cook, discover familiar meals, match recipes to pantry ingredients, plan weekday meals, save favorites, build a shopping list, and enter a step-by-step cook mode.

The app now uses Supabase Auth, Postgres, and private Supabase Storage for authentication, synchronized user preferences, a database-backed recipe catalogue, reviews, feedback, sharing, dietary profiles, meal plans, and user-owned recipe photos. The client consumes published recipes through `/api/recipes`; user-owned state is loaded from and persisted to Supabase after login. Custom images are uploaded through a server route to the private `recipe-images` bucket and the returned signed URL is saved in the user preference record.

## 2. Technology stack

- Next.js 16.3 App Router
- React 19
- TypeScript 5.7
- Tailwind CSS v4 with `@tailwindcss/postcss`
- shadcn-compatible project setup and Base UI dependency
- Lucide React for icons
- Vercel Analytics in production
- pnpm package management

The main runtime entry point is `app/page.tsx`, which renders the client component `FoodApp`.

## 3. Repository structure

```text
app/
  page.tsx              # Root route; renders authenticated FoodApp
  login/page.tsx        # Supabase email/password sign-in
  layout.tsx             # HTML shell, fonts, metadata, viewport, analytics
  globals.css           # Theme tokens and shared utility classes
  components/
    food-app.tsx         # Current client composition/controller (legacy view shell)
    sidebar.tsx          # Desktop sidebar and mobile navigation drawer
    ui/button.tsx        # shadcn/Base UI button primitive
  app/api/
    recipe-images/route.ts # Authenticated image upload/delete API
    recipes/route.ts       # Published recipe search/filter API
    pantry/route.ts        # Authenticated pantry CRUD API
    shopping/route.ts      # Authenticated shopping CRUD API
    preferences/route.ts   # Authenticated preference synchronization API
    plans/route.ts         # Meal plan API
    reviews/route.ts       # Recipe review API
    shared-plans/route.ts  # Shared-plan API
  lib/
    recipes.ts             # Recipe types, database mapping, and compatibility helpers
    recommendations.ts    # Recipe matching and ranking logic
    image-overrides.ts     # Image resolver and Storage reference helpers
    supabase/              # Browser, server, and session-refresh clients
    utils.ts               # Shared class-name utility
public/images/
  *.png                 # Generated meal-specific local images
```

## 4. Runtime architecture

### App shell

`FoodApp` is the single client-side application controller. It owns the current view, selected recipe, recommendation result, favorites, history, pantry, shopping list, theme, reminders, mobile drawer state, search/filter state, and custom image overrides.

The shell renders:

1. `Sidebar` for navigation and theme controls.
2. A sticky top header with mobile menu, reminders, and shopping-list actions.
3. A main content region that switches between feature views based on the `view` state.

This is client-side view switching rather than URL-based routing. Navigation is represented by the `View` union type:

```ts
type View = 'home' | 'surprise' | 'browse' | 'pantry' | 'planner' | 'meals' | 'shopping'
```

Recipe detail is opened as an in-app stateful surface from a selected recipe.

### Responsive behavior

- Desktop/tablet: fixed 18rem sidebar and main content padding.
- Small screens: sidebar is hidden off-canvas and opened with the menu button.
- The menu and close controls use the `mobile-only-control` class and are hidden at `min-width: 768px`.
- Layouts use mobile-first flex/grid utilities and responsive breakpoints for cards, detail views, and planner content.

## 5. Feature modules

### Home dashboard

The dashboard provides the primary decision shortcuts:

- Surprise Me: ranks recipes using budget, time, pantry, and meal-period preferences.
- Explore: opens the searchable recipe catalogue.
- Pantry matches: opens ingredient matching.
- Quick picks: shows selected recipes.
- Reminder controls: enable or disable morning, lunch, and evening reminders.

### Explore

Explore filters the typed recipe catalogue by search text and category. Each recipe card shows:

- Meal image
- Category and meal type
- Name and description
- Time, cost, and difficulty
- Favorite toggle

Cards open the recipe detail surface. Image rendering goes through the shared `recipeImage()` resolver so custom photos can replace defaults.

### Pantry matching

The user enters ingredients into the authenticated `user_pantry_items` list through `/api/pantry`. `matchRecipe()` compares pantry items with each published recipe’s ingredients and returns matches with:

- Match score
- Ingredients already available
- Missing ingredients

The user can add missing ingredients to the shopping list.

### Surprise Me

The recommendation UI exposes budget, maximum cooking time, and meal type. `rankRecipes()` scores the catalogue and returns the best match with an explanation. The result can be opened, cooked, or replaced with another recommendation.

### Recipe detail and Cook Mode

Recipe detail presents the meal image, description, tags, cost, time, difficulty, servings, ingredients, equipment, tips, and instructions. The user can:

- Favorite the recipe.
- Add ingredients to shopping.
- Mark the recipe as cooked.
- Open Cook Mode.
- Change or reset the recipe photo.

Cook Mode focuses on one instruction at a time with progress and navigation controls.

### Planner

Planner is backed by the `user_meal_plans` table and the `/api/plans` route. The current UI still presents a compact weekday surface while the backend supports dated, user-owned plan records; catalogue defaults are only used for empty-state suggestions and are not written as user data. Planner cards use the same image resolver as Explore so meal/image associations remain consistent.

### My Meals

My Meals combines favorite recipes and recently cooked recipes. History is de-duplicated and capped by the app’s state logic.

### Shopping list

Cooking a recipe adds its ingredients to the shopping list. Items can be checked in the UI or removed. The list is stored locally.

## 6. Recipe data model

`lib/recipes.ts` defines the canonical `Recipe` type:

```ts
type Recipe = {
  id: string
  name: string
  description: string
  category: string
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'
  ingredients: Ingredient[]
  instructions: string[]
  prepTime: number
  cookTime: number
  totalTime: number
  servings: number
  difficulty: 'Easy' | 'Medium'
  estimatedCost: { min: number; max: number }
  equipment: string[]
  image: string
  tags: string[]
  dietaryInfo: string[]
  popularity: number
}
```

The catalogue includes Kenyan and everyday meals such as Ugali & Sukuma Wiki, Beans & Rice, Ndengu & Rice, Fried Githeri, Rolex, Matoke, Omena & Ugali, Pilau, Chapati & Beans, and quick breakfast/pantry meals.

Images are either meal-specific local generated assets under `public/images` or external image URLs. The three strongest corrected mappings are:

- `ugali-sukuma` → `/images/ugali-sukuma.png`
- `beans-rice` → `/images/beans-rice.png`
- `ndengu-rice` → `/images/ndengu-rice.png`

## 7. Image system

`lib/image-overrides.ts` is the image customization layer.

### Default images

Each recipe owns a default `image` value. Local generated images are preferred where a previous external image was misleading.

### Custom images

On recipe detail, `Change photo` opens a browser file picker. The client sends the selected image to `POST /api/recipe-images` as multipart form data. The route verifies the Supabase session, validates the recipe ID, MIME type, and 8MB size limit, uploads to the private `recipe-images` bucket under `{user_id}/{recipe_id}.{extension}`, and returns a signed URL. That URL is stored in `user_preferences.image_overrides` and used across the app. `Reset` restores the catalogue default; stored objects are private and user-scoped.

The `SUPABASE_SERVICE_ROLE_KEY` is used only inside the server route and is never exposed to the browser. The route also creates the private bucket if it is absent, which makes development resilient when Storage setup has not completed.

### Shared resolution

All image-aware surfaces should call:

```ts
recipeImage(recipe, overrides)
```

Alt text is generated with `imageAlt()`, including a custom-photo note when applicable. This prevents a user’s custom image from being silently treated as the catalogue default.

## 8. Persistence and synchronization

Supabase is the source of truth for authenticated user data. The current client shell hydrates preferences through `/api/preferences` and synchronizes changes after authentication. Normalized APIs are available for pantry and shopping records, while the remaining shell state is being migrated from the legacy JSON preference row into dedicated tables.

| Data | Current backend location | Direction |
| --- | --- | --- |
| Theme and reminders | `user_preferences` | API-backed |
| Favorites | `user_favorite_recipes` and compatibility preference fields | API-backed migration |
| Pantry | `user_pantry_items` and compatibility preference fields | API-backed migration |
| Shopping | `user_shopping_items` and compatibility preference fields | API-backed migration |
| Cooking history | `user_recipe_history` and compatibility preference fields | API-backed migration |
| Custom image references | `user_preferences.image_overrides` | API-backed; Storage objects remain private |

`localStorage` is not a persistence boundary. Any browser storage used for theme bootstrapping or hydration fallback is treated as a temporary compatibility cache and must not be relied upon for user data.

## 9. Reminder behavior

The app checks the current browser hour and selects a period:

- Before 11:00 → morning
- 11:00–15:59 → lunch
- 16:00 onward → evening

If the corresponding reminder is enabled, an in-app notice is shown. The current implementation does not implement a service worker, push subscription, email, SMS, or background notification delivery.

## 10. Design system

The interface uses a warm Kenyan food editorial direction:

- Primary dark coffee/charcoal tone
- Warm off-white background
- Terracotta/orange accent
- Muted warm neutrals
- `DM Serif Display` for expressive headings
- `DM Sans` for body and interface text

The theme is defined with semantic CSS variables in `app/globals.css`. Components use tokens such as `bg-background`, `text-foreground`, `bg-card`, `bg-accent`, and `border-border` rather than hardcoded utility colors.

The design uses rounded cards, food photography, compact eyebrow labels, large serif headings, responsive grids, focus-visible outlines, and reduced-motion support.

## 11. Accessibility and UX

- Semantic `header`, `main`, `nav`, `button`, `label`, and list structures are used.
- Navigation exposes `aria-current` for the active page.
- Mobile open/close controls include accessible labels.
- Images include descriptive alt text where meaningful.
- File upload is visually hidden but available through a labeled control.
- Focus-visible states use a high-contrast accent outline.
- Reduced-motion users receive shortened transitions and animations.
- Buttons are keyboard operable through native button semantics.

## 12. Supabase backend and authentication

Supabase is the backend boundary for identity and user-owned application state.

### Authentication

- `lib/supabase/client.ts` creates the browser client using the project URL and publishable/anon key.
- `lib/supabase/server.ts` creates the server client using request cookies.
- `lib/supabase/proxy.ts` refreshes Supabase sessions; the root `proxy.ts` delegates to it.
- `/login` uses email/password authentication with `signInWithPassword()` and redirects authenticated users to `/`.
- The root `FoodApp` checks `auth.getUser()` on mount and redirects unauthenticated visitors to `/login`.
- The approved account is email-confirmed in Supabase Auth: `shemmcollins@gmail.com`. It is promoted to admin through server-managed `raw_app_meta_data.role = 'admin'`; its password is intentionally not documented in source control.
- Registration, login, email confirmation, password recovery, and reset are real Supabase Auth flows. No demo credentials or client-only accounts are used.

### Admin workspace

- `/admin` is protected by both the page APIs and `requireAdmin()`, which reads the server-managed `app_metadata` role. Client metadata is never trusted for authorization.
- Admins can create, edit, publish/unpublish, and delete recipes in the database, and view registered user email/confirmation/role status. This keeps the catalogue maintainable without code deployments and gives the team visibility into account health.
- A newly promoted admin must sign out and sign back in so the refreshed Supabase JWT carries the new app metadata claim. The admin API uses the server-only service key only after this authorization check.

### Database schema

The migration `create_chakula_user_data` creates:

- `public.profiles`: one profile per auth user, linked to `auth.users(id)` with cascade deletion.
- `public.user_preferences`: one row per user containing favorites, cooking history, pantry, shopping list, reminders, image overrides, and `updated_at`.
- `public.user_meal_plans`: user-owned dated recipe plan rows with a unique `(user_id, plan_date)` constraint.

A database trigger creates the profile and default preferences row whenever a new Supabase Auth user is created.

### Security model

All three public tables have Row Level Security enabled. Policies restrict reads and writes to rows where `auth.uid()` equals the row owner (`profiles.id` or `user_preferences.user_id` / `user_meal_plans.user_id`). The service-role key is used only for one-time development provisioning and is never imported into browser code. Runtime browser access uses the publishable/anon key and Supabase session cookies, with RLS enforcing ownership.

### Data synchronization

After authentication, `FoodApp` loads `user_preferences` for the current user. Any changes to favorites, history, pantry, shopping, reminders, or image overrides are upserted back to that user’s preference row. This gives the app cross-session and cross-device synchronization for structured preferences. The bundled recipe catalogue remains read-only application data.

Custom recipe images remain data URLs in the preference JSON and are not uploaded to Supabase Storage yet. They can become large; the production follow-up is to add Storage with per-user object paths and Storage RLS policies.

The app now has a server-side trust boundary for authentication, preference persistence, normalized user data APIs, and private image uploads. Signed URLs are runtime delivery artifacts; the durable reference should be a Storage object path so URLs can be regenerated when they expire. The current compatibility field may contain returned URLs from earlier versions and should be migrated to object paths during the image-system cleanup.

## 13. Build and run

Available scripts from `package.json`:

```bash
pnpm dev       # Start Next.js development server
pnpm build     # Create a production build
pnpm start     # Serve the production build
pnpm lint      # Run ESLint
```

The project has been validated with a successful Next.js production build and browser preview checks for responsive navigation, Explore, Planner, meal images, and custom image controls.

## 14. Remaining production roadmap

The core authentication and preference backend is now connected. Recommended next steps are:

1. Persist Planner changes through `user_meal_plans` instead of deriving the menu only from local history.
2. Move custom images to Supabase Storage with per-user paths, size/type validation, and Storage RLS.
3. Add password reset, account settings, and optional sign-up through a controlled flow.
4. Convert in-app view state to URL routes for deep linking and browser history.
5. Add scheduled notifications through a server-side job or notification provider.
6. Add observability, automated tests, rate limiting, and error reporting.

Current mental model: an authenticated, multi-session Kenyan meal planning app. Recipes are bundled read-only content; identity and structured user preferences are stored securely in Supabase; custom image binary data remains device-local until Storage is added.
