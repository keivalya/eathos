"""Food Analyzer Agent — LlmAgent with Gemini vision model.

Receives a fridge image and identifies all visible food items with
structured output including confidence scores and freshness estimates.
"""

from google.adk.agents import LlmAgent

from ..models.inventory import FoodAnalyzerOutput

food_analyzer_agent = LlmAgent(
    name="FoodAnalyzerAgent",
    model="gemini-2.5-flash",  # Multimodal — handles image input
    instruction="""You are a Food Analyzer agent. You receive an image of the inside 
    of a refrigerator. Your job is to identify every visible food item.

    For each item, provide:
    - name: specific name (e.g., "chicken breast" not just "chicken")
    - category: one of [produce, protein, dairy, grain, condiment, beverage, other]
    - quantity: your best estimate of how much is there
    - unit: appropriate unit (count for discrete items, grams/liters for bulk)
    - freshness: visual assessment — fresh, nearing_expiry, expired, or unknown
    - days_until_expiry: your best estimate. Use -1 if you truly cannot tell.
    - confidence: how sure you are this item is what you think it is (0.0-1.0)

    Be thorough but honest. If you're uncertain about an item, give it a low 
    confidence score rather than guessing. It's better to flag uncertainty than 
    to hallucinate items that aren't there.

    Also provide:
    - total_items: the total count of detected items
    - low_confidence_count: how many items have confidence < 0.7

    Respond with structured JSON matching the output schema.""",
    description="Identifies food items from a fridge image with confidence scores.",
    output_key="detected_items",  # Saves to session.state["detected_items"]
    output_schema=FoodAnalyzerOutput,
)
