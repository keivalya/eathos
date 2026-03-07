"""FunctionTools for inventory CRUD operations.

These are deterministic operations that don't require LLM reasoning —
they map naturally to ADK FunctionTools rather than LlmAgents.
"""

import json
from datetime import datetime
from typing import Any, Dict

from google.adk.tools import FunctionTool

# --- In-Memory Inventory Store (MVP) ---
# In production, replace with a real DB.
_inventory: Dict[str, Dict[str, Any]] = {}


def sync_inventory(detected_items_json: str) -> str:
    """Syncs detected items from the Food Analyzer against the existing inventory.

    Adds new items, updates quantities for existing items, and flags items
    that were previously in inventory but not detected in this scan.
    Returns the full updated inventory as JSON.

    Args:
        detected_items_json: JSON string of detected items from FoodAnalyzerAgent.

    Returns:
        JSON string of the full updated inventory.
    """
    detected = json.loads(detected_items_json)
    detected_names = set()

    for item in detected.get("items", []):
        name = item["name"].lower().strip()
        detected_names.add(name)

        if name in _inventory:
            # Update existing item
            _inventory[name].update({
                "quantity": item["quantity"],
                "unit": item["unit"],
                "freshness": item["freshness"],
                "days_until_expiry": item["days_until_expiry"],
                "confidence": item["confidence"],
                "last_seen": datetime.now().isoformat(),
                "status": "AVAILABLE",
            })
        else:
            # Add new item
            _inventory[name] = {
                "name": item["name"],
                "category": item["category"],
                "quantity": item["quantity"],
                "unit": item["unit"],
                "freshness": item["freshness"],
                "days_until_expiry": item["days_until_expiry"],
                "confidence": item["confidence"],
                "first_seen": datetime.now().isoformat(),
                "last_seen": datetime.now().isoformat(),
                "status": "AVAILABLE",
            }

    # Flag items not seen in this scan
    for name, item in _inventory.items():
        if name not in detected_names and item["status"] == "AVAILABLE":
            item["status"] = "UNCERTAIN"

    return json.dumps({"inventory": list(_inventory.values())}, indent=2)


def deduct_ingredients(recipe_ingredients_json: str) -> str:
    """Deducts ingredients used in an accepted recipe from the inventory.

    Args:
        recipe_ingredients_json: JSON string with list of {name, quantity, unit}.

    Returns:
        JSON string confirming what was deducted.
    """
    ingredients = json.loads(recipe_ingredients_json)
    deducted = []

    for ing in ingredients:
        name = ing["name"].lower().strip()
        if name in _inventory:
            _inventory[name]["quantity"] = max(
                0, _inventory[name]["quantity"] - ing.get("quantity", 0)
            )
            if _inventory[name]["quantity"] == 0:
                _inventory[name]["status"] = "USED"
            deducted.append(name)

    return json.dumps({
        "deducted": deducted,
        "remaining_inventory_size": len(_inventory),
    })


def add_purchased_items(purchased_items_json: str) -> str:
    """Adds newly purchased items to the inventory (post-shopping).

    Args:
        purchased_items_json: JSON string with list of purchased items.

    Returns:
        JSON string confirming what was added.
    """
    items = json.loads(purchased_items_json)
    added = []

    for item in items:
        name = item["name"].lower().strip()
        _inventory[name] = {
            "name": item["name"],
            "category": item.get("category", "other"),
            "quantity": item.get("quantity", 1),
            "unit": item.get("unit", "count"),
            "freshness": "fresh",
            "days_until_expiry": item.get("days_until_expiry", 7),
            "confidence": 1.0,  # User-confirmed purchase
            "first_seen": datetime.now().isoformat(),
            "last_seen": datetime.now().isoformat(),
            "status": "AVAILABLE",
        }
        added.append(name)

    return json.dumps({"added": added, "inventory_size": len(_inventory)})


def get_inventory() -> str:
    """Returns the current full inventory as JSON.

    Returns:
        JSON string of all inventory items.
    """
    return json.dumps({"inventory": list(_inventory.values())}, indent=2)


# --- Wrap as ADK FunctionTools ---
sync_inventory_tool = FunctionTool(func=sync_inventory)
deduct_ingredients_tool = FunctionTool(func=deduct_ingredients)
add_purchased_items_tool = FunctionTool(func=add_purchased_items)
get_inventory_tool = FunctionTool(func=get_inventory)
