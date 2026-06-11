import logging
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Budget, Expense

logger = logging.getLogger(__name__)


def _current_month_bounds():
    now = datetime.now(timezone.utc)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def get_user_budgets(db: Session, user_id: int) -> list[dict]:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .order_by(Budget.category.asc())
        .all()
    )

    month_start, month_end = _current_month_bounds()

    spend_rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_date >= month_start,
            Expense.transaction_date < month_end,
        )
        .group_by(Expense.category)
        .all()
    )
    spend_map = {cat: total for cat, total in spend_rows}

    return [
        {
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "current_spend": round(spend_map.get(b.category, Decimal("0")), 2),
            "created_at": b.created_at.isoformat() if b.created_at else "",
        }
        for b in budgets
    ]


def get_user_budget_or_404(db: Session, user_id: int, budget_id: int) -> Budget:
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == user_id)
        .first()
    )
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with ID {budget_id} was not found. "
                   "It may have been deleted or you may not have access to it.",
        )
    return budget


def create_user_budget(
    db: Session, user_id: int, category: str, monthly_limit: Decimal
) -> Budget:
    existing = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.category == category)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A budget for the category '{category}' already exists. "
                   "Each category can only have one budget. Edit or delete the existing budget instead.",
        )

    budget = Budget(user_id=user_id, category=category, monthly_limit=monthly_limit)
    db.add(budget)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to create budget for user %d: %s", user_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the budget due to a database error. Please try again.",
        )
    db.refresh(budget)
    return budget


def update_user_budget(db: Session, budget: Budget, monthly_limit: Decimal) -> Budget:
    budget.monthly_limit = monthly_limit
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to update budget %d: %s", budget.id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update the budget due to a database error. Please try again.",
        )
    db.refresh(budget)
    return budget


def delete_user_budget(db: Session, budget: Budget) -> None:
    db.delete(budget)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to delete budget %d: %s", budget.id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete the budget due to a database error. Please try again.",
        )
