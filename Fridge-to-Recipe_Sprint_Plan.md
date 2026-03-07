# FRIDGE-TO-RECIPE — Multi-Agent Food App

## Frontiers Hackathon Grand Challenge

---

### SPRINT PLAN & TASK BREAKDOWN

**Agile Task Plan | Single Responsibility | Zero Bottlenecks**

Total Build Time: ~10 Hours | 6 Sprints + Foundation

---

## Table of Contents

1. Sprint Overview and Parallelization Map
2. Sprint 0: Foundation (45 min)
3. Sprint 1: Core Pipeline — Backend (2 hr)
4. Sprint 2: Core Pipeline — Frontend (2 hr)
5. Sprint 3: Integration + Grounding (1.5 hr)
6. Sprint 4: Polish, Animation, Image Gen (1.5 hr)
7. Sprint 5: Demo Hardening (1.5 hr)
8. Sprint 6: Presentation Prep (1 hr)
9. Dependency Graph Summary
10. Risk Mitigation Quick Reference

---

## 1. Sprint Overview and Parallelization Map

This plan is structured so that backend and frontend engineers work in parallel from Sprint 1 onward. No engineer should ever be blocked waiting for another engineer's task to complete. Every task has a single responsibility and clear acceptance criteria.

### Team Role Assignments

- **Backend Engineer A:** Food Analyzer agent, Nutritionist agent, Image Generation tool. Owns all LLM prompt engineering.
- **Backend Engineer B:** Inventory tools, Orchestrator, FastAPI server. Owns all flow control and API surface.
- **Frontend Engineer A:** App shell, Photo upload, Recipe card, Loading narratives, Visual polish. Owns the golden path UX.
- **Frontend Engineer B:** Inventory grid, Agent trace timeline, Dietary preferences, Animations, Mobile responsiveness. Owns the data display and interaction states.
- **Lead Engineer:** Sprint 0 scaffold, API keys, code review, integration debugging. Floats to whoever is blocked.
- **Presenter:** Demo script, slides, rehearsal coordination. Joins engineering only if ahead of schedule.

### Parallelization Strategy

- **Sprint 0 (All together):** Everyone works on foundation tasks. This is the only synchronous sprint.
- **Sprint 1 + Sprint 2 (Parallel):** Backend engineers build the API pipeline while frontend engineers build UI components with hardcoded data. No dependencies between teams.
- **Sprint 3 (Integration):** Frontend wires to backend. This is the merge point. Keep communication tight.
- **Sprint 4 (Parallel again):** Backend works on image gen and deduction. Frontend works on animations and loading states.
- **Sprint 5 + 6 (All together):** Demo hardening and presentation. Everyone focuses on the demo.

### Priority Legend

- **P0 (CRITICAL):** Must be in the demo. If this is missing, we cannot present. Drop everything else to finish P0 tasks.
- **P1 (HIGH):** Strongly improves the demo. Build if time permits after all P0 tasks are complete.
- **P2 (NORMAL):** Nice to have. Only build if you have spare time in the final hour.

---

## 2. Sprint 0: Foundation (45 min)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S0-01 | Repository Init and Monorepo Structure | P0 | Lead Eng | Infra | 15m | None |
| S0-02 | API Key Procurement and Validation | P0 | Lead Eng | Infra | 15m | None |
| S0-03 | Demo Fridge Photo Selection and Baseline Test | P0 | All | Content | 10m | None |
| S0-04 | Agree on Data Contracts (TypeScript Interfaces) | P0 | All | Contracts | 15m | None |
| S0-05 | Install Backend Dependencies | P0 | Backend Eng | Backend | 10m | S0-01 |
| S0-06 | Install Frontend Dependencies and Tailwind Config | P0 | Frontend Eng | Frontend | 20m | S0-01 |

### Detailed Task Breakdowns

---

#### S0-01 — Repository Init and Monorepo Structure `[CRITICAL]`

**Owner:** Lead Eng | **Module:** Infra | **Estimate:** 15m | **Depends:** None

**Objective:** Create the project repository with a clean folder structure matching the architecture spec so all engineers can begin work in parallel.

**Plan of Action:**

1. Create a new Git repository with a README.md.
2. Create the backend directory structure: `agents/`, `tools/`, `models/`, `state/`, and root files (`app.py`, `agent.py`, `.env.example`).
3. Create the frontend directory: use Vite + React + TypeScript scaffold (`npx create-vite@latest frontend --template react-ts`).
4. Add a root `.gitignore` covering `node_modules`, `__pycache__`, `.env`, `dist/`.
5. Push the initial commit and share the repo URL with the team.

**Acceptance Criteria:** Every engineer can clone, see the folder structure, and knows which directory to work in. No merge conflicts on scaffold.

> **Note:** Do NOT spend time on CI/CD, Docker, or linting configs. Raw scaffold only.

---

#### S0-02 — API Key Procurement and Validation `[CRITICAL]`

**Owner:** Lead Eng | **Module:** Infra | **Estimate:** 15m | **Depends:** None

**Objective:** Obtain and verify all external API keys needed for the hackathon so no engineer is blocked by missing credentials.

**Plan of Action:**

1. Create a Google Cloud project (or use existing) and enable Gemini API. Generate a `GOOGLE_API_KEY`. Test with a simple curl call to the Gemini endpoint.
2. If using DALL-E for image generation: create or locate an OpenAI API key. Test with a simple image generation request.
3. If using Unsplash as image fallback: register for an Unsplash developer account and get an access key.
4. Create a `.env` file in the backend root with all keys. Create a `.env.example` with placeholder values (no real keys) and commit it.
5. Share the actual `.env` file with the team via a secure channel (not Git).

**Acceptance Criteria:** Each API key is tested with a minimal request and confirmed working. `.env.example` is committed. `.env` is gitignored.

> **Note:** Test every key NOW. A dead key discovered 4 hours in is a disaster.

---

#### S0-03 — Demo Fridge Photo Selection and Baseline Test `[CRITICAL]`

**Owner:** All | **Module:** Content | **Estimate:** 10m | **Depends:** None

**Objective:** Select the exact fridge photo that will be used for all development testing and the final demo. This is the team's shared test fixture.

**Plan of Action:**

1. Take a real fridge photo or find a high-quality stock photo showing: chicken breast, bell peppers, rice, soy sauce, garlic, ginger, eggs, milk, broccoli, hot sauce, butter.
2. Ensure the image is well-lit, clear, and shows items that are identifiable by a vision model.
3. Save the image to the repo at `assets/demo-fridge.jpg`.
4. All engineers reference this image for testing. No engineer uses a different test image during development.

**Acceptance Criteria:** One canonical `demo-fridge.jpg` exists in `assets/`. All team members confirm they can see identifiable items in the photo.

> **Note:** This photo is your test fixture for the entire hackathon. Choose carefully.

---

#### S0-04 — Agree on Data Contracts (TypeScript Interfaces) `[CRITICAL]`

**Owner:** All | **Module:** Contracts | **Estimate:** 15m | **Depends:** None

**Objective:** Define the exact JSON shapes that flow between backend agents and frontend components. This is the handshake that prevents integration failures.

**Plan of Action:**

1. Create a file `shared/contracts.ts` (or `contracts.json`) containing the TypeScript interfaces: `DetectedItem`, `Recipe`, `AgentStep`, `DietaryPreferences` as defined in the frontend engineer persona spec.
2. Create corresponding Pydantic models in backend `models/` directory: `inventory.py` (DetectedItem), `recipe.py` (Recipe).
3. Review as a team: confirm field names, types, and enum values match between frontend and backend.
4. Commit the contracts file. No changes to these interfaces without a 2-minute team standup.

**Acceptance Criteria:** Frontend and backend engineers confirm the interfaces match. A sample JSON for each interface exists as a comment or fixture file.

> **Note:** This is the single most important coordination task. Mismatched shapes cause 80% of hackathon integration failures.

---

#### S0-05 — Install Backend Dependencies `[CRITICAL]`

**Owner:** Backend Eng | **Module:** Backend | **Estimate:** 10m | **Depends:** S0-01

**Objective:** Install all Python dependencies for the backend so agents and tools can be built immediately.

**Plan of Action:**

1. Navigate to the backend directory.
2. Install: `pip install google-adk fastapi uvicorn httpx python-dotenv pydantic`.
3. Verify imports work: `python -c 'from google.adk.agents import LlmAgent; print("ADK OK")'`.
4. Verify FastAPI works: create a minimal `app.py` with one GET endpoint, run uvicorn, confirm it responds.

**Acceptance Criteria:** All imports succeed. A minimal FastAPI server starts without errors on port 8000.

---

#### S0-06 — Install Frontend Dependencies and Tailwind Config `[CRITICAL]`

**Owner:** Frontend Eng | **Module:** Frontend | **Estimate:** 20m | **Depends:** S0-01

**Objective:** Set up the frontend scaffold with Tailwind CSS configured using the exact design token system from the persona spec.

**Plan of Action:**

1. Navigate to the frontend directory. Install Tailwind CSS and its Vite plugin: `npm install -D tailwindcss @tailwindcss/vite`.
2. Configure `tailwind.config.js` with the full color palette from the design spec: cream (`#FFF8F0`), cream-dark (`#F5EDE3`), charcoal (`#2D2A26`), charcoal-light (`#5C5650`), terracotta (`#C75B39`), terracotta-light (`#E8956F`), forest (`#2E6B4F`), forest-light (`#4A9E74`), amber (`#D4930D`), amber-light (`#F5C842`), rose (`#C0392B`), sage (`#A8B5A0`).
3. Add the font families to tailwind config: heading (DM Sans), body (Inter), mono (JetBrains Mono). Add Google Fonts links in `index.html`.
4. Add custom border-radius tokens: sm (6px), md (10px), lg (16px), xl (24px). Add box-shadow tokens: sm, md, lg, glow-amber, glow-forest.
5. Install shadcn/ui as the base component library. Install lucide-react for icons.
6. Create a test page that renders one element from each color token to confirm the theme works.

**Acceptance Criteria:** `npm run dev` starts the app. All custom colors, fonts, and radii are available as Tailwind classes. A visual test page confirms the palette.

> **Note:** Do NOT use default Tailwind colors anywhere after this. Every color must come from the custom theme.

---

### Sprint 0 Checkpoint

> Can you call the vision API with the test photo and get JSON back? Can all engineers start working in their assigned directories?

---

## 3. Sprint 1: Core Pipeline — Backend (2 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S1-01 | Food Analyzer Agent: Prompt Engineering | P0 | Backend Eng A | Agents | 45m | S0-02, S0-05 |
| S1-02 | Inventory Tools: Sync Function | P0 | Backend Eng B | Tools | 30m | S0-04, S0-05 |
| S1-03 | Nutritionist Agent: Recipe Generation with Reasoning | P0 | Backend Eng A | Agents | 45m | S1-01 |
| S1-04 | Orchestrator: Phase 1 (Analyze) and Phase 2 (Generate Recipe) | P0 | Backend Eng B | Orchestrator | 60m | S1-01, S1-02, S1-03 |
| S1-05 | FastAPI Server: /api/analyze and /api/action Endpoints | P0 | Backend Eng B | API | 45m | S1-04 |

### Detailed Task Breakdowns

---

#### S1-01 — Food Analyzer Agent: Prompt Engineering `[CRITICAL]`

**Owner:** Backend Eng A | **Module:** Agents | **Estimate:** 45m | **Depends:** S0-02, S0-05

**Objective:** Build the Food Analyzer LlmAgent that takes a fridge photo and returns a structured JSON list of detected items with confidence scores.

**Plan of Action:**

1. Create `agents/food_analyzer.py`. Define the `FoodAnalyzerOutput` Pydantic model with fields: `items` (list of DetectedItem), `total_items`, `low_confidence_count`.
2. Define the `DetectedItem` Pydantic model with fields: `name`, `category` (enum), `quantity`, `unit`, `freshness` (enum), `days_until_expiry`, `confidence` (0.0-1.0).
3. Create the LlmAgent with `model='gemini-2.5-flash'`, `output_key='detected_items'`, `output_schema=FoodAnalyzerOutput`.
4. Write the instruction prompt: be specific about requiring structured output, honest confidence scores, and freshness estimates. Reference the prompt from the architecture doc.
5. Test with the demo fridge photo via ADK CLI: `adk run`. Verify the output JSON has 8-12 items, confidence scores vary, and at least one item has `days_until_expiry <= 2`.
6. Iterate on the prompt until the output is stable across 3 consecutive runs with the demo photo.

**Acceptance Criteria:** Agent returns valid `FoodAnalyzerOutput` JSON with 8+ items. Chicken breast shows as `nearing_expiry`. Confidence scores are realistic (not all 0.95). At least one uncertain item exists.

---

#### S1-02 — Inventory Tools: Sync Function `[CRITICAL]`

**Owner:** Backend Eng B | **Module:** Tools | **Estimate:** 30m | **Depends:** S0-04, S0-05

**Objective:** Build the `sync_inventory` FunctionTool that takes Food Analyzer output and creates/updates the in-memory inventory.

**Plan of Action:**

1. Create `tools/inventory_tools.py` with an in-memory dictionary `_inventory`.
2. Implement `sync_inventory(detected_items_json: str) -> str`: parses the Food Analyzer JSON, adds new items, updates existing items, flags missing items as `UNCERTAIN`.
3. Implement `get_inventory() -> str`: returns the full inventory as JSON.
4. Wrap both as ADK `FunctionTool` instances.
5. Write a quick test: feed in sample Food Analyzer JSON, call `sync_inventory`, call `get_inventory`, verify the output matches expectations.

**Acceptance Criteria:** `sync_inventory` correctly merges new items into the store. `get_inventory` returns all items. Items not seen in a scan are flagged `UNCERTAIN`. No crashes on empty input.

---

#### S1-03 — Nutritionist Agent: Recipe Generation with Reasoning `[CRITICAL]`

**Owner:** Backend Eng A | **Module:** Agents | **Estimate:** 45m | **Depends:** S1-01

**Objective:** Build the Nutritionist LlmAgent that takes an inventory and generates a recipe with explicit reasoning about why it was chosen.

**Plan of Action:**

1. Create `agents/nutritionist.py`. Define `RecipeOutput` Pydantic model with all fields from the architecture doc: `title`, `cuisine`, `difficulty`, `prep_time_minutes`, `cook_time_minutes`, `servings`, `ingredients` (list with `from_inventory` and `is_expiring` flags), `steps`, `reasoning`, `nutrition`, `nutritional_gaps`.
2. Create the LlmAgent with `model='gemini-2.5-flash'`, `output_key='recipe'`, `output_schema=RecipeOutput`.
3. Write the instruction prompt with placeholders: `{inventory}`, `{dietary_preferences}`, `{rejected_recipes}`. Enforce the prioritization rules: (1) use expiring items first, (2) maximize inventory usage, (3) balance nutrition, (4) keep it under 45 minutes.
4. Test with hardcoded inventory JSON that includes chicken expiring in 1 day. Verify the recipe uses chicken, reasoning references the expiry, and nutritional info is present.
5. Test the reject flow: pass a `rejected_recipes` list with the first recipe title and verify the second recipe is meaningfully different.

**Acceptance Criteria:** Agent returns valid `RecipeOutput` JSON. Reasoning explicitly mentions expiring items. `from_inventory` flags are correct. A second call with `rejected_recipes` produces a different recipe.

---

#### S1-04 — Orchestrator: Phase 1 (Analyze) and Phase 2 (Generate Recipe) `[CRITICAL]`

**Owner:** Backend Eng B | **Module:** Orchestrator | **Estimate:** 60m | **Depends:** S1-01, S1-02, S1-03

**Objective:** Build the custom BaseAgent orchestrator that chains Food Analyzer → Inventory Sync → pause for user review → Nutritionist → pause for accept/reject.

**Plan of Action:**

1. Create `agents/orchestrator.py` with a `FridgeRecipeOrchestrator` class extending `BaseAgent`.
2. Implement phase `start`: run `food_analyzer`, call `sync_inventory_tool`, set phase to `review_inventory`, yield an event with `action='review_inventory'` containing the inventory JSON. Return (pause).
3. Implement phase `generate_recipe`: read inventory and dietary_preferences from session state, run nutritionist, set phase to `review_recipe`, yield event with `action='review_recipe'` containing the recipe. Return (pause).
4. Implement phase `reject_recipe`: append rejected recipe title to `rejected_recipes` list in state, check reject count. If < 3, set phase to `generate_recipe` and recurse. If >= 3, yield `action='free_input'` and return.
5. Implement phase `accept_recipe`: generate image (placeholder URL for now), deduct ingredients, yield `action='final_output'`. Set phase to `complete`.
6. Create `agent.py` with `root_agent = FridgeRecipeOrchestrator(...)`.
7. Test the full flow via ADK CLI: send image, get inventory, send confirm action, get recipe, send accept action, get final output.

**Acceptance Criteria:** Full flow works end-to-end via CLI/ADK web. Each phase pauses correctly and resumes on user action. Reject cycle works up to 3 times. State transitions are clean.

> **Note:** This is the most complex backend task. Allocate focused time. Do not multitask.

---

#### S1-05 — FastAPI Server: /api/analyze and /api/action Endpoints `[CRITICAL]`

**Owner:** Backend Eng B | **Module:** API | **Estimate:** 45m | **Depends:** S1-04

**Objective:** Create the FastAPI server that wraps the ADK orchestrator and exposes REST endpoints for the frontend to call.

**Plan of Action:**

1. Create `app.py` with FastAPI app, CORS middleware (allow all origins for hackathon).
2. Implement `POST /api/analyze`: accepts an image upload, creates a new ADK session, encodes image as base64, sends to the orchestrator, collects events, returns `{session_id, events}`.
3. Implement `POST /api/action`: accepts `{session_id, action, data}`. Maps action strings to phase updates in session state. Resumes the orchestrator. Returns `{session_id, events}`.
4. Implement `GET /api/inventory/{session_id}`: returns current inventory for a session.
5. Test with curl or Postman: upload demo photo to `/api/analyze`, get `session_id`, call `/api/action` with `confirm_inventory`, get recipe, call `/api/action` with `accept_recipe`, get final output.

**Acceptance Criteria:** All three endpoints respond correctly. CORS headers are set. Session state persists across multiple `/api/action` calls. Error responses return proper HTTP status codes.

---

### Sprint 1 Checkpoint

> Can you run the demo photo through the full backend pipeline via CLI/Postman and get a sensible recipe that references expiring items?

---

## 4. Sprint 2: Core Pipeline — Frontend (2 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S2-01 | App Shell: Header, Layout, Routing | P0 | Frontend Eng A | Frontend | 30m | S0-06 |
| S2-02 | Photo Upload Screen (Hardcoded First) | P0 | Frontend Eng A | Frontend | 40m | S2-01 |
| S2-03 | Inventory Grid Component (Hardcoded Data) | P0 | Frontend Eng B | Frontend | 50m | S0-06, S0-04 |
| S2-04 | Recipe Card Component (Hardcoded Data) | P0 | Frontend Eng A | Frontend | 50m | S0-06, S0-04 |
| S2-05 | Agent Trace Timeline Component (Hardcoded States) | P0 | Frontend Eng B | Frontend | 40m | S0-06 |

### Detailed Task Breakdowns

---

#### S2-01 — App Shell: Header, Layout, Routing `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 30m | **Depends:** S0-06

**Objective:** Create the top-level application shell with header, main content area, and routing between the three views (upload, inventory, recipe).

**Plan of Action:**

1. Create `components/AppShell.jsx`: a layout component with a header (app name left, preferences icon right) and a main content area.
2. Style the header: cream background, charcoal text, DM Sans font for the app name, a sliders/tune icon from lucide-react for preferences.
3. Set up React Router with three routes: `/` (upload), `/inventory` (inventory review), `/recipe` (recipe display).
4. Create a top-level state using `useReducer` with actions: `SET_INVENTORY`, `SET_RECIPE`, `SET_PREFERENCES`, `SET_AGENT_STATUS`, `RESET_DEMO`.
5. Verify: navigating between routes works, the header persists, and state is accessible from all views.

**Acceptance Criteria:** App shell renders with header on all routes. State reducer works. Preferences icon is visible and tappable (opens nothing yet). Responsive: single column on mobile, two-panel ready on desktop.

---

#### S2-02 — Photo Upload Screen (Hardcoded First) `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 40m | **Depends:** S2-01

**Objective:** Build the landing screen with the photo upload drop zone, styled exactly per the interaction choreography spec. Hardcode behavior first.

**Plan of Action:**

1. Create `components/PhotoUploader.jsx` with a centered drop zone: dashed border (sage, 2px), rounded-xl, 60% viewport height.
2. Add the hero content inside the drop zone: a simple fridge SVG or emoji placeholder, heading "Snap your fridge. We will handle dinner." in DM Sans charcoal, subtext in Inter charcoal-light.
3. Add two buttons inside the zone: "Upload Photo" (forest green, filled) and "Take Photo" (terracotta, outlined, visible on mobile only).
4. Implement drag-over interaction: border transitions to forest-solid, background shifts to forest at 5% opacity.
5. Implement file drop/select: drop zone shrinks to a 120x120 thumbnail preview. Display a hardcoded "Analyzing..." state to prove the transition works.
6. Wire up actual file input: on file select, store the file in component state and call the transition.

**Acceptance Criteria:** Drop zone looks polished on both mobile (375px) and desktop (1440px). Drag interaction is smooth. File select triggers thumbnail preview and state transition. No broken layout on any screen size.

> **Note:** This screen is the first thing judges see. It must look like a product, not a prototype.

---

#### S2-03 — Inventory Grid Component (Hardcoded Data) `[CRITICAL]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 50m | **Depends:** S0-06, S0-04

**Objective:** Build the inventory grid that displays detected food items with confidence badges, category grouping, and remove/add controls. Use hardcoded JSON matching the data contract.

**Plan of Action:**

1. Create a hardcoded JSON file `fixtures/demo-inventory.json` with 10 items matching the `DetectedItem` contract. Include: 2 items with confidence < 0.70, 1 item with `days_remaining = 1`, varied categories.
2. Create `components/InventoryGrid.jsx`: renders items grouped by category (protein, produce, dairy, grain, condiment).
3. Create `components/InventoryItemCard.jsx`: displays item name, confidence badge (green >= 0.85, amber 0.70-0.84, red < 0.70), category tag, freshness indicator ("Expires tomorrow" in amber, "Fresh" in green).
4. Style uncertain items: amber border (2px), "?" icon overlay, confidence in amber mono font, sorted to bottom of their category.
5. Add remove button (X icon) on each card. On tap: card slides out left (250ms CSS transition), grid reflows. Show a toast "Removed: [item]" with Undo link.
6. Add "+ Add item" at the bottom: inline input field that expands on tap. New items get a "Manually added" badge (terracotta-light background).
7. Add "Confirm and Get Recipe" button at the bottom: forest green, filled, disabled until >= 2 items. Subtle glow-forest shadow.
8. Display total count in section header: "Your Fridge — X items detected".

**Acceptance Criteria:** Grid renders correctly with hardcoded data. Categories are visually grouped. Confidence badges use correct colors. Remove animates smoothly. Add item works. Responsive on mobile and desktop.

---

#### S2-04 — Recipe Card Component (Hardcoded Data) `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 50m | **Depends:** S0-06, S0-04

**Objective:** Build the recipe card that displays a recipe with reasoning, ingredients, instructions, and accept/reject controls. Use hardcoded JSON matching the Recipe contract.

**Plan of Action:**

1. Create a hardcoded JSON file `fixtures/demo-recipe.json` matching the `Recipe` contract. Include: title, reasoning with `expiry_drivers`, ingredients with `from_inventory` flags, 6 instruction steps, nutrition data, metadata.
2. Create `components/RecipeCard.jsx`: displays title (DM Sans, large), reasoning summary (2 lines visible by default), ingredients list, step-by-step instructions, nutritional highlights, time estimate, difficulty badge.
3. Create `components/ReasoningPanel.jsx`: first 2 lines of `reasoning.summary` always visible. "See full reasoning" expand trigger. Expanded view shows: `expiry_drivers` (each with a colored dot), `nutritional_rationale`, `cuisine_category`. Smooth max-height + opacity transition.
4. Style ingredients: items with `from_inventory=true` get a small checkmark icon. Items with `is_expiring=true` get an amber highlight.
5. Create recipe action buttons: "Let's Cook!" (forest, filled, chef-hat icon) and "Show Me Something Else" (terracotta, outlined).
6. Add image area: shimmer placeholder (warm-toned skeleton) when no image. When `image_url` exists, fade in with soft vignette and title overlay.
7. Add fallback for missing image: gradient placeholder with fork-and-knife icon and "Imagine this..." text.

**Acceptance Criteria:** Recipe card renders beautifully with hardcoded data. Reasoning panel expands/collapses smoothly. Ingredient badges are correct. Image placeholder looks intentional, not broken. Responsive.

> **Note:** This card is the centerpiece of the demo. The reasoning panel is the grounding/verifiability story. Make it sing.

---

#### S2-05 — Agent Trace Timeline Component (Hardcoded States) `[CRITICAL]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 40m | **Depends:** S0-06

**Objective:** Build the agent trace timeline that shows each agent step with status indicators, durations, and summaries. This is the engineering quality signal.

**Plan of Action:**

1. Create `components/AgentTraceTimeline.jsx`: vertical timeline with 3-4 steps (Food Analyzer, Inventory Sync, Nutritionist, Image Generator).
2. Each step shows: agent name, status dot (gray=pending, blue-pulse=active, green=complete, red=error), duration (when complete), and a one-line summary.
3. Connect steps with a vertical line (sage color, 2px).
4. Implement status animations: active step has a pulsing blue dot (CSS keyframe: scale 1 → 1.15 → 1, repeating 1.5s). Completed step dot transitions to green with a checkmark.
5. Make the timeline collapsible: starts expanded on desktop sidebar, collapsed on mobile. Toggle button: "Agent Activity" with a chevron.
6. Hardcode a sequence of states to prove the animation works: pending → active → complete for each step with staggered timing.
7. On desktop: render as a right sidebar (280px wide). On mobile: render as a compact bottom bar that expands into a bottom sheet.

**Acceptance Criteria:** Timeline renders with correct visual hierarchy. Pulse animation is smooth (no jank). Collapse/expand works. Desktop sidebar and mobile bottom sheet layouts are both functional.

> **Note:** This component is the single highest-ROI feature for engineering + creativity scoring. Do not use a plain text log.

---

### Sprint 2 Checkpoint

> Can a non-engineer walk through the UI golden path with hardcoded data without guidance? Time them — if it takes more than 90 seconds from photo to recipe, simplify.

---

## 5. Sprint 3: Integration + Grounding (1.5 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S3-01 | Wire Photo Upload to /api/analyze | P0 | Frontend Eng A | Integration | 30m | S2-02, S1-05 |
| S3-02 | Wire Inventory Confirm to /api/action | P0 | Frontend Eng A | Integration | 25m | S3-01, S2-03 |
| S3-03 | Wire Recipe Accept/Reject to /api/action | P0 | Frontend Eng B | Integration | 30m | S3-02, S2-04 |
| S3-04 | Dietary Preferences Modal | P1 | Frontend Eng B | Frontend | 30m | S2-01 |

### Detailed Task Breakdowns

---

#### S3-01 — Wire Photo Upload to /api/analyze `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Integration | **Estimate:** 30m | **Depends:** S2-02, S1-05

**Objective:** Connect the photo upload component to the backend API so a real fridge photo triggers the Food Analyzer agent.

**Plan of Action:**

1. In `PhotoUploader.jsx`, on file drop/select: create a `FormData` object, append the file, POST to `/api/analyze`.
2. On request start: transition to analysis state, activate the Agent Trace Timeline (Food Analyzer = active).
3. On response: parse the events array, extract the inventory data from the `review_inventory` action event.
4. Store `session_id` in top-level state (via dispatch `SET_SESSION_ID`). Store inventory in state (`SET_INVENTORY`).
5. Navigate to `/inventory` route with the populated data.
6. Handle errors: if the request fails, show an amber banner: "Our food scanner is taking a break. You can retry or add items manually." with Retry and Add Manually buttons.

**Acceptance Criteria:** Uploading the demo photo triggers a real API call, receives inventory data, and navigates to the inventory screen with real items displayed. Error state shows gracefully on API failure.

---

#### S3-02 — Wire Inventory Confirm to /api/action `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Integration | **Estimate:** 25m | **Depends:** S3-01, S2-03

**Objective:** Connect the "Confirm and Get Recipe" button to the backend so confirming inventory triggers recipe generation.

**Plan of Action:**

1. In `InventoryGrid.jsx`, on "Confirm and Get Recipe" click: POST to `/api/action` with `{session_id, action: 'confirm_inventory', data: {edited_inventory: currentInventory}}`.
2. Include any dietary preferences from state: `data.dietary_preferences`.
3. On request start: dim the inventory grid (opacity 0.7), update Agent Trace (Nutritionist = active).
4. On response: parse the events, extract recipe data from the `review_recipe` action event. Store in state (`SET_RECIPE`).
5. Navigate to `/recipe` route with the populated data.
6. Handle errors: show "Our chef is having a creative block. Let's try again." with a retry button.

**Acceptance Criteria:** Confirming inventory triggers recipe generation. Recipe data populates the recipe card. Agent trace updates correctly. Error fallback works.

---

#### S3-03 — Wire Recipe Accept/Reject to /api/action `[CRITICAL]`

**Owner:** Frontend Eng B | **Module:** Integration | **Estimate:** 30m | **Depends:** S3-02, S2-04

**Objective:** Connect the accept and reject buttons on the recipe card to the backend for the full accept/reject/regenerate cycle.

**Plan of Action:**

1. On "Show Me Something Else" click: POST to `/api/action` with `{session_id, action: 'reject_recipe'}`.
2. Animate the current recipe card out (slide-out-left, 250ms). Show brief "Thinking of something else..." message (300ms). Animate new recipe in (slide-in-right, 300ms).
3. Track reject count in frontend state. After 3 rejects, replace buttons with a text input: "Tell me what you are craving..." with a submit arrow.
4. On free-text submit: POST to `/api/action` with `{session_id, action: 'free_input', data: {user_input: text}}`.
5. On "Let's Cook!" click: POST to `/api/action` with `{session_id, action: 'accept_recipe'}`.
6. On accept response: transition to final state. Expand recipe card full-width, move image to hero position, show instructions prominently. Show completion state in Agent Trace (all green).

**Acceptance Criteria:** Reject triggers a new, different recipe. Accept triggers the final output with image. Reject animation is smooth (total < 4 seconds perceived). Free-text input appears after 3 rejects.

---

#### S3-04 — Dietary Preferences Modal `[HIGH]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 30m | **Depends:** S2-01

**Objective:** Build the dietary preferences modal accessible from the header icon, with toggle switches and cuisine chips.

**Plan of Action:**

1. Create `components/DietaryPreferencesModal.jsx`: a slide-over panel (or modal) triggered by the preferences icon in the header.
2. Add toggle switches for: vegetarian, vegan, gluten-free, dairy-free. Style with forest green for on state.
3. Add a free-text field for allergies/dislikes.
4. Add cuisine preference multi-select chips: Italian, Asian, Mexican, Mediterranean, Indian, American, Surprise Me. Chips use terracotta-light when selected.
5. On Save: dispatch `SET_PREFERENCES` to top-level state. Close the modal. Saved preferences are passed with the `confirm_inventory` API call.
6. Ensure the icon is always visible in the header so judges can discover it during the demo.

**Acceptance Criteria:** Modal opens/closes smoothly. Toggles and chips work. Preferences persist in session state. Preferences are sent with the inventory confirmation API call.

> **Note:** This is the personalization-with-constraints story for the ethics bonus. Make it discoverable.

---

### Sprint 3 Checkpoint

> Does the full integrated flow work end-to-end from photo upload to recipe display? Can you screenshot every screen and understand WHY the system made its choices?

---

## 6. Sprint 4: Polish, Animation, Image Gen (1.5 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S4-01 | Image Generation Tool Integration | P1 | Backend Eng A | Tools | 30m | S1-04 |
| S4-02 | Ingredient Deduction Tool | P2 | Backend Eng B | Tools | 20m | S1-02 |
| S4-03 | Loading State Narrative (Staged Progress Messages) | P0 | Frontend Eng A | Frontend | 30m | S3-01 |
| S4-04 | Staggered Item Reveal Animation | P1 | Frontend Eng B | Frontend | 25m | S2-03, S3-01 |
| S4-05 | Recipe Card Enter/Exit Animations | P1 | Frontend Eng A | Frontend | 25m | S2-04, S3-03 |

### Detailed Task Breakdowns

---

#### S4-01 — Image Generation Tool Integration `[HIGH]`

**Owner:** Backend Eng A | **Module:** Tools | **Estimate:** 30m | **Depends:** S1-04

**Objective:** Build the image generation FunctionTool that generates or fetches an appetizing food image for accepted recipes.

**Plan of Action:**

1. Create `tools/image_tools.py` with `generate_food_image(recipe_title, cuisine) -> str`.
2. Implement Option A: if `OPENAI_API_KEY` exists, call DALL-E 3 with a food-photography-style prompt. Timeout at 15 seconds.
3. Implement Option B (fallback): if DALL-E fails or no key, call Unsplash search API for `'{recipe_title} food'`.
4. Implement Option C (hardcoded fallback): if both fail, return a hardcoded Unsplash food image URL.
5. Wrap as ADK `FunctionTool`. Wire into the orchestrator's `accept_recipe` phase.
6. Test: call with "Ginger Chicken Stir-Fry" and "Asian". Verify a valid image URL is returned.

**Acceptance Criteria:** Image tool returns a valid URL in all three scenarios (DALL-E success, DALL-E fail + Unsplash success, both fail). Timeout is handled gracefully. No crashes.

---

#### S4-02 — Ingredient Deduction Tool `[NORMAL]`

**Owner:** Backend Eng B | **Module:** Tools | **Estimate:** 20m | **Depends:** S1-02

**Objective:** Build the `deduct_ingredients` FunctionTool that reduces inventory quantities after a recipe is accepted.

**Plan of Action:**

1. In `tools/inventory_tools.py`, implement `deduct_ingredients(recipe_ingredients_json) -> str`.
2. For each ingredient in the recipe: look up by name in `_inventory`, reduce quantity, set status to `USED` if quantity hits 0.
3. Return a confirmation JSON: `{deducted: [...names], remaining_inventory_size: N}`.
4. Wrap as ADK `FunctionTool`. Wire into the orchestrator's `accept_recipe` phase after image generation.
5. Test: deduct chicken breast from a test inventory, verify quantity decreases.

**Acceptance Criteria:** Deduction correctly reduces quantities. Used-up items are flagged. No crashes on items not found in inventory.

---

#### S4-03 — Loading State Narrative (Staged Progress Messages) `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 30m | **Depends:** S3-01

**Objective:** Replace all spinners with staged narrative loading states that show what the system is doing at each step.

**Plan of Action:**

1. During Food Analyzer processing: display staged messages in the Agent Trace and main content area: "Scanning your fridge..." (0-1s) → "Identifying items..." (1-2s) → "Found X items — verifying confidence..." (2-3s) → items appear with staggered animation.
2. Time each stage to actual API latency. Use `setTimeout` to ensure minimum display time per stage (at least 800ms) even if API responds faster.
3. During Nutritionist processing: "Reviewing your ingredients..." → "Considering nutritional balance..." → "Crafting the perfect recipe..." → recipe appears.
4. During image generation: shimmer placeholder in the image area. When image URL arrives, crossfade in.
5. Remove ALL generic spinners from the entire application. Every loading moment has a specific narrative.

**Acceptance Criteria:** No spinner exists anywhere in the app. Every loading state has a narrative message. Stages feel purposeful, not rushed. Minimum 800ms per stage.

> **Note:** Per Elena's PHI3: users experience perceived responsiveness, not milliseconds. This task is the difference between "it feels broken" and "it feels smart."

---

#### S4-04 — Staggered Item Reveal Animation `[HIGH]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 25m | **Depends:** S2-03, S3-01

**Objective:** Animate inventory items appearing in the grid with a staggered fade-slide-in effect when they load from the API.

**Plan of Action:**

1. In `InventoryGrid.jsx`: when items data arrives, render skeleton cards first (shimmer placeholders).
2. Replace skeletons with real items using a staggered animation: each item fades in (opacity 0→1) and slides up (translateY 8px→0) with a 50ms delay per item.
3. Use CSS transitions with `cubic-bezier(0.34, 1.56, 0.64, 1)` for a subtle spring easing.
4. Wrap animations in a `prefers-reduced-motion` media query: if reduced motion is preferred, show items instantly with no animation.
5. Ensure the grid never jumps or reflows during the reveal. Skeleton cards must match the exact dimensions of real cards.

**Acceptance Criteria:** Items appear with a smooth, staggered animation. No layout shift during reveal. Reduced motion preference is respected. Feels polished, not janky.

---

#### S4-05 — Recipe Card Enter/Exit Animations `[HIGH]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 25m | **Depends:** S2-04, S3-03

**Objective:** Implement the recipe card slide-in and slide-out animations for initial load, reject, and accept transitions.

**Plan of Action:**

1. On initial recipe load: card enters from the right (translateX 100% → 0%, opacity 0 → 1, 300ms).
2. On reject: current card exits left (translateX 0% → -100%, opacity 1 → 0, 250ms). Brief pause (300ms). New card enters from right.
3. On accept: recipe card expands to full-width, inventory summary collapses. Image moves to hero position. Optional restrained confetti (3-5 warm-toned particles, 500ms).
4. Content within the recipe card reveals in sequence: title (0ms), reasoning (200ms), ingredients (400ms), instructions (600ms). Each section fades in.
5. Wrap all animations in `prefers-reduced-motion` query.

**Acceptance Criteria:** Enter, exit, and accept animations are smooth. Sequential reveal creates a narrative arc. No layout jump during transitions. Total reject-to-new-recipe perceived time < 4 seconds.

---

### Sprint 4 Checkpoint

> Does the app look like something you would put in a portfolio? Is the visual quality consistent across every screen? If any screen looks like a prototype, fix it now.

---

## 7. Sprint 5: Demo Hardening (1.5 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S5-01 | Pre-Cached Demo Fallback Data | P0 | Backend Eng | Fallback | 30m | S1-01, S1-03 |
| S5-02 | Demo Reset Mechanism | P0 | Frontend Eng | Frontend | 15m | S2-01 |
| S5-03 | Error States and Recovery UX for All Screens | P0 | Frontend Eng B | Frontend | 30m | S3-01, S3-02, S3-03 |
| S5-04 | Visual Polish Pass: Consistency Audit | P0 | Frontend Eng A | Frontend | 30m | All S2-S4 tasks |
| S5-05 | Mobile Responsiveness Final Pass | P1 | Frontend Eng B | Frontend | 25m | S5-04 |
| S5-06 | Console Silence: Suppress All Warnings and Errors | P1 | Frontend Eng | Frontend | 15m | All integration tasks |

### Detailed Task Breakdowns

---

#### S5-01 — Pre-Cached Demo Fallback Data `[CRITICAL]`

**Owner:** Backend Eng | **Module:** Fallback | **Estimate:** 30m | **Depends:** S1-01, S1-03

**Objective:** Create pre-cached JSON responses for every API call so the demo works even if APIs fail or WiFi drops.

**Plan of Action:**

1. Run the full pipeline with the demo photo. Save the actual Food Analyzer response to `fixtures/cached-analysis.json`.
2. Save the actual Nutritionist response to `fixtures/cached-recipe.json`. Save a second alternative recipe to `fixtures/cached-recipe-alt.json`.
3. Save a valid image URL to `fixtures/cached-image-url.json`.
4. In the FastAPI server, add a fallback mechanism: if any agent call times out after 20 seconds, return the pre-cached response for that step.
5. Add a query parameter `?demo=true` to `/api/analyze` that skips all real API calls and returns cached data with realistic timing delays (2-3 seconds).
6. Test: call `/api/analyze?demo=true` and verify the full flow works with cached data.

**Acceptance Criteria:** Cached data exists for every pipeline step. The `?demo=true` parameter works end-to-end. Fallback activates automatically on API timeout. Demo is viable without any network connection.

> **Note:** Per Elena's ER6: the backup must be indistinguishable from the real thing. Conference WiFi is unreliable. Build this BEFORE polishing.

---

#### S5-02 — Demo Reset Mechanism `[CRITICAL]`

**Owner:** Frontend Eng | **Module:** Frontend | **Estimate:** 15m | **Depends:** S2-01

**Objective:** Build a hidden reset mechanism that clears all state and returns to the landing screen instantly for demo re-runs.

**Plan of Action:**

1. Add a keyboard shortcut listener: `Ctrl+Shift+R` dispatches `RESET_DEMO` action.
2. Add a triple-tap listener on the app logo in the header that also dispatches `RESET_DEMO`.
3. `RESET_DEMO` action clears: inventory, recipe, session_id, agent trace status, dietary preferences. Navigates to `/` route.
4. Ensure the reset is instant: no loading states, no transitions, no API calls. Just clear state and go to the landing page.

**Acceptance Criteria:** `Ctrl+Shift+R` and triple-tap logo both reset the app to a clean landing state instantly. No residual state from the previous session.

---

#### S5-03 — Error States and Recovery UX for All Screens `[CRITICAL]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 30m | **Depends:** S3-01, S3-02, S3-03

**Objective:** Implement graceful error states for every failure mode per the failure choreography spec. No raw errors, no blank screens.

**Plan of Action:**

1. **Photo upload failure:** "Our food scanner is taking a break. No worries — you can retry or add items manually." Two buttons: Try Again (primary) and Add Manually (secondary). Add Manually skips to an empty inventory grid with just the AddItemInput component.
2. **Zero items detected:** Friendly illustration + "We could not spot anything this time. This can happen with unusual angles or lighting." Two buttons: Try a Different Photo and Add Items Manually.
3. **Recipe generation failure:** "Our chef is having a moment of creative block. Let's try again." Button: "Inspire the Chef" (retry). After second failure, load cached recipe.
4. **Image generation failure:** Recipe displays fully with gradient placeholder, fork-and-knife icon, "Picture this..." text. No broken image tag.
5. **Network loss:** Amber banner from top: "Looks like we lost connection. We will keep trying — or you can switch to offline mode." Offline mode loads cached demo data.
6. In all error states: the user always has a path forward. Never a dead end.

**Acceptance Criteria:** Each error state can be triggered and displays correctly. Every error has at least one actionable button. No raw error messages, no blank screens, no frozen UI.

> **Note:** Per Elena: "I do not design error states. I design recovery experiences."

---

#### S5-04 — Visual Polish Pass: Consistency Audit `[CRITICAL]`

**Owner:** Frontend Eng A | **Module:** Frontend | **Estimate:** 30m | **Depends:** All S2-S4 tasks

**Objective:** Audit every screen for visual consistency: correct use of color tokens, font families, spacing grid, border radii, shadow depths, and icon style.

**Plan of Action:**

1. Screenshot every screen at 375px and 1440px. Compare side-by-side.
2. Check: all text uses either DM Sans (headings, buttons) or Inter (body). No system fonts visible.
3. Check: all colors come from the design token palette. No default Tailwind grays, no `#000000` text, no tech-blue.
4. Check: all spacing is multiples of 4px. No odd pixel values.
5. Check: all border radii use the token values (sm=6, md=10, lg=16, xl=24). No inconsistent corners.
6. Check: all shadows use the defined tokens. No random box-shadows.
7. Check: all icons are from lucide-react, consistent line-style. No mixed icon libraries.
8. Fix every inconsistency found. Document nothing — just fix it.

**Acceptance Criteria:** Every screen passes the visual consistency audit. Screenshots at 375px and 1440px both look like a cohesive product. No element looks out of place.

> **Note:** Per Elena's EXP2: the last 10% of polish is 50% of the user's impression.

---

#### S5-05 — Mobile Responsiveness Final Pass `[HIGH]`

**Owner:** Frontend Eng B | **Module:** Frontend | **Estimate:** 25m | **Depends:** S5-04

**Objective:** Verify and fix all screens at mobile breakpoint (375px). Ensure touch targets, layout, and interactions work on a phone.

**Plan of Action:**

1. Test at 375px (iPhone SE viewport) in Chrome DevTools.
2. Verify: all touch targets are minimum 44x44px. Especially the inventory item remove buttons and recipe action buttons.
3. Verify: no horizontal scrolling on any screen.
4. Verify: agent trace panel renders as a bottom bar/sheet on mobile, not a sidebar.
5. Verify: the photo upload "Take Photo" button is visible on mobile.
6. Verify: the dietary preferences modal is usable on mobile (no overflow, buttons reachable).
7. Fix any layout breaks found.

**Acceptance Criteria:** All screens render correctly at 375px. No horizontal scroll. All buttons tappable. Agent trace is a bottom sheet. Photo upload shows camera option.

---

#### S5-06 — Console Silence: Suppress All Warnings and Errors `[HIGH]`

**Owner:** Frontend Eng | **Module:** Frontend | **Estimate:** 15m | **Depends:** All integration tasks

**Objective:** Open the browser console and fix or suppress every warning and error before the demo.

**Plan of Action:**

1. Open Chrome DevTools console.
2. Run through the entire golden path.
3. Fix any actual errors (missing keys, undefined props, failed fetches).
4. Suppress React warnings (missing keys on lists, prop type warnings) by fixing the source.
5. Ensure no red errors appear in the console at any point during the demo flow.

**Acceptance Criteria:** Zero errors and zero warnings in the browser console during a full golden-path run.

> **Note:** Per Elena's ER8: a judge who opens DevTools and sees red will dock engineering quality points.

---

### Sprint 5 Checkpoint

> Can you deliver the demo in 3 minutes with zero fumbling? Does the backup plan work with cached data?

---

## 8. Sprint 6: Presentation Prep (1 hr)

### Task Summary

| # | Task | Priority | Owner | Module | Est. | Depends On |
|---|------|----------|-------|--------|------|------------|
| S6-01 | End-to-End Demo Rehearsal (5 Runs) | P0 | All | Demo | 45m | All previous tasks |
| S6-02 | Write the Demo Script | P0 | Presenter | Demo | 20m | S6-01 |
| S6-03 | Presentation Slides | P0 | Presenter | Demo | 30m | S6-02 |
| S6-04 | Screen Recording Backup | P1 | Any Eng | Demo | 15m | S6-01 |
| S6-05 | Pre-Warm Demo State | P1 | Backend Eng | Demo | 10m | S5-01 |

### Detailed Task Breakdowns

---

#### S6-01 — End-to-End Demo Rehearsal (5 Runs) `[CRITICAL]`

**Owner:** All | **Module:** Demo | **Estimate:** 45m | **Depends:** All previous tasks

**Objective:** Run the full demo 5 times end-to-end. Log every failure. Fix only blockers.

**Plan of Action:**

1. **Run 1:** Full golden path with real API calls. Log any failures.
2. **Run 2:** Full golden path with `demo=true` (cached data). Verify it's indistinguishable from real.
3. **Run 3:** Intentionally kill the network mid-flow. Verify fallback kicks in.
4. **Run 4:** Test the reject cycle (reject 2 recipes, accept the third). Verify smooth transitions.
5. **Run 5:** Test dietary preferences set before upload, then run the golden path. Verify the recipe respects preferences.
6. After all runs: triage failures into blockers (fix now) and cosmetic (do not fix).

**Acceptance Criteria:** All 5 runs complete without crashes. Blockers are fixed. The team can deliver the demo in under 3 minutes with zero fumbling.

---

#### S6-02 — Write the Demo Script `[CRITICAL]`

**Owner:** Presenter | **Module:** Demo | **Estimate:** 20m | **Depends:** S6-01

**Objective:** Write the exact demo script: who speaks, what they say, when they click, what the audience sees. Target 3 minutes.

**Plan of Action:**

1. Follow the demo scenario from the backend prompt: Problem pitch (0:00-0:30), Upload and analyze (0:30-1:00), Inventory review (1:00-1:30), Recipe with reasoning (1:30-2:15), Reject and regenerate (2:15-2:45), Architecture + vision (2:45-3:30).
2. Write the exact words the presenter will say at each beat. No improvisation during the demo.
3. Mark exactly which button is clicked at each moment.
4. Include the "pause for effect" moments: when the agent trace animates, when the reasoning panel is highlighted.
5. Time the script with a stopwatch. Trim if over 3:30.

**Acceptance Criteria:** Written script exists. Timed at 3:00-3:30. Every click is specified. Every spoken line is written.

---

#### S6-03 — Presentation Slides `[CRITICAL]`

**Owner:** Presenter | **Module:** Demo | **Estimate:** 30m | **Depends:** S6-02

**Objective:** Create the pitch deck slides: Problem, Solution, Live Demo, Architecture (1 slide), Ethics/Grounding, Future Vision.

**Plan of Action:**

1. **Slide 1 — Problem:** Americans throw out $X of food weekly. Simple stat, impactful visual.
2. **Slide 2 — Solution:** "An AI kitchen assistant that sees, reasons, and suggests." One sentence.
3. **Slide 3 — LIVE DEMO** (transition to app).
4. **Slide 4 — Architecture:** The multi-agent flow diagram. Label each agent. This is one slide, not five.
5. **Slide 5 — Ethics and Grounding:** Human-in-the-loop, confidence scores, dietary constraints. Highlight these are visible in the UI.
6. **Slide 6 — Future Vision:** Full closed-loop diagram (scan → cook → shop → restock → scan). Shopping agent, persistent inventory, proactive suggestions.
7. Use the app's color palette (cream, forest, terracotta) in the slides for visual consistency.

**Acceptance Criteria:** 6 slides exist. Visual style matches the app. Architecture diagram is clear. Future vision shows the full system.

---

#### S6-04 — Screen Recording Backup `[HIGH]`

**Owner:** Any Eng | **Module:** Demo | **Estimate:** 15m | **Depends:** S6-01

**Objective:** Record a screen capture of the perfect golden path run as a backup in case of API outage or WiFi failure during the live demo.

**Plan of Action:**

1. Use a screen recording tool to capture a full golden-path run at 1080p.
2. Include: upload, agent trace animation, inventory review, recipe with reasoning, reject + regenerate, accept with final state.
3. Trim to under 2 minutes.
4. Save to the presenter's desktop for instant playback if needed.

**Acceptance Criteria:** Screen recording exists, is under 2 minutes, and captures the full golden path. Presenter knows where it is saved and how to play it.

---

#### S6-05 — Pre-Warm Demo State `[HIGH]`

**Owner:** Backend Eng | **Module:** Demo | **Estimate:** 10m | **Depends:** S5-01

**Objective:** Pre-upload the demo photo and cache the response so the live demo has zero latency risk on the first API call.

**Plan of Action:**

1. Before the demo starts: call `/api/analyze` with the demo photo. Store the `session_id` and response.
2. Cache the response locally in the frontend (JS variable).
3. During the live demo: when the presenter "uploads" the photo, play the agent trace animation and reveal the pre-cached results after a 2-3 second realistic delay.
4. The audience cannot tell the difference between a live call and a cached response. That is the point.

**Acceptance Criteria:** Pre-warmed demo state loads instantly. The agent trace animation still plays for the audience. Indistinguishable from a real API call.

---

### Sprint 6 Checkpoint

> Would you be proud to present this? If anything less than "yes," identify the weakest link and fix it.

---

## 9. Dependency Graph Summary

This section maps which tasks can run in parallel and which have hard dependencies. Use this to assign work at the start of each sprint.

### Sprint 0: All Parallel

S0-01 through S0-04 can all start simultaneously. S0-05 and S0-06 depend on S0-01 (repo exists) but can run in parallel with each other. One engineer does S0-05 (backend deps), another does S0-06 (frontend deps).

### Sprint 1 + 2: Backend and Frontend in Parallel

**Backend:** S1-01 and S1-02 can start in parallel (different engineers). S1-03 depends on S1-01. S1-04 depends on S1-01, S1-02, S1-03. S1-05 depends on S1-04.

**Frontend:** S2-01 starts first (app shell). S2-02 and S2-03 can start in parallel once S2-01 is done (different engineers). S2-04 depends on S0-06 only. S2-05 depends on S0-06 only. So S2-04 and S2-05 can be built in parallel with S2-02 and S2-03.

**KEY INSIGHT:** All of Sprint 2 uses hardcoded data. Frontend is NEVER blocked by backend in this phase.

### Sprint 3: Integration Merge Point

S3-01 requires both S2-02 (photo upload component) and S1-05 (API server). This is the first cross-team dependency. S3-02 requires S3-01. S3-03 requires S3-02. These are sequential. S3-04 (dietary preferences) has no backend dependency and can be built in parallel.

### Sprint 4: Parallel Again

S4-01 and S4-02 are backend-only. S4-03, S4-04, S4-05 are frontend-only. All can run in parallel.

### Sprint 5 + 6: All Hands on Demo

S5-01 (cached data) is backend. S5-02, S5-03, S5-04, S5-05, S5-06 are frontend. Sprint 6 is all-team coordination.

---

## 10. Risk Mitigation Quick Reference

**Risk: Vision API returns garbage or times out.**
Mitigation: Pre-cached demo-fridge analysis in `fixtures/`. Fallback activates automatically after 20s timeout. Build in S5-01.

**Risk: Recipe LLM hallucinates or returns malformed JSON.**
Mitigation: Pydantic `output_schema` enforces structure. If validation fails, retry once, then serve cached recipe. Build retry logic in S1-04.

**Risk: DALL-E is slow or unavailable.**
Mitigation: 3-tier fallback in S4-01: DALL-E → Unsplash API → hardcoded food image URL. Recipe card works without an image (gradient placeholder). Build in S2-04.

**Risk: Conference WiFi drops during live demo.**
Mitigation: `?demo=true` mode serves entire flow from cached data with realistic timing. Screen recording backup exists. Build in S5-01 and S6-04.

**Risk: Frontend-backend data shape mismatch at integration.**
Mitigation: Shared contracts defined in S0-04. Both teams build to the same interfaces. Integration pain is concentrated in S3-01 (one task, one engineer, 30 minutes).

**Risk: Scope creep ("what if we add a shopping list?").**
Mitigation: Anything not in this sprint plan goes on the Future Vision slide. No exceptions. The scope boundary is this document.

**Risk: Running out of time before polish.**
Mitigation: All P0 tasks are complete by end of Sprint 3. Sprints 4-5 are polish and hardening. If Sprint 3 runs late, skip P1 tasks and jump to Sprint 5 (demo hardening).

---

*"Ship the screen, not the feature." — Elena Vasquez*
