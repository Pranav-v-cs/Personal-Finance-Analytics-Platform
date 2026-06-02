from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Expense


def get_dashboard_summary(db: Session, user_id: int) -> dict:
    totals = (
        db.query(
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id)
        )
        .filter(Expense.user_id == user_id)
        .one()
    )

    category_rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id)
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(Expense.category.asc())
        .all()
    )

    return {
        "total_expenses": totals[0],
        "expense_count": totals[1],
        "category_breakdown": [
            {
                "category": category,
                "total_amount": total_amount,
                "expense_count": expense_count
            }
            for category, total_amount, expense_count in category_rows
        ]
    }


def get_monthly_spending(db: Session, user_id: int) -> list[dict]:
    month_rows = (
        db.query(
            func.strftime("%Y-%m", Expense.transaction_date),
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .filter(Expense.user_id == user_id)
        .group_by(func.strftime("%Y-%m", Expense.transaction_date))
        .order_by(func.strftime("%Y-%m", Expense.transaction_date).asc())
        .all()
    )

    return [
        {
            "month": month,
            "total_amount": total_amount
        }
        for month, total_amount in month_rows
        if month is not None
    ]
