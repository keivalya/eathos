"""FunctionTool for generating food images.

Tries DALL-E first, falls back to Unsplash, then a hardcoded URL.
This is an API call — no LLM reasoning needed, so it's a FunctionTool.
"""

import os

import httpx
from google.adk.tools import FunctionTool


async def generate_food_image(recipe_title: str, cuisine: str) -> str:
    """Generates or fetches an appetizing food image for the given recipe.

    Args:
        recipe_title: The name of the dish.
        cuisine: The cuisine type (e.g., "Asian", "Italian").

    Returns:
        URL of the generated or fetched food image.
    """
    # --- Option A: DALL-E (if you have an OpenAI key) ---
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": "dall-e-3",
                        "prompt": (
                            f"Appetizing overhead photo of {recipe_title}, "
                            f"{cuisine} cuisine, on a rustic wooden table, "
                            f"natural lighting, food photography style"
                        ),
                        "n": 1,
                        "size": "1024x1024",
                    },
                    timeout=15.0,
                )
                data = response.json()
                return data["data"][0]["url"]
        except Exception:
            pass  # Fall through to fallback

    # --- Option B: Fallback to Unsplash ---
    try:
        unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
        if unsplash_key:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.unsplash.com/search/photos",
                    params={"query": f"{recipe_title} food", "per_page": 1},
                    headers={"Authorization": f"Client-ID {unsplash_key}"},
                    timeout=5.0,
                )
                data = response.json()
                if data.get("results"):
                    return data["results"][0]["urls"]["regular"]
    except Exception:
        pass

    # --- Option C: Hardcoded fallback ---
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"


generate_food_image_tool = FunctionTool(func=generate_food_image)
