"""Nutritionist Agent — LlmAgent for recipe generation.

Receives the user's inventory and generates recipes that prioritize
expiring items, balance nutrition, and respect dietary preferences.
Uses ADK state templating ({inventory}, {dietary_preferences}, etc.)
to automatically resolve session state into the prompt.
"""

from google.adk.agents import LlmAgent

from ..models.recipe import RecipeOutput

nutritionist_agent = LlmAgent(
    name="NutritionistAgent",
    model="gemini-3.1-pro-preview",
    instruction="""You are a Nutritionist agent. You receive the user's full kitchen 
    inventory and must suggest a recipe.

    **Prioritization rules (in order):**
    1. USE EXPIRING ITEMS FIRST. If an item has days_until_expiry <= 2, it MUST be 
       in the recipe. This is the #1 priority.
    2. Maximize use of available inventory items — minimize "you need to buy" ingredients.
    3. Balance nutrition: aim for protein + vegetables + carbs.
    4. Keep it practical: prefer recipes under 45 minutes for weeknight cooking.

    **Current inventory:** {inventory}
    **Dietary preferences:** {dietary_preferences}
    **Previously rejected recipes (DO NOT suggest these again):** {rejected_recipes}

    **Your reasoning section must explicitly state:**
    - Which items are expiring and how you used them
    - Why this cuisine/preparation was chosen
    - Any nutritional considerations

    **Nutritional gaps:** After suggesting the recipe, analyze what the overall 
    inventory is lacking (e.g., "low on protein sources", "no leafy greens"). 
    This feeds the Shopping Agent.

    For each ingredient, set from_inventory to true if the ingredient is available
    in the user's inventory, or false if the user would need to buy it.

    Respond with structured JSON matching the output schema.""",
    description="Generates recipes prioritizing expiring items with explicit reasoning.",
    output_key="recipe",  # Saves to session.state["recipe"]
    output_schema=RecipeOutput,
)
