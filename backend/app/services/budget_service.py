from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Budget, Expense


def get_user_budgets(db: Session, user_id: int) -> list[dict]:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id)
        .order_by(Budget.category.asc())
        .all()
    )

    now = func.now()
    current_month_start = func.date(now, "start of month")
    current_month_end = func.date(now, "start of month", "+1 month", "-1 day")

    spend_rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0),
        )
        .filter(
            Expense.user_id == user_id,
            Expense.transaction_date >= current_month_start,
            Expense.transaction_date <= current_month_end,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
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
            detail=f"A budget for {category} already exists",
        )

    budget = Budget(user_id=user_id, category=category, monthly_limit=monthly_limit)
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


def update_user_budget(db: Session, budget: Budget, monthly_limit: Decimal) -> Budget:
    budget.monthly_limit = monthly_limit
    db.commit()
    db.refresh(budget)
    return budget


def delete_user_budget(db: Session, budget: Budget) -> None:
    db.delete(budget)
    db.commit()
