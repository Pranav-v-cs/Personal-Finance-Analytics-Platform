from decimal import Decimal

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    target_amount: Decimal = Field(gt=0, decimal_places=2)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0, decimal_places=2)
    target_date: str | None = None


class GoalUpdate(BaseModel):
    current_amount: Decimal | None = Field(default=None, ge=0, decimal_places=2)
    target_amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    target_date: str | None = None


class GoalResponse(BaseModel):
    id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    target_date: str | None
    created_at: str
