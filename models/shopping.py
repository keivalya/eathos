"""Pydantic models for shopping list generation (post-MVP)."""

from pydantic import BaseModel, Field
from typing import List, Optional


class ShoppingItem(BaseModel):
    """A single item on the shopping list."""
    name: str
    quantity: float
    unit: str
    category: str = Field(
        description="Category: produce, protein, dairy, grain, condiment, beverage, other"
    )
    reason: str = Field(
        description="Why this item is on the list — e.g., 'needed for recipe', "
        "'nutritional gap', 'running low'"
    )
    estimated_price: Optional[float] = Field(
        description="Estimated price in USD", default=None
    )


class ShoppingList(BaseModel):
    """Structured output from the Shopping Agent."""
    items: List[ShoppingItem]
    total_items: int
    estimated_total: Optional[float] = Field(
        description="Estimated total cost in USD", default=None
    )
    notes: Optional[str] = Field(
        description="Additional shopping tips or substitution suggestions",
        default=None,
    )
