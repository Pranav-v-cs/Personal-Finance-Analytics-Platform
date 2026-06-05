from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate
from app.schemas.common import MessageResponse
from app.services.auth_service import get_current_user
from app.services.budget_service import (
    create_user_budget,
    delete_user_budget,
    get_user_budget_or_404,
    get_user_budgets,
    update_user_budget,
)

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_budgets(db, current_user.id)


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget_route(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = create_user_budget(db, current_user.id, data.category, data.monthly_limit)
    return {
        "id": budget.id,
        "category": budget.category,
        "monthly_limit": budget.monthly_limit,
        "current_spend": 0,
        "created_at": budget.created_at.isoformat() if budget.created_at else "",
    }


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget_route(
    budget_id: int,
    data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = get_user_budget_or_404(db, current_user.id, budget_id)
    updated = update_user_budget(db, budget, data.monthly_limit)
    return {
        "id": updated.id,
        "category": updated.category,
        "monthly_limit": updated.monthly_limit,
        "current_spend": 0,
        "created_at": updated.created_at.isoformat() if updated.created_at else "",
    }


@router.delete("/{budget_id}", response_model=MessageResponse)
def delete_budget_route(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = get_user_budget_or_404(db, current_user.id, budget_id)
    delete_user_budget(db, budget)
    return {"message": "Budget deleted"}
