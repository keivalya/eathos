"""Shopping Agent — LlmAgent for shopping list generation (post-MVP).

Analyzes nutritional gaps and recipe needs to generate a prioritized
shopping list. This is a stub for the hackathon — full implementation
would integrate with grocery APIs (Instacart, etc.).
"""

from google.adk.agents import LlmAgent

from ..models.shopping import ShoppingList

shopping_agent = LlmAgent(
    name="ShoppingAgent",
    model="gemini-3.1-pro-preview",
    instruction="""You are a Shopping Agent. You analyze the user's current inventory, 
    the nutritional gaps identified by the Nutritionist, and any missing recipe 
    ingredients to generate a prioritized shopping list.

    **Current inventory:** {inventory}
    **Nutritional gaps:** {nutritional_gaps}
    **Missing ingredients:** {missing_ingredients}

    **Prioritization rules:**
    1. Items needed for the accepted recipe come first.
    2. Items that fill nutritional gaps come second.
    3. Staples that are running low come third.

    For each item, provide:
    - name: the specific item to buy
    - quantity: how much to buy
    - unit: the unit of measurement
    - category: the food category
    - reason: why this item is on the list
    - estimated_price: rough price estimate in USD (if you can)

    Respond with structured JSON matching the output schema.""",
    description="Generates a prioritized shopping list based on inventory gaps and recipe needs.",
    output_key="shopping_list",
    output_schema=ShoppingList,
)
