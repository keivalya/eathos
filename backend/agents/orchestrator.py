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

IMPORTANT: State changes must go through EventActions(stateDelta=...) on
yielded events — direct mutations to ctx.session.state are NOT persisted
between turns by ADK's session service.
"""

import json
from typing import AsyncGenerator

from google.adk.agents import BaseAgent, LlmAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.adk.events.event_actions import EventActions
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

    def _make_event(
        self, message: dict, state_delta: dict | None = None
    ) -> Event:
        """Helper to create an Event with content and optional state delta."""
        actions = EventActions(stateDelta=state_delta or {})
        return Event(
            author=self.name,
            content=types.Content(
                parts=[types.Part(text=json.dumps(message))]
            ),
            actions=actions,
        )

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

            # Yield inventory for user review — persist phase + inventory via stateDelta
            yield self._make_event(
                message={
                    "action": "review_inventory",
                    "message": (
                        "Here's what I found in your fridge. "
                        "Please review and confirm by saying 'confirm', "
                        "or tell me what to change."
                    ),
                    "inventory": json.loads(inventory_result),
                },
                state_delta={
                    "phase": "review_inventory",
                    "inventory": inventory_result,
                },
            )
            return  # Pause — wait for user confirmation

        # ============================================
        # PHASE 1b: User reviews inventory (ADK web chat flow)
        # ============================================
        elif current_phase == "review_inventory":
            # Any user message at this point is treated as confirmation.
            # Update phase via stateDelta, then fall through to generate_recipe.
            state["phase"] = "generate_recipe"
            if "rejected_recipes" not in state:
                state["rejected_recipes"] = "[]"
            if "dietary_preferences" not in state:
                state["dietary_preferences"] = "None specified"

            # Emit a state-transition event so ADK persists the phase change
            yield self._make_event(
                message={
                    "action": "status",
                    "message": "Inventory confirmed! Generating a recipe for you...",
                },
                state_delta={
                    "phase": "generate_recipe",
                    "rejected_recipes": state.get("rejected_recipes", "[]"),
                    "dietary_preferences": state.get("dietary_preferences", "None specified"),
                },
            )

            # Run Nutritionist
            async for event in self.nutritionist.run_async(ctx):
                yield event

            # Yield recipe for user review
            yield self._make_event(
                message={
                    "action": "review_recipe",
                    "message": "Here's a recipe suggestion. Say 'accept' or 'reject'!",
                    "recipe": state.get("recipe"),
                },
                state_delta={"phase": "review_recipe"},
            )
            return  # Pause — wait for user accept/reject

        # ============================================
        # PHASE 2: User confirmed inventory → generate recipe (via FastAPI)
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

            # Yield recipe for user review
            yield self._make_event(
                message={
                    "action": "review_recipe",
                    "message": "Here's a recipe suggestion. Say 'accept' or 'reject'!",
                    "recipe": state.get("recipe"),
                },
                state_delta={"phase": "review_recipe"},
            )
            return  # Pause — wait for user accept/reject

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

            reject_keywords = [
                "reject", "no", "nah", "different", "another",
                "don't like", "try again", "something else",
            ]
            if any(kw in user_text for kw in reject_keywords):
                # Transition to reject flow
                state["phase"] = "reject_recipe"
                async for event in self._run_async_impl(ctx):
                    yield event
            else:
                # Transition to accept flow
                state["phase"] = "accept_recipe"
                async for event in self._run_async_impl(ctx):
                    yield event

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
            rejected_json = json.dumps(rejected)
            state["rejected_recipes"] = rejected_json

            reject_count = len(rejected)
            if reject_count >= 3:
                # After 3 rejects, ask user what they want
                yield self._make_event(
                    message={
                        "action": "free_input",
                        "message": (
                            "I've suggested 3 recipes and none hit the mark. "
                            "Tell me what you're in the mood for!"
                        ),
                    },
                    state_delta={
                        "phase": "free_input",
                        "rejected_recipes": rejected_json,
                    },
                )
                return

            # Otherwise, regenerate — emit state update then re-enter
            yield self._make_event(
                message={
                    "action": "status",
                    "message": f"Got it, skipping that one. Suggesting something different... (attempt {reject_count + 1}/3)",
                },
                state_delta={
                    "phase": "generate_recipe",
                    "rejected_recipes": rejected_json,
                },
            )
            state["phase"] = "generate_recipe"
            async for event in self._run_async_impl(ctx):
                yield event

        # ============================================
        # PHASE 3c: Free input (ADK web chat flow, after 3 rejects)
        # ============================================
        elif current_phase == "free_input":
            # User tells us what they want — store as dietary preferences
            user_text = ""
            if ctx.session.events:
                for evt in reversed(ctx.session.events):
                    if evt.content and evt.content.role == "user":
                        for part in evt.content.parts:
                            if part.text:
                                user_text = part.text
                                break
                        if user_text:
                            break

            state["dietary_preferences"] = user_text or state.get("dietary_preferences", "None specified")
            state["phase"] = "generate_recipe"

            yield self._make_event(
                message={
                    "action": "status",
                    "message": f"Great, I'll factor in your preference: '{user_text}'. Generating a new recipe...",
                },
                state_delta={
                    "phase": "generate_recipe",
                    "dietary_preferences": state["dietary_preferences"],
                },
            )

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
            image_url = generate_food_image_tool.func(title, cuisine)

            # Deduct ingredients from inventory
            if isinstance(recipe, dict) and "ingredients" in recipe:
                deduct_ingredients_tool.func(json.dumps(recipe["ingredients"]))

            # Final output with all state persisted
            yield self._make_event(
                message={
                    "action": "final_output",
                    "message": "Here's your recipe! Happy cooking!",
                    "recipe": recipe,
                    "image_url": image_url,
                    "nutritional_gaps": (
                        recipe.get("nutritional_gaps")
                        if isinstance(recipe, dict)
                        else None
                    ),
                },
                state_delta={
                    "phase": "complete",
                    "recipe_image": image_url,
                },
            )
