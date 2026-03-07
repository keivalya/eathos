"""FunctionTool for dietary preference lookup.

MVP: returns preferences stored in session state.
Future: could integrate with a user profile DB or dietary API.
"""

import json
from typing import Optional

from google.adk.tools import FunctionTool


# --- In-memory dietary profiles (MVP) ---
_dietary_profiles: dict = {}


def get_dietary_preferences(user_id: str) -> str:
    """Retrieves dietary preferences for the given user.

    Args:
        user_id: The user identifier.

    Returns:
        JSON string of dietary preferences.
    """
    profile = _dietary_profiles.get(user_id, {
        "restrictions": [],
        "preferences": [],
        "allergens": [],
        "calorie_target": None,
        "notes": "No preferences specified",
    })
    return json.dumps(profile, indent=2)


def set_dietary_preferences(
    user_id: str,
    restrictions: Optional[str] = None,
    preferences: Optional[str] = None,
    allergens: Optional[str] = None,
    calorie_target: Optional[int] = None,
) -> str:
    """Updates dietary preferences for the given user.

    Args:
        user_id: The user identifier.
        restrictions: Comma-separated dietary restrictions (e.g., "vegetarian, gluten-free").
        preferences: Comma-separated cuisine preferences (e.g., "Asian, Mediterranean").
        allergens: Comma-separated allergens (e.g., "peanuts, shellfish").
        calorie_target: Target calories per meal.

    Returns:
        JSON string confirming the updated preferences.
    """
    profile = _dietary_profiles.get(user_id, {
        "restrictions": [],
        "preferences": [],
        "allergens": [],
        "calorie_target": None,
        "notes": "",
    })

    if restrictions is not None:
        profile["restrictions"] = [r.strip() for r in restrictions.split(",") if r.strip()]
    if preferences is not None:
        profile["preferences"] = [p.strip() for p in preferences.split(",") if p.strip()]
    if allergens is not None:
        profile["allergens"] = [a.strip() for a in allergens.split(",") if a.strip()]
    if calorie_target is not None:
        profile["calorie_target"] = calorie_target

    _dietary_profiles[user_id] = profile
    return json.dumps({"status": "updated", "profile": profile}, indent=2)


# --- Wrap as ADK FunctionTools ---
get_dietary_preferences_tool = FunctionTool(func=get_dietary_preferences)
set_dietary_preferences_tool = FunctionTool(func=set_dietary_preferences)
