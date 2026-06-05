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


class CategoryMonthlyResponse(BaseModel):
    month: str
    category: str
    total_amount: Decimal

    model_config = ConfigDict(from_attributes=True)


class WeekdayAggregate(BaseModel):
    day: int
    total: float
    count: int
    avg: float


class AnomalyCandidate(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: str
    z_score: float


class LargestTransaction(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: str


class AnalyticsResponse(BaseModel):
    weekly_metrics: list[dict]
    weekday_aggregates: list[WeekdayAggregate]
    anomaly_candidates: list[AnomalyCandidate]
    largest_transactions: list[LargestTransaction]
