"""FunctionTool for generating food images using Google Gemini / Imagen.

Supports two modes:
  1. Gemini "Nano Banana" (gemini-2.5-flash-image) — uses generate_content
  2. Imagen 4 (imagen-4.0-generate-001) — uses generate_images

Falls back to a hardcoded Unsplash URL if generation fails.

API key resolution order:
  1. GEMINI_IMAGE_API_KEY (dedicated key for image gen, e.g. paid tier)
  2. GEMINI_API_KEY / GOOGLE_API_KEY (auto-detected by genai.Client)
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
    """Save raw image bytes to disk and return the file path."""
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}.png"
    path = IMAGES_DIR / filename
    path.write_bytes(image_bytes)
    return str(path)


def _get_client() -> genai.Client:
    """Create a genai Client, preferring GEMINI_IMAGE_API_KEY if set."""
    image_key = os.getenv("GEMINI_IMAGE_API_KEY")
    if image_key:
        return genai.Client(api_key=image_key)
    return genai.Client()  # auto-detects from GEMINI_API_KEY etc.


def generate_food_image(recipe_title: str, cuisine: str) -> str:
    """Generates or fetches an appetizing food image for the given recipe.

    Uses Google Gemini Nano Banana (gemini-2.5-flash-image) as the primary
    generator, with Imagen 4 and hardcoded fallbacks.

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

    # --- Option A: Gemini Nano Banana (generate_content with image output) ---
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
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
        print("[ImageGen] Nano Banana returned no image parts")
    except Exception as e:
        print(f"[ImageGen] Nano Banana failed: {e}")

    # --- Option B: Imagen 4 (generate_images API) ---
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

    # --- Option C: Hardcoded fallback ---
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"


generate_food_image_tool = FunctionTool(func=generate_food_image)
