"""FunctionTool for generating food images using Google Gemini.

Supports three models in priority order:
  1. gemini-2.0-flash-exp-image-generation (experimental, works on free tier)
  2. gemini-2.5-flash-image / Nano Banana (paid tier only)
  3. imagen-4.0-generate-001 / Imagen 4 (paid tier only)

Falls back to a hardcoded Unsplash URL if all models fail.
"""

import os
import uuid
from pathlib import Path

from google import genai
from google.adk.tools import FunctionTool
from google.genai import types


# Directory to save generated images
IMAGES_DIR = Path(__file__).parent.parent / "generated_images"
IMAGES_DIR.mkdir(exist_ok=True)


def _save_image_bytes(image_bytes: bytes, prefix: str = "recipe") -> str:
    """Save raw image bytes to disk and return the serving URL."""
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}.png"
    path = IMAGES_DIR / filename
    path.write_bytes(image_bytes)
    # Return URL path that FastAPI StaticFiles will serve
    return f"http://localhost:8000/images/{filename}"


def _get_client() -> genai.Client:
    """Create a genai Client, preferring GEMINI_IMAGE_API_KEY if set."""
    image_key = os.getenv("GEMINI_IMAGE_API_KEY")
    if image_key:
        return genai.Client(api_key=image_key)
    return genai.Client()  # auto-detects from GEMINI_API_KEY etc.


def _try_generate_content(client, model: str, prompt: str) -> str | None:
    """Try generating an image via generate_content. Returns path or None."""
    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                    image_bytes = part.inline_data.data
                    return _save_image_bytes(image_bytes)
        print(f"[ImageGen] {model} returned no image parts")
    except Exception as e:
        print(f"[ImageGen] {model} failed: {e}")
    return None


def generate_food_image(recipe_title: str, cuisine: str) -> str:
    """Generates or fetches an appetizing food image for the given recipe.

    Args:
        recipe_title: The name of the dish.
        cuisine: The cuisine type (e.g., "Asian", "Italian").

    Returns:
        File path or URL of the generated/fetched food image.
    """
    prompt = (
        f"Generate a photorealistic, appetizing overhead photo of "
        f"{recipe_title}, {cuisine} cuisine, beautifully plated on a "
        f"rustic wooden table, natural lighting, professional food "
        f"photography style, high resolution, vibrant colors. "
        f"Only generate the image, no text."
    )

    client = _get_client()

    # --- Option A: Experimental model (works on free tier) ---
    result = _try_generate_content(client, "gemini-2.0-flash-exp-image-generation", prompt)
    if result:
        return result

    # --- Option B: Nano Banana (paid tier) ---
    result = _try_generate_content(client, "gemini-2.5-flash-image", prompt)
    if result:
        return result

    # --- Option C: Imagen 4 (paid tier) ---
    try:
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1",
            ),
        )

        if response.images and len(response.images) > 0:
            generated = response.images[0]
            if generated.image and generated.image.image_bytes:
                return _save_image_bytes(generated.image.image_bytes)
        print("[ImageGen] Imagen 4 returned no image data")
    except Exception as e:
        print(f"[ImageGen] Imagen 4 failed: {e}")

    # --- Option D: Hardcoded fallback ---
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"


generate_food_image_tool = FunctionTool(func=generate_food_image)
