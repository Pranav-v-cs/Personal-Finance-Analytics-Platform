from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.dashboard import (
    AnalyticsResponse,
    CategoryMonthlyResponse,
    DashboardCategoryResponse,
    DashboardSummaryResponse,
    MonthlySpendingResponse,
    DashboardRecentResponse,
)
from app.services.auth_service import get_current_user
from app.services.dashboard_service import (
    get_analytics,
    get_category_monthly,
    get_dashboard_summary,
    get_monthly_spending,
    get_dashboard_categories,
    get_dashboard_recent,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse
)
def dashboard_summary_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(db, current_user.id)


@router.get(
    "/monthly",
    response_model=list[MonthlySpendingResponse]
)
def dashboard_monthly_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_monthly_spending(db, current_user.id)


@router.get(
    "/categories",
    response_model=list[DashboardCategoryResponse]
)
def dashboard_categories_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_categories(db, current_user.id)


@router.get(
    "/recent",
    response_model=list[DashboardRecentResponse]
)
def dashboard_recent_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_recent(db, current_user.id)


@router.get(
    "/category-monthly",
    response_model=list[CategoryMonthlyResponse],
)
def dashboard_category_monthly_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_monthly(db, current_user.id)


@router.get(
    "/analytics",
    response_model=AnalyticsResponse,
)
def dashboard_analytics_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics(db, current_user.id)
