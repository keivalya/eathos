"""ADK entry point — defines the root agent for `adk web` and `adk run`."""

from .agents.orchestrator import FridgeRecipeOrchestrator

root_agent = FridgeRecipeOrchestrator(
    name="FridgeRecipeApp",
    description=(
        "A multi-agent kitchen assistant that analyzes fridge photos, "
        "identifies ingredients, tracks inventory, and suggests recipes "
        "that prioritize expiring items. Supports accept/reject cycles "
        "and dietary preferences."
    ),
)
