# Frontiers Fridge (Fridge-to-Recipe)

**An AI-powered nutrition coach and meal planner that adapts to your day, inventory, and goals.**

Frontiers Fridge is a multi-agent application built to provide dynamic meal planning. By simply snapping a photo of your fridge or pantry, the app's AI agents analyze your inventory, factor in your dietary preferences, and generate personalized, nutritionally balanced recipes with clear reasoning.

## 🌟 Key Features

- **Food Analyzer Agent:** Uses Gemini 2.5 Flash to identify food items from photos, extracting details like quantity, freshness metrics, confidence scores, and estimated days until expiry.
- **Nutritionist Agent:** A strategic agent that plans meals based on expiring ingredients, inventory limits, dietary preferences (e.g., vegan, gluten-free), and nutritional balance.
- **Agent Trace Timeline:** A transparent UI feature that shows step-by-step reasoning of what each AI agent is doing in real-time.
- **Dietary Constraints Engine:** Built-in support for allergies and specific cuisine preferences.
- **Image Generation:** Automatic, appetizing food image generation for the generated recipes.
- **Robust Error Handling:** Built-in fallbacks and caching to ensure a seamless offline demo experience.

## 🛠️ Tech Stack

**Backend:**
- Python 3.10+
- [FastAPI](https://fastapi.tiangolo.com/) for routing and REST endpoints
- Google ADK (Agent Development Kit)
- **Models:** Google Gemini 2.5 Flash (Analysis & Generation), OpenAI DALL-E 3 (Image Generation)

**Frontend:**
- React 18
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for custom design tokens
- [shadcn/ui](https://ui.shadcn.com/) components
- React Router

---

## 🚀 Getting Started

Ensure you have Node.js and Python installed before proceeding.

### 1. Set up the Backend
Navigate to the backend directory and set up your environment:

```bash
cd backend

# Create a virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Configure Environment Variables:**
Copy the example config and add your API keys. You will need a `GOOGLE_API_KEY` for Gemini, and optionally an `OPENAI_API_KEY` if you want dynamic image generation.
```bash
cp .env.example .env
```

**Run the Server:**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
The backend will run on `http://localhost:8000`.

### 2. Set up the Frontend
In a separate terminal, navigate to the frontend directory:

```bash
cd frontend

# Install packages
npm install

# Start the development server
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## 🧠 Project Architecture

The system uses an orchestrator pattern with stateful `BaseAgent` phases:
1. **Analyze Phase:** The **Food Analyzer Agent** scans the uploaded fridge photo.
2. **Review Inventory:** Items are parsed, synchronized via tools, and presented to the user for validation.
3. **Generate Recipe Phase:** The **Nutritionist Agent** reads the confirmed inventory and preferences, deducts required items, and drafts a recipe.
4. **Accept/Reject Loop:** The user can accept the recipe (which triggers the Image Generator) or reject it (which generates a new alternative via feedback).

---

*This project was built for the Frontiers Hackathon Grand Challenge with a focus on single-responsibility engineering, reliable failure-choreography, and grounding AI responses cleanly through reasoning.*
