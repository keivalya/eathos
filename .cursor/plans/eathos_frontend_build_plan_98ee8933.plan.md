---
name: Eathos Frontend Build Plan
overview: Transform the existing "FridgeChef" React scaffold into the fully-branded "Eathos" application, implementing all user story flows (onboarding, fridge scanning, recipe generation, inventory management, meal tracking, end-of-day recap) with the Eathos "Citrus & Cream" brand identity, bold health-focused design, and the complete UX choreography from the sprint plan.
todos:
  - id: task-01
    content: "Update index.css design tokens to Eathos brand colors and fonts (Lime #6AAB5E, Blood Orange #E05A2B, Berry #C4446A, Cormorant Garamond, Playfair Display, DM Sans)"
    status: completed
  - id: task-02
    content: Rename FridgeChef to Eathos in AppShell, index.html title, all references
    status: completed
  - id: task-03
    content: Update all 7 component CSS files to use new Eathos brand tokens
    status: completed
  - id: task-04
    content: Create EathosLogo SVG component from brand guidelines leaf icon
    status: completed
  - id: task-05
    content: "Add onboarding state machine (phases: welcome, auth, intake, fridge capture, grocery prefs, generating) with localStorage persistence"
    status: completed
  - id: task-06
    content: Build WelcomeScreen component -- logo, tagline, Get Started CTA
    status: completed
  - id: task-07
    content: Build IntakeForm component -- stepped profile/dietary/goals/meal-preferences form
    status: completed
  - id: task-08
    content: Build FridgeCapture component -- multi-photo upload for fridge/pantry/receipt
    status: completed
  - id: task-09
    content: Build GroceryPrefs component -- two-card selection for shopping willingness
    status: completed
  - id: task-10
    content: Build PlanGenerating loading screen with staged narrative messages
    status: completed
  - id: task-11
    content: Install react-router-dom and add routes (/, /onboarding, /scan, /inventory, /recipe, /shopping, /tracker, /recap)
    status: completed
  - id: task-12
    content: Build HomePage component -- greeting, 3 entry-point cards, recent activity
    status: completed
  - id: task-13
    content: Build BottomNav mobile navigation component
    status: completed
  - id: task-14
    content: Update AppShell with desktop nav links, user greeting, BottomNav integration
    status: completed
  - id: task-15
    content: Add time-aware greeting and meal-type suggestions to scan/recipe flow
    status: completed
  - id: task-16
    content: Enhance RecipeCard with video link, meal logging CTA, Eathos brand styling
    status: completed
  - id: task-17
    content: Build MealLogger component -- photo capture and meal confirmation after cooking
    status: completed
  - id: task-18
    content: Build QuickLog component -- simple form for takeout/snack/impromptu meal logging
    status: completed
  - id: task-19
    content: Add localStorage persistence for inventory with quantity tracking and freshness aging
    status: completed
  - id: task-20
    content: Build ShoppingList component -- categorized items, checkboxes, Instacart placeholder, receipt upload
    status: completed
  - id: task-21
    content: Build RestockAlert banner component for low-inventory warnings on Home page
    status: completed
  - id: task-22
    content: Build ReceiptUpload component for post-shopping inventory update
    status: completed
  - id: task-23
    content: Build MealTracker component -- daily timeline view with running macro totals
    status: completed
  - id: task-24
    content: Build DailySummary component -- end-of-day calorie/macro breakdown with progress bars
    status: completed
  - id: task-25
    content: Build EndOfDayRecap questionnaire component -- 3 wellness questions with tappable option cards
    status: completed
  - id: task-26
    content: Build ProgressTracker component -- weekly/monthly trends from recap responses
    status: completed
  - id: task-27
    content: Implement all error states and recovery UX per failure choreography spec
    status: completed
  - id: task-28
    content: "Visual polish pass: audit fonts, colors, spacing, mobile responsiveness at 375px and 1440px, console silence"
    status: completed
isProject: false
---

# Eathos Frontend Build Plan

## Current State

The frontend at `[frontend/](frontend/)` is a **functional React 19 + Vite scaffold** named "FridgeChef" with:

- 6 components: AppShell, PhotoUploader, InventoryGrid, RecipeCard, AgentTraceTimeline, DietaryPreferencesModal
- A design token system in `[frontend/src/index.css](frontend/src/index.css)` using Elena Vasquez's palette (cream, charcoal, terracotta, forest, amber)
- A state machine in `[frontend/src/App.jsx](frontend/src/App.jsx)` with phases: upload, analyzing, inventory, generating, recipe, accepting, accepted
- API integration in `[frontend/src/api.js](frontend/src/api.js)` pointing to `localhost:8000`
- No router (phases managed via state), no Tailwind (plain CSS with tokens), no onboarding flow

## Gap Analysis: What Needs to Change

The user stories in `[userstories.txt](userstories.txt)` require features the current codebase does **not** have:

1. **Rebrand to "Eathos"** -- app currently says "FridgeChef" everywhere
2. **Apply Eathos brand identity** from `[BrandingGuidelines.txt](BrandingGuidelines.txt)` -- the current palette (cream/terracotta/forest) is Elena's spec, not the Eathos brand (Lime green `#6AAB5E`, Blood Orange `#E05A2B`, Berry `#C4446A`, Saffron `#E8D44A`, fonts: Cormorant Garamond, Playfair Display, DM Sans)
3. **Onboarding flow** -- welcome screen, Google auth, intake form (dietary restrictions, nutrition goals, meal preferences), fridge photo capture, grocery openness question, loading/generation screen
4. **Home page with entry points** -- Meal/Recipe Generator, Shopping List, Meal Tracker/History
5. **Meal/Recipe Generator enhancements** -- time-of-day greeting, schedule awareness, video tutorial links, meal logging with photo
6. **Inventory/Shopping List Manager** -- persistent inventory, restock alerts, Instacart integration placeholder, receipt upload
7. **Meal and Milestone Tracking** -- daily meal log, end-of-day calorie/macro summary, progress tracker
8. **End-of-Day Recap** -- 3-question check-in (energy/mood, satisfaction, physical response)
9. **Wellness coach persona** -- positive, encouraging, data-driven tone throughout the UI

---

## Implementation Plan (28 Small Tasks)

Each task is a small, self-contained component or change. Tasks are ordered so each builds on the previous.

### Phase 1: Rebrand and Design System Update (4 tasks)

**Task 1 -- Update Design Tokens to Eathos Brand**

Update `[frontend/src/index.css](frontend/src/index.css)` CSS variables to match the Eathos brand from `[BrandingGuidelines.txt](BrandingGuidelines.txt)`:

- `--color-primary: #6AAB5E` (Lime green)
- `--color-primary-dark: #4A8040`
- `--color-primary-light: #A8D4A0`
- `--color-primary-wash: #EEF7EC`
- `--color-accent: #E05A2B` (Blood Orange)
- `--color-berry: #C4446A`
- `--color-lemon: #E8D44A`
- `--color-surface: #F2F0EC`
- `--color-bg-warm: #F8F7F4`
- `--color-ink: #2A2520`
- `--color-ink-mid: #5A534A`
- `--color-ink-light: #9A9088`
- `--font-display: 'Cormorant Garamond', serif`
- `--font-heading: 'Playfair Display', serif`
- `--font-body: 'DM Sans', sans-serif`

Add Google Fonts import for Cormorant Garamond and Playfair Display. Keep the existing spacing, radius, shadow, and animation tokens.

**Task 2 -- Rename FridgeChef to Eathos Everywhere**

- `[frontend/src/components/AppShell.jsx](frontend/src/components/AppShell.jsx)`: change "FridgeChef" to "Eathos", swap UtensilsCrossed icon for the Eathos leaf SVG logo from brand guidelines
- `[frontend/index.html](frontend/index.html)`: update `<title>` to "Eathos -- AI Wellness Coach"
- Update all component CSS files to use new token names

**Task 3 -- Update All Component CSS to Use New Brand Tokens**

Sweep through all 7 CSS files, replacing old color references (`--color-cream`, `--color-forest`, `--color-terracotta`, `--color-charcoal`) with the new Eathos token names. Update font-family references.

**Task 4 -- Add Eathos Logo SVG Component**

Create a reusable `EathosLogo` component from the leaf SVG in the brand guidelines (lines 236-248 of `BrandingGuidelines.txt`). Use it in the header, onboarding, and loading screens.

---

### Phase 2: Onboarding Flow (6 tasks)

**Task 5 -- Create Onboarding State Machine**

Add onboarding phases to the reducer in `[frontend/src/App.jsx](frontend/src/App.jsx)`: `welcome`, `auth`, `intake_profile`, `intake_dietary`, `intake_goals`, `intake_fridge`, `intake_grocery_prefs`, `generating_plan`. Add a `hasOnboarded` flag in state (persisted to localStorage).

**Task 6 -- Welcome Screen Component**

New component `WelcomeScreen.jsx`: Eathos logo (large), tagline "Eat with intention.", brief explanation of what the app does (wellness coach persona), "Get Started" button. Bold, full-viewport design with radial gradient background using primary-wash colors.

**Task 7 -- Profile Intake Form Component**

New component `IntakeForm.jsx` with stepped sections:

- Step 1: Name, birthday, gender, weight, BMI (from user stories data points table)
- Step 2: Dietary restrictions / food sensitivities (multi-select chips + free text)
- Step 3: Nutrition goals (free text)
- Step 4: Meal preferences (breakfast/lunch/dinner/snacks toggles and preferences)

Use a progress bar at the top. Each step slides in from right. Save to state on completion.

**Task 8 -- Fridge/Pantry Photo Capture Component**

New component `FridgeCapture.jsx`: enhanced version of PhotoUploader specifically for onboarding. Supports multiple photos (fridge, pantry, receipt). Shows thumbnails of captured photos. "Continue" button when at least one photo is uploaded.

**Task 9 -- Grocery Preferences Screen**

New component `GroceryPrefs.jsx`: "Are you open to shopping for additional groceries, or would you prefer to use what you already have?" Two large cards: "Use What I Have" and "Open to Shopping". Selection stored in state.

**Task 10 -- Plan Generation Loading Screen**

New component `PlanGenerating.jsx`: full-screen loading with Eathos brand. Staged narrative messages: "Analyzing your ingredients..." -> "Understanding your goals..." -> "Crafting your personalized plan..." -> transition to Home. Uses the wellness coach tone.

---

### Phase 3: Home Page and Navigation (4 tasks)

**Task 11 -- Add React Router**

Install `react-router-dom`. Add routes:

- `/` -- Home (post-onboarding)
- `/onboarding` -- Onboarding flow
- `/scan` -- Fridge scan (existing PhotoUploader flow)
- `/inventory` -- Inventory review
- `/recipe` -- Recipe display
- `/shopping` -- Shopping list
- `/tracker` -- Meal tracker/history
- `/recap` -- End-of-day recap

Update `[frontend/src/App.jsx](frontend/src/App.jsx)` to use RouterProvider. Preserve existing state machine but route between views.

**Task 12 -- Home Page Component**

New component `HomePage.jsx`: 

- Greeting section: "Good [morning/afternoon/evening], [Name]" with wellness-coach encouragement
- Three main entry point cards (from user stories):
  - "Meal & Recipe Generator" -- primary card, large, Lime green accent
  - "Shopping List" -- secondary card, Blood Orange accent
  - "Meal Tracker" -- secondary card, Berry accent
- Recent activity summary (last meal logged, inventory status)
- The slogan "Eat with intention." subtly at the bottom

**Task 13 -- Bottom Navigation Bar (Mobile)**

New component `BottomNav.jsx`: mobile-only bottom navigation with 4 icons: Home, Scan, Tracker, Profile. Uses Eathos brand colors. Active state uses primary green fill.

**Task 14 -- Update AppShell for Navigation**

Update `[frontend/src/components/AppShell.jsx](frontend/src/components/AppShell.jsx)`:

- Desktop: add a sidebar or top-nav with links to Home, Scan, Shopping, Tracker
- Mobile: integrate BottomNav
- Keep preferences icon in header
- Add user greeting in header (from onboarding data)

---

### Phase 4: Enhanced Meal/Recipe Generator (4 tasks)

**Task 15 -- Time-Aware Greeting and Suggestions**

Update the recipe flow to include time-of-day awareness. Before showing the photo upload, show a contextual greeting: "What's for [breakfast/lunch/dinner]?" based on current time. Suggest quick vs. cook-from-scratch based on inferred schedule.

**Task 16 -- Enhanced Recipe Card with Video Link**

Update `[frontend/src/components/RecipeCard.jsx](frontend/src/components/RecipeCard.jsx)`:

- Add a "Watch Prep" button/link (placeholder for video tutorial)
- Add meal logging CTA after acceptance: "Log this meal" button
- Add photo capture for logging: camera icon to photograph the cooked meal
- Style with Eathos brand (Playfair Display for recipe titles, Lime green step numbers)

**Task 17 -- Meal Logging Flow**

New component `MealLogger.jsx`:

- Triggered after "Let's Cook!" acceptance
- Photo capture of the prepared meal
- Confirmation of what was eaten (auto-populated from recipe)
- Save to meal history in state

**Task 18 -- Takeout/Snack Quick-Log**

New component `QuickLog.jsx`:

- Simple form for logging non-recipe meals: takeout, snacks, impromptu meals
- Text input for what was eaten, optional photo
- Quick macro estimate (can be expanded later with AI)

---

### Phase 5: Inventory and Shopping List (4 tasks)

**Task 19 -- Persistent Inventory State**

Add localStorage persistence for inventory. Track item quantities across meals. When a recipe is accepted, deduct used ingredients from inventory. Show inventory age/freshness tracking.

**Task 20 -- Shopping List Component**

New component `ShoppingList.jsx`:

- Generated from inventory gaps and upcoming meal plans
- Items categorized by store aisle
- Checkbox to mark items as purchased
- "Order via Instacart" button (placeholder/link)
- Receipt upload to update inventory after shopping

**Task 21 -- Restock Alert Banner**

New component `RestockAlert.jsx`:

- Shown on Home page when inventory is projected to deplete within 3 days
- Lists specific low items
- CTA: "Review Shopping List" button
- Uses amber/warning styling from brand

**Task 22 -- Receipt Upload and Inventory Update**

New component `ReceiptUpload.jsx`:

- Camera/upload interface for grocery receipts
- Stores receipt image (backend would parse it)
- Manual confirmation of items added to inventory

---

### Phase 6: Meal Tracking and End-of-Day Recap (4 tasks)

**Task 23 -- Daily Meal Tracker View**

New component `MealTracker.jsx`:

- Timeline view of today's meals (breakfast, lunch, dinner, snacks)
- Each meal card shows: name, photo thumbnail, time, macro summary
- Running daily totals: calories, protein, carbs, fat, fiber
- Uses Eathos brand cards with Lime/Berry/Orange accents

**Task 24 -- End-of-Day Summary**

New component `DailySummary.jsx`:

- Total calories, fiber, fats, protein for the day
- Visual progress bars using brand colors
- Comparison to goals (from onboarding intake)
- Encouraging wellness-coach-tone message

**Task 25 -- End-of-Day Recap Questionnaire**

New component `EndOfDayRecap.jsx`:

- Three questions (from user stories lines 114-130):
  1. "How did your energy and mood hold up today?" (4 options)
  2. "How well did the meals keep you satisfied?" (4 options)
  3. "How did your body respond to today's meals?" (4 options)
- Selection UI: large, tappable option cards with icons
- Save responses to state for progress tracking

**Task 26 -- Progress Tracker View**

New component `ProgressTracker.jsx`:

- Weekly/monthly view of recap responses
- Trends in energy, satisfaction, and physical response
- Simple bar charts or dot plots using brand colors
- Encouraging messages based on trends

---

### Phase 7: Polish and Hardening (2 tasks)

**Task 27 -- Error States and Recovery UX**

Update all components with branded error states (per Elena's failure choreography):

- Photo upload failure: friendly message + retry + manual add
- Zero items detected: illustration + "Try a Different Photo" + "Add Items Manually"
- Recipe generation failure: "Our chef is having a creative block" + retry
- Network loss: amber banner + offline mode with cached data
- Implement demo reset (Ctrl+Shift+R and triple-tap logo -- already exists, verify)

**Task 28 -- Visual Polish and Mobile Responsiveness**

- Audit all screens at 375px and 1440px
- Ensure all text uses Eathos fonts (Cormorant Garamond display, Playfair Display headings, DM Sans body)
- All colors from Eathos tokens, no defaults
- All spacing on 4px grid
- Touch targets minimum 44x44px
- Agent trace as bottom sheet on mobile
- Console silence (zero warnings/errors)

---

## Key Design Decisions

- **Branding**: Shift from Elena's warm earth-tones to Eathos "Citrus & Cream" -- Lime green primary, Blood Orange accent, Berry pop, with serif display fonts (Cormorant Garamond for the logo/display, Playfair Display for headings)
- **Architecture**: Keep existing `useReducer` state machine, add React Router for navigation between the new pages (Home, Tracker, Shopping, Recap), persist key state in localStorage
- **Tone**: Wellness coach persona throughout -- positive, encouraging, data-driven. "Eat with intention." as the guiding slogan
- **No new dependencies except**: `react-router-dom` for routing
- **Approach**: Each task is a single component or small file change, completable independently

