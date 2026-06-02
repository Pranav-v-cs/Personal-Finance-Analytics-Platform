from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    MonthlySpendingResponse
)
from app.services.auth_service import get_current_user
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_monthly_spending
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
