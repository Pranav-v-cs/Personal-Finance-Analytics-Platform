from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CategoryBreakdownItem(BaseModel):
    category: str
    total_amount: Decimal
    expense_count: int


class DashboardSummaryResponse(BaseModel):
    total_expenses: Decimal
    expense_count: int
    category_breakdown: list[CategoryBreakdownItem]


class MonthlySpendingResponse(BaseModel):
    month: str
    total_amount: Decimal

    model_config = ConfigDict(from_attributes=True)
