"""Pydantic models for recipe generation output."""

from pydantic import BaseModel, Field
from typing import List, Optional


class Ingredient(BaseModel):
    """A single ingredient used in a recipe."""
    name: str
    quantity: float
    unit: str
    from_inventory: bool = Field(
        description="Whether this ingredient is in the user's inventory"
    )


class NutritionInfo(BaseModel):
    """Nutritional breakdown for a recipe."""
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class RecipeOutput(BaseModel):
    """Structured output from the Nutritionist agent."""
    title: str
    cuisine: str
    difficulty: str = Field(description="easy, medium, hard")
    prep_time_minutes: int
    cook_time_minutes: int
    servings: int
    ingredients: List[Ingredient]
    steps: List[str]
    reasoning: str = Field(
        description="Why this recipe was suggested — reference expiring items, "
        "nutritional balance, etc."
    )
    nutrition: NutritionInfo
    nutritional_gaps: Optional[str] = Field(
        description="What the user's inventory is lacking for balanced nutrition",
        default=None,
    )
