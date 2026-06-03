from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class CategoryBreakdownItem(BaseModel):
    category: str
    total_amount: Decimal
    expense_count: int


class DashboardCategoryResponse(BaseModel):
    category: str
    total: Decimal
    percent: Decimal


class DashboardTopCategoryResponse(BaseModel):
    category: str
    total: Decimal
    percent: Decimal


class DashboardSummaryResponse(BaseModel):
    total_expenses: Decimal
    expense_count: int
    avg_per_day: Decimal
    top_category: DashboardTopCategoryResponse | None
    category_breakdown: list[CategoryBreakdownItem]


class MonthlySpendingResponse(BaseModel):
    month: str
    total_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class DashboardRecentResponse(BaseModel):
    id: int
    title: str
    amount: Decimal
    category: str
    date: str
