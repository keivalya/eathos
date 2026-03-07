"""Pydantic models for food detection and inventory items."""

from pydantic import BaseModel, Field
from typing import List


class DetectedItem(BaseModel):
    """A single food item detected from a fridge image."""
    name: str = Field(description="Name of the food item")
    category: str = Field(
        description="Category: produce, protein, dairy, grain, condiment, beverage, other"
    )
    quantity: float = Field(description="Estimated quantity")
    unit: str = Field(description="Unit of measurement: count, grams, liters, etc.")
    freshness: str = Field(
        description="Freshness estimate: fresh, nearing_expiry, expired, unknown"
    )
    days_until_expiry: int = Field(
        description="Estimated days until expiry, -1 if unknown"
    )
    confidence: float = Field(description="Detection confidence from 0.0 to 1.0")


class FoodAnalyzerOutput(BaseModel):
    """Structured output from the Food Analyzer agent."""
    items: List[DetectedItem]
    total_items: int
    low_confidence_count: int = Field(
        description="Number of items with confidence < 0.7"
    )
