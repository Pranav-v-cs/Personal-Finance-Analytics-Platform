from decimal import Decimal

from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    monthly_limit: Decimal = Field(gt=0, decimal_places=2)


class BudgetUpdate(BaseModel):
    monthly_limit: Decimal = Field(gt=0, decimal_places=2)


class BudgetResponse(BaseModel):
    id: int
    category: str
    monthly_limit: Decimal
    current_spend: Decimal = Decimal("0")
    created_at: str
