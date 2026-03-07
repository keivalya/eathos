"""Custom Orchestrator — BaseAgent with human-in-the-loop breakpoints.

Manages the full fridge-to-recipe flow across multiple phases:
  Phase 1 (auto):   Image → Food Analyzer → Inventory Sync
  Phase 2 (paused): User reviews/edits inventory → confirms
  Phase 3 (auto):   Inventory → Nutritionist → Recipe
  Phase 4 (paused): User accepts/rejects recipe
  Phase 5 (auto):   Image generation → Final output
  Phase 6 (auto):   Deduct ingredients from inventory

Uses a custom BaseAgent (rather than SequentialAgent) because the flow has
human-in-the-loop pauses that require yielding events and resuming later.
"""

import json
from typing import AsyncGenerator

from google.adk.agents import BaseAgent, LlmAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.genai import types
from typing_extensions import override

from .food_analyzer import food_analyzer_agent
from .nutritionist import nutritionist_agent
from ..tools.image_tools import generate_food_image_tool
from ..tools.inventory_tools import (
    deduct_ingredients_tool,
    sync_inventory_tool,
)


class FridgeRecipeOrchestrator(BaseAgent):
    """Custom orchestrator that manages the full fridge-to-recipe flow
    with human-in-the-loop checkpoints.
    """

    # Sub-agents declared as class attributes so ADK registers them
    food_analyzer: LlmAgent = food_analyzer_agent
    nutritionist: LlmAgent = nutritionist_agent

    @override
    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        state = ctx.session.state
        current_phase = state.get("phase", "start")

        # ============================================
        # PHASE 1: Analyze fridge image
        # ============================================
        if current_phase == "start":
            # Run Food Analyzer on the uploaded image
            async for event in self.food_analyzer.run_async(ctx):
                yield event

            # Sync with inventory
            detected = state.get("detected_items", "{}")
            inventory_result = sync_inventory_tool.func(
                detected if isinstance(detected, str) else json.dumps(detected)
            )
            state["inventory"] = inventory_result
            state["phase"] = "review_inventory"

            # Yield inventory for user review
            yield Event(
                author=self.name,
                content=types.Content(
                    parts=[types.Part(text=json.dumps({
                        "action": "review_inventory",
                        "message": (
                            "Here's what I found in your fridge. "
                            "Please review and confirm by saying 'confirm', "
                            "or tell me what to change."
                        ),
                        "inventory": json.loads(inventory_result),
                    }))]
                ),
            )
            return  # Pause — wait for user confirmation

        # ============================================
        # PHASE 1b: User reviews inventory (ADK web chat flow)
        # ============================================
        elif current_phase == "review_inventory":
            # Any user message at this point is treated as confirmation
            # (In production, you'd parse for edits vs. confirm)
            state["phase"] = "generate_recipe"
            # Fall through to generate_recipe
            async for event in self._run_async_impl(ctx):
                yield event

        # ============================================
        # PHASE 3b: User reviews recipe (ADK web chat flow)
        # ============================================
        elif current_phase == "review_recipe":
            # Parse user intent from the latest message
            user_text = ""
            if ctx.session.events:
                for evt in reversed(ctx.session.events):
                    if evt.content and evt.content.role == "user":
                        for part in evt.content.parts:
                            if part.text:
                                user_text = part.text.lower()
                                break
                        if user_text:
                            break

            reject_keywords = ["reject", "no", "nah", "different", "another", "don't like", "try again"]
            if any(kw in user_text for kw in reject_keywords):
                state["phase"] = "reject_recipe"
            else:
                state["phase"] = "accept_recipe"

            async for event in self._run_async_impl(ctx):
                yield event


        # ============================================
        # PHASE 2: User confirmed inventory → generate recipe
        # ============================================
        elif current_phase == "generate_recipe":
            # Initialize rejected recipes list if not present
            if "rejected_recipes" not in state:
                state["rejected_recipes"] = "[]"
            if "dietary_preferences" not in state:
                state["dietary_preferences"] = "None specified"

            # Run Nutritionist
            async for event in self.nutritionist.run_async(ctx):
                yield event

            state["phase"] = "review_recipe"

            yield Event(
                author=self.name,
                content=types.Content(
                    parts=[types.Part(text=json.dumps({
                        "action": "review_recipe",
                        "message": "Here's a recipe suggestion. Accept or reject?",
                        "recipe": state.get("recipe"),
                    }))]
                ),
            )
            return  # Pause — wait for user accept/reject

        # ============================================
        # PHASE 3: User rejected → regenerate with context
        # ============================================
        elif current_phase == "reject_recipe":
            # Append rejected recipe to the list
            rejected = json.loads(state.get("rejected_recipes", "[]"))
            current_recipe = state.get("recipe", {})
            title = (
                current_recipe.get("title", "unknown")
                if isinstance(current_recipe, dict)
                else "unknown"
            )
            rejected.append(title)
            state["rejected_recipes"] = json.dumps(rejected)

            reject_count = len(rejected)
            if reject_count >= 3:
                # After 3 rejects, ask user what they want
                state["phase"] = "free_input"
                yield Event(
                    author=self.name,
                    content=types.Content(
                        parts=[types.Part(text=json.dumps({
                            "action": "free_input",
                            "message": (
                                "I've suggested 3 recipes and none hit the mark. "
                                "Tell me what you're in the mood for!"
                            ),
                        }))]
                    ),
                )
                return

            # Otherwise, regenerate
            state["phase"] = "generate_recipe"
            async for event in self._run_async_impl(ctx):
                yield event

        # ============================================
        # PHASE 4: User accepted → generate image + finalize
        # ============================================
        elif current_phase == "accept_recipe":
            recipe = state.get("recipe", {})
            title = (
                recipe.get("title", "delicious meal")
                if isinstance(recipe, dict)
                else "delicious meal"
            )
            cuisine = (
                recipe.get("cuisine", "international")
                if isinstance(recipe, dict)
                else "international"
            )

            # Generate food image
            image_url = await generate_food_image_tool.func(title, cuisine)
            state["recipe_image"] = image_url

            # Deduct ingredients from inventory
            if isinstance(recipe, dict) and "ingredients" in recipe:
                deduct_ingredients_tool.func(json.dumps(recipe["ingredients"]))

            state["phase"] = "complete"

            yield Event(
                author=self.name,
                content=types.Content(
                    parts=[types.Part(text=json.dumps({
                        "action": "final_output",
                        "message": "Here's your recipe! Happy cooking!",
                        "recipe": recipe,
                        "image_url": image_url,
                        "nutritional_gaps": (
                            recipe.get("nutritional_gaps")
                            if isinstance(recipe, dict)
                            else None
                        ),
                    }))]
                ),
            )
